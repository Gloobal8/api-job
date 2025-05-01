// Index file for all models

const { jobModel, validateJob } = require('./job');
const { companyModel, validateCompany } = require('./company');
const { userModel, validateUser } = require('./user');
const { jobCategoryModel, validateJobCategory } = require('./jobCategory');
const { jobTypeModel, validateJobType } = require('./jobType');
const { jobSkillModel, validateJobSkill } = require('./jobSkill');
const { careerLevelModel, validateCareerLevel } = require('./careerLevel');
const { jobApplicationModel, validateJobApplication } = require('./jobApplication');
const { jobExperienceModel, validateJobExperience } = require('./jobExperience');
const { tagModel, validateTag } = require('./tag');
const { packageModel, validatePackage } = require('./package');
const { locationModel, validateLocation } = require('./location');

module.exports = {
  // Models
  jobModel,
  companyModel,
  userModel,
  jobCategoryModel,
  jobTypeModel,
  jobSkillModel,
  careerLevelModel,
  jobApplicationModel,
  jobExperienceModel,
  tagModel,
  packageModel,
  locationModel,
  
  // Validators
  validateJob,
  validateCompany,
  validateUser,
  validateJobCategory,
  validateJobType,
  validateJobSkill,
  validateCareerLevel,
  validateJobApplication,
  validateJobExperience,
  validateTag,
  validatePackage,
  validateLocation
};