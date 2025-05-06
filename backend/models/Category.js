// models/Category.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

const DB_PATH = path.join(__dirname, "../data/db.json");

class Category {
  static findAll() {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return data.categories || [];
    } catch (error) {
      console.error("Error reading database:", error);
      return [];
    }
  }

  static findById(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return (data.categories || []).find((category) => category.id === id);
    } catch (error) {
      console.error("Error reading database:", error);
      return null;
    }
  }

  static findBySlug(slug) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return (data.categories || []).find((category) => category.slug === slug);
    } catch (error) {
      console.error("Error reading database:", error);
      return null;
    }
  }

  static create(categoryData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

      // Generate ID and slug
      const id = uuidv4();
      const slug =
        categoryData.slug ||
        slugify(categoryData.name, { lower: true, strict: true });

      // Set default values
      const now = new Date().toISOString();
      const newCategory = {
        id,
        name: categoryData.name,
        slug,
        description: categoryData.description || "",
        createdAt: now,
        updatedAt: now,
      };

      // Add to database
      if (!data.categories) data.categories = [];
      data.categories.push(newCategory);

      // Save to database
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  static update(id, categoryData) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const categories = data.categories || [];
      const categoryIndex = categories.findIndex(
        (category) => category.id === id
      );

      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      // Update category
      const updatedCategory = {
        ...categories[categoryIndex],
        ...categoryData,
        updatedAt: new Date().toISOString(),
      };

      // Generate slug if name changed and slug not provided
      if (
        categoryData.name &&
        !categoryData.slug &&
        categoryData.name !== categories[categoryIndex].name
      ) {
        updatedCategory.slug = slugify(categoryData.name, {
          lower: true,
          strict: true,
        });
      }

      // Update in database
      categories[categoryIndex] = updatedCategory;
      data.categories = categories;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  }

  static delete(id) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const categories = data.categories || [];
      const categoryIndex = categories.findIndex(
        (category) => category.id === id
      );

      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      // Remove from database
      categories.splice(categoryIndex, 1);
      data.categories = categories;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Failed to delete category");
    }
  }
}

module.exports = Category;
