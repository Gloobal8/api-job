const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Define path to JSON storage
const dbPath = path.join(__dirname, '../data');
const experienceFile = path.join(dbPath, 'experience.json');

// Ensure directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Ensure experience file exists
if (!fs.existsSync(experienceFile)) {
  fs.writeFileSync(experienceFile, JSON.stringify([]));
}

const experienceModel = {
  id: String,
  userId: String,
  company: String,
  position: String,
  location: String,
  startDate: String,
  endDate: String,
  currentlyWorking: Boolean,
  description: String,
  achievements: [String],
  technologies: [String],
  createdAt: String,
  updatedAt: String
};

// Read all experience records
const getAllExperience = () => {
  try {
    const data = fs.readFileSync(experienceFile);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading experience file:', error);
    return [];
  }
};

// Get experience records by user ID
const getExperienceByUserId = (userId) => {
  const experienceRecords = getAllExperience();
  return experienceRecords.filter(record => record.userId === userId);
};

// Get experience record by ID
const getExperienceById = (id) => {
  const experienceRecords = getAllExperience();
  return experienceRecords.find(record => record.id === id);
};

// Create a new experience record
const createExperience = (experienceData) => {
  try {
    const experienceRecords = getAllExperience();
    
    const newExperience = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...experienceData
    };
    
    experienceRecords.push(newExperience);
    fs.writeFileSync(experienceFile, JSON.stringify(experienceRecords, null, 2));
    
    return newExperience;
  } catch (error) {
    console.error('Error creating experience record:', error);
    return null;
  }
};

// Update experience record
const updateExperience = (id, experienceData) => {
  try {
    const experienceRecords = getAllExperience();
    const index = experienceRecords.findIndex(record => record.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedExperience = {
      ...experienceRecords[index],
      ...experienceData,
      updatedAt: new Date().toISOString()
    };
    
    experienceRecords[index] = updatedExperience;
    fs.writeFileSync(experienceFile, JSON.stringify(experienceRecords, null, 2));
    
    return updatedExperience;
  } catch (error) {
    console.error('Error updating experience record:', error);
    return null;
  }
};

// Delete experience record
const deleteExperience = (id) => {
  try {
    const experienceRecords = getAllExperience();
    const filteredRecords = experienceRecords.filter(record => record.id !== id);
    
    if (filteredRecords.length === experienceRecords.length) {
      return false;
    }
    
    fs.writeFileSync(experienceFile, JSON.stringify(filteredRecords, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting experience record:', error);
    return false;
  }
};

// Validate experience data
const validateExperience = (data) => {
  if (!data.userId || !data.company || !data.position || !data.startDate) {
    return false;
  }
  
  return true;
};

module.exports = {
  experienceModel,
  getAllExperience,
  getExperienceByUserId,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  validateExperience
};