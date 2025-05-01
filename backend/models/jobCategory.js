// Job Category model definition

const jobCategoryModel = {
  // Required fields
  id: String,
  name: String,
  createdAt: String,
  updatedAt: String,
  
  // Optional fields
  description: String,
  icon: String,
  slug: String,
  parentId: String, // For hierarchical categories
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  jobCount: Number // Number of jobs in this category
};

const validateJobCategory = (category) => {
  // Basic validation
  if (!category.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  jobCategoryModel,
  validateJobCategory
};