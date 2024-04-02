const router = require("express").Router()
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../middleware/verifyToken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const User = require("../models/User");

router.get('/details', verifyToken, (req,res)=> {
    const user = req.user;

    // Validate user object
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { _id, username, email, profilePicture, isAdmin } = user;
    res.status(200).json({
        _id,
        username,
        email,
        profilePicture,
        isAdmin
    });
})


//UPDATE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save uploads to 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Append current timestamp to file name
    }
});

// Filter file types (accept only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed.'), false);
    }
};

// Initialize multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Validation middleware for updating user data
const updateUserValidation = [
    // Validate email
    body('email').isEmail().withMessage('Invalid email format.'),
    // Validate username
    body('username').notEmpty().withMessage('Username is required.'),
    // Validate profilePicture (file upload)
    body('profilePicture').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Profile picture is required.');
        }
        return true;
    })
];

// Route handler for updating user data
router.put('/:id', verifyTokenAndAuthorization, upload.single('profilePicture'), updateUserValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Update user data
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//change_password
const changePasswordValidation = [
    // Validate Old password
    body('oldPassword').notEmpty().withMessage('Old Password is required.'),
    // Validate New password
    body('newPassword').notEmpty().withMessage('New Password is required.'),
    // Validate Confirm password
    body('confirmPassword').notEmpty().withMessage('Confirm Password is required.'),
];

// Route for changing password
router.put('/change-password/:id', verifyTokenAndAuthorization, changePasswordValidation, async(req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (confirmPassword !== newPassword) {
        return res.status(422).json('Confirm password and New Password must match');
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { password: hashedNewPassword }, { new: true });
        
        res.status(200).json(updatedUser);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;