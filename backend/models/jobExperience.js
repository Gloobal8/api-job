// Job Experience model definition

const jobExperienceModel = {
  // Required fields
  id: String,
  name: String, // No Experience, 1-2 Years, 3-5 Years, 5+ Years, etc.
  createdAt: String,
  updatedAt: String,
  
  // Optional fields
  description: String,
  slug: String,
  
  // Meta fields
  isActive: Boolean,
  order: Number,
  jobCount: Number // Number of jobs with this experience requirement
};

const validateJobExperience = (experience) => {
  // Basic validation
  if (!experience.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  jobExperienceModel,
  validateJobExperience
};