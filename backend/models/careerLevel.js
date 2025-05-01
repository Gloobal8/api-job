// Career Level model definition

const careerLevelModel = {
  // Required fields
  id: String,
  name: String, // Entry Level, Mid Level, Senior, Executive, etc.
  createdAt: String,
  updatedAt: String,
  
  // Optional fields
  description: String,
  slug: String,
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  jobCount: Number // Number of jobs at this career level
};

const validateCareerLevel = (level) => {
  // Basic validation
  if (!level.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  careerLevelModel,
  validateCareerLevel
};