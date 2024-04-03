const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true},
    desc: { type: String, required: true, },
    images: [{ type: String, required: true }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);