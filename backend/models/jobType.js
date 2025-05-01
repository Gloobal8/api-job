// Job Type model definition

const jobTypeModel = {
  // Required fields
  id: String,
  name: String, // Full-time, Part-time, Remote, Contract, etc.
  createdAt: String,
  updatedAt: String,
  
  // Optional fields
  description: String,
  slug: String,
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  jobCount: Number // Number of jobs with this type
};

const validateJobType = (type) => {
  // Basic validation
  if (!type.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  jobTypeModel,
  validateJobType
};