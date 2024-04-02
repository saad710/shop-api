const router = require("express").Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

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

// Validation middleware for registering new users
const registerValidation = [
    // Validate username
    body('username').notEmpty().withMessage('Username is required.'),
    // Validate email
    body('email').isEmail().withMessage('Invalid email format.').notEmpty().withMessage('Email is required.'),
    // Validate password
    body('password').notEmpty().withMessage('Password is required.'),
    // Validate profilePicture (file upload)
    body('profilePicture').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Profile picture is required.');
        }
        return true;
    })
];

// Route handler for user registration
router.post("/register", upload.single('profilePicture'), registerValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //new user
    const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
        profilePicture: req.file ? req.file.path : null
    });

    try {
        const savedUser = await newUser.save(); // Await the save operation
        const token = jwt.sign({ id: savedUser._id }, process.env.SECRET_KEY, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//login
router.post('/login',[
    body('email').isEmail().withMessage('Invalid email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password} = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        console.log({validPassword})
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // User authenticated, generate token
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
            expiresIn: 86400 // expires in 24 hours
        });

        // Send token as response
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;