// Job Skill model definition

const jobSkillModel = {
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
  order: Number,
  jobCount: Number // Number of jobs requiring this skill
};

const validateJobSkill = (skill) => {
  // Basic validation
  if (!skill.name) {
    return false;
  }
  
  return true;
};

module.exports = {
  jobSkillModel,
  validateJobSkill
};