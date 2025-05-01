const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Define path to JSON storage
const dbPath = path.join(__dirname, '../data');
const educationFile = path.join(dbPath, 'education.json');

// Ensure directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Ensure education file exists
if (!fs.existsSync(educationFile)) {
  fs.writeFileSync(educationFile, JSON.stringify([]));
}

const educationModel = {
  id: String,
  userId: String,
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  description: String,
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    expiryDate: String
  }],
  courses: [{
    name: String,
    provider: String,
    completionDate: String
  }],
  createdAt: String,
  updatedAt: String
};

// Read all education records
const getAllEducation = () => {
  try {
    const data = fs.readFileSync(educationFile);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading education file:', error);
    return [];
  }
};

// Get education records by user ID
const getEducationByUserId = (userId) => {
  const educationRecords = getAllEducation();
  return educationRecords.filter(record => record.userId === userId);
};

// Get education record by ID
const getEducationById = (id) => {
  const educationRecords = getAllEducation();
  return educationRecords.find(record => record.id === id);
};

// Create a new education record
const createEducation = (educationData) => {
  try {
    const educationRecords = getAllEducation();
    
    const newEducation = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...educationData
    };
    
    educationRecords.push(newEducation);
    fs.writeFileSync(educationFile, JSON.stringify(educationRecords, null, 2));
    
    return newEducation;
  } catch (error) {
    console.error('Error creating education record:', error);
    return null;
  }
};

// Update education record
const updateEducation = (id, educationData) => {
  try {
    const educationRecords = getAllEducation();
    const index = educationRecords.findIndex(record => record.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedEducation = {
      ...educationRecords[index],
      ...educationData,
      updatedAt: new Date().toISOString()
    };
    
    educationRecords[index] = updatedEducation;
    fs.writeFileSync(educationFile, JSON.stringify(educationRecords, null, 2));
    
    return updatedEducation;
  } catch (error) {
    console.error('Error updating education record:', error);
    return null;
  }
};

// Delete education record
const deleteEducation = (id) => {
  try {
    const educationRecords = getAllEducation();
    const filteredRecords = educationRecords.filter(record => record.id !== id);
    
    if (filteredRecords.length === educationRecords.length) {
      return false;
    }
    
    fs.writeFileSync(educationFile, JSON.stringify(filteredRecords, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting education record:', error);
    return false;
  }
};

// Validate education data
const validateEducation = (data) => {
  if (!data.userId || !data.institution || !data.degree || !data.startDate) {
    return false;
  }
  
  return true;
};

module.exports = {
  educationModel,
  getAllEducation,
  getEducationByUserId,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  validateEducation
};