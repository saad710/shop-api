const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

const router = require("express").Router();

//Create
router.post("/", verifyToken, async (req, res) => {
    // Extract userId from the authenticated user's information
    const userId = req.user.id;
  
    try {
      // Create a new order instance with the extracted userId
      const newOrder = new Order({ ...req.body, userId });
  
      // Save the order to the database
      const savedOrder = await newOrder.save();
  
      // Return the saved order as the response
      res.status(201).json(savedOrder);
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: "Internal server error", error: err });
    }
});

//Update_for_admin
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (err) {
      res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.status(200).json("Order has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
});
  
//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.params.userId });
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
});


module.exports = router;