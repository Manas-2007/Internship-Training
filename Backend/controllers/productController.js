const Product = require("../models/Product");
const Category = require("../models/Category");
const Deal = require("../models/Deal");

exports.getHomeData = async (req, res) => {
  try {
    const [categories, deals, products] = await Promise.all([
      Category.find().limit(10),
      Deal.find().limit(5),
      Product.find().limit(20),
    ]);
    res.status(200).json({ categories, deals, products });
  } catch (error) {
    console.error("Home data error:", error);
    res.status(500).json({ message: "Error fetching home data" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("productId");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error("Product detail error:", error);
    res.status(500).json({ message: "Error fetching product details" });
  }
};
