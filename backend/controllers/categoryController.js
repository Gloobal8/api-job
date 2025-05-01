// Category Controller
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper to read/write to JSON file
const DB_PATH = path.join(__dirname, '../data/db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { jobs: [], companies: [], users: [], categories: [], applications: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Category Controller methods
const getAllCategories = (req, res) => {
  try {
    const db = readDB();
    
    // Support for filtering
    let categories = [...db.categories];
    
    // Filter by query parameters
    const { active, search } = req.query;
    
    if (active === 'true') {
      categories = categories.filter(category => category.isActive);
    }
    
    if (search) {
      categories = categories.filter(category => 
        category.name.toLowerCase().includes(search.toLowerCase()) || 
        (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Higher limit for categories
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      totalCategories: categories.length,
      totalPages: Math.ceil(categories.length / limit),
      currentPage: page,
      categories: categories.slice(startIndex, endIndex)
    };
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

const getCategoryById = (req, res) => {
  try {
    const db = readDB();
    const category = db.categories.find(category => category.id === req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get jobs in this category
    const categoryJobs = db.jobs.filter(job => job.category === category.id);
    
    // Return category with its jobs
    res.status(200).json({
      ...category,
      jobs: categoryJobs
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

const createCategory = (req, res) => {
  try {
    const db = readDB();
    
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create categories' });
    }
    
    // Validate required fields
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Create new category
    const newCategory = {
      id: uuidv4(),
      name,
      description: req.body.description || '',
      icon: req.body.icon || '',
      slug: req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      parentId: req.body.parentId || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      order: req.body.order || 0,
      jobCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.categories.push(newCategory);
    writeDB(db);
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

const updateCategory = (req, res) => {
  try {
    const db = readDB();
    const categoryIndex = db.categories.findIndex(category => category.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update categories' });
    }
    
    const category = db.categories[categoryIndex];
    
    // Update category
    const updatedCategory = {
      ...category,
      name: req.body.name || category.name,
      description: req.body.description !== undefined ? req.body.description : category.description,
      icon: req.body.icon !== undefined ? req.body.icon : category.icon,
      slug: req.body.slug || category.slug,
      parentId: req.body.parentId !== undefined ? req.body.parentId : category.parentId,
      isActive: req.body.isActive !== undefined ? req.body.isActive : category.isActive,
      order: req.body.order !== undefined ? req.body.order : category.order,
      updatedAt: new Date().toISOString()
    };
    
    db.categories[categoryIndex] = updatedCategory;
    writeDB(db);
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

const deleteCategory = (req, res) => {
  try {
    const db = readDB();
    const categoryIndex = db.categories.findIndex(category => category.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete categories' });
    }
    
    // Check if category is in use
    const isInUse = db.jobs.some(job => job.category === req.params.id);
    
    if (isInUse) {
      return res.status(400).json({ message: 'Cannot delete category that is in use by jobs' });
    }
    
    // Remove category
    db.categories.splice(categoryIndex, 1);
    writeDB(db);
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

// Export controller methods
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};