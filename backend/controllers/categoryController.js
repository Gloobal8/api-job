const Category = require("../models/Category");
const Post = require("../models/Post");

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = Category.findAll();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving categories",
      error: error.message,
    });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving category",
      error: error.message,
    });
  }
};

// Get a single category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = Category.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving category",
      error: error.message,
    });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create categories",
      });
    }

    // Create category
    const newCategory = Category.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update categories",
      });
    }

    const category = Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update category
    const updatedCategory = Category.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete categories",
      });
    }

    const category = Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category is in use
    const posts = Post.findAll({ categoryId: req.params.id });
    if (posts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that is in use by posts",
      });
    }

    // Delete category
    Category.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
