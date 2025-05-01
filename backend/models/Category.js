const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the file that will store the categories
const dataPath = path.join(__dirname, '../data/categories.json');

// Ensure the data directory and file exist
if (!fs.existsSync(path.dirname(dataPath))) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
}

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

class Category {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.slug = data.slug || this.generateSlug(data.name);
    this.description = data.description || '';
    this.parentId = data.parentId || null; // For hierarchical categories
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate category data
  static validateCategory(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate a slug from the name
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim();
  }

  // Ensure the slug is unique
  static ensureUniqueSlug(slug, id = null) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    let isUnique = true;
    let counter = 1;
    let newSlug = slug;

    while (!isUnique) {
      isUnique = !categories.some(category => category.slug === newSlug && category.id !== id);
      if (!isUnique) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    return newSlug;
  }

  // Get all categories
  static findAll() {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    return categories;
  }

  // Get a category by ID
  static findById(id) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    return categories.find(category => category.id === id);
  }

  // Get a category by slug
  static findBySlug(slug) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    return categories.find(category => category.slug === slug);
  }

  // Create a new category
  static create(data) {
    const validation = this.validateCategory(data);
    if (!validation.valid) {
      throw new Error(`Invalid category data: ${validation.errors.join(', ')}`);
    }

    const categories = JSON.parse(fs.readFileSync(dataPath));
    
    // Ensure slug is unique
    data.slug = this.ensureUniqueSlug(data.slug || this.prototype.generateSlug(data.name));
    
    const newCategory = new Category(data);
    categories.push(newCategory);
    
    fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2));
    return newCategory;
  }

  // Update a category
  static update(id, data) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    // If name is being updated, regenerate slug
    if (data.name && data.name !== categories[index].name) {
      data.slug = this.ensureUniqueSlug(
        data.slug || this.prototype.generateSlug(data.name),
        id
      );
    }
    
    // Update the category
    const updatedCategory = {
      ...categories[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    categories[index] = updatedCategory;
    fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2));
    
    return updatedCategory;
  }

  // Delete a category
  static delete(id) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    // Check if this category is a parent to other categories
    const hasChildren = categories.some(category => category.parentId === id);
    if (hasChildren) {
      throw new Error('Cannot delete a category that has child categories');
    }
    
    categories.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2));
    
    return { success: true };
  }

  // Get child categories
  static getChildren(parentId) {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    return categories.filter(category => category.parentId === parentId);
  }

  // Get parent category
  static getParent(id) {
    const category = this.findById(id);
    if (!category || !category.parentId) {
      return null;
    }
    
    return this.findById(category.parentId);
  }

  // Get full category path (breadcrumb)
  static getPath(id) {
    const result = [];
    let currentCategory = this.findById(id);
    
    while (currentCategory) {
      result.unshift(currentCategory);
      if (currentCategory.parentId) {
        currentCategory = this.findById(currentCategory.parentId);
      } else {
        currentCategory = null;
      }
    }
    
    return result;
  }

  // Get category tree (hierarchical structure)
  static getTree() {
    const categories = JSON.parse(fs.readFileSync(dataPath));
    const rootCategories = categories.filter(category => !category.parentId);
    
    const buildTree = (parentId) => {
      const children = categories.filter(category => category.parentId === parentId);
      return children.map(child => ({
        ...child,
        children: buildTree(child.id)
      }));
    };
    
    return rootCategories.map(root => ({
      ...root,
      children: buildTree(root.id)
    }));
  }
}

module.exports = Category;