const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "12fit/products",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });
};

const getProducts = async (req, res) => {
  try {
    const search = req.query.search || "";

    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      shortDesc,
      category,
      description,
      usageTips,
      benefits,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await uploadImageToCloudinary(req.file.buffer);
      imageUrl = uploadedImage.secure_url;
    }

    let benefitsArray = [];

    if (Array.isArray(benefits)) {
      benefitsArray = benefits;
    } else if (typeof benefits === "string") {
      benefitsArray = benefits
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    const product = await Product.create({
      name,
      price,
      image: imageUrl,
      shortDesc,
      category,
      description,
      usageTips,
      benefits: benefitsArray,
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
    const {
      name,
      price,
      shortDesc,
      category,
      description,
      usageTips,
      benefits,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let imageUrl = oldProduct.image;

    if (req.file) {
      const uploadedImage = await uploadImageToCloudinary(req.file.buffer);
      imageUrl = uploadedImage.secure_url;
    }

    let benefitsArray = [];

    if (Array.isArray(benefits)) {
      benefitsArray = benefits;
    } else if (typeof benefits === "string") {
      benefitsArray = benefits
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        image: imageUrl,
        shortDesc,
        category,
        description,
        usageTips,
        benefits: benefitsArray,
      },
      { new: true }
    );

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
      return res.status(404).json({
        message: "Product not found",
      });
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