const router = require("express").Router()
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../middleware/verifyToken");
const { body, validationResult } = require('express-validator');
const Product = require("../models/Product");
const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep original filename
  }
});

// Filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/', verifyTokenAndAdmin, upload.array('images', 10), [
  // Express Validator middleware for body validation
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('desc').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('categories').isArray({ min: 1 }).withMessage('Categories are required and must be an array with at least one element'),
], async (req,res) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    return res.status(422).json({errors: errors.array()})
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images were uploaded.' });
  }

  const images = req.files.map((file) => file.path)
  try{
    const newProduct = new Product({
      ...req.body,
      images:images
    })
    const savedProduct = await newProduct.save()
    res.status(200).json(savedProduct)
  }
  catch(err){
    res.status(500).json(err)
  }
}
)

router.put('/:id', verifyTokenAndAdmin, upload.array('images', 10), [
  // Express Validator middleware for body validation
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('desc').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('categories').isArray({ min: 1 }).withMessage('Categories are required and must be an array with at least one element'),
], async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
      }
  
      const productId = req.params.id;
  try {
    // Check if product with provided id exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product details
    existingProduct.title = req.body.title;
    existingProduct.desc = req.body.desc;
    existingProduct.price = req.body.price;
    existingProduct.categories = req.body.categories;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.path);
      existingProduct.images = images;
    }

    // Save updated product to the database
    const updatedProduct = await existingProduct.save();
    
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
  const productId = req.params.id;
  try {
    const singleProduct = await Product.findById(productId);
    if (!singleProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(singleProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', verifyTokenAndAdmin, async (req,res)=> {
  const productId = req.params.id
  try{
    const deletedProduct = await Product.findByIdAndDelete(productId)
    res.status(200).json("successfully deleted")
  }
  catch(err){
    res.status(500).json(err)
  }

})

module.exports = router;