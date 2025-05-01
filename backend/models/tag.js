// Tag model definition

const tagModel = {
  // Required fields
  id: String,
  name: String,
  createdAt: String,
  updatedAt: String,
  
  // Optional fields
  description: String,
  slug: String,
  
  // Meta fields
  isActive: Boolean,
  jobCount: Number // Number of jobs with this tag
};

const validateTag = (tag) => {
  // Basic validation
  if (!tag.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  tagModel,
  validateTag
};