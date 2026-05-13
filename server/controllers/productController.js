const Product = require("../models/Product");
const { isEmpty, isPositiveNumber } = require("../utils/validators");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (isEmpty(name) || isEmpty(price) || isEmpty(category)) {
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    if (!isPositiveNumber(price)) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    const product = await Product.create({
      name,
      price,
      category,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Insert error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (req.body.price && !isPositiveNumber(req.body.price)) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};