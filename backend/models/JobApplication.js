// Job Application model definition

class JobApplication {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.jobId = data.jobId;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.resume = data.resume;
    this.coverLetter = data.coverLetter;
    this.status = data.status || 'Applied';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

const validateJobApplication = (application) => {
  // Basic validation
  if (!application.jobId || !application.userId) {
    return false;
  }
  
  return true;
};

async save() {
  const fs = require('fs').promises;
  const path = require('path');
  const filePath = path.join(__dirname, 'applications.json');
    
  try {
    let applications = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      applications = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty
    }
      
    const index = applications.findIndex(app => app.id === this.id);
    if (index !== -1) {
      applications[index] = this;
    } else {
      applications.push(this);
    }
      
    await fs.writeFile(filePath, JSON.stringify(applications, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving application:', error);
    return false;
  }
}

static async getAll() {
  const fs = require('fs').promises;
  const path = require('path');
  const filePath = path.join(__dirname, 'applications.json');
    
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const applications = JSON.parse(data);
    return applications.map(app => new JobApplication(app));
  } catch (error) {
    return [];
  }
}

static async getById(id) {
  const fs = require('fs').promises;
  const path = require('path');
  const filePath = path.join(__dirname, 'applications.json');
    
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const applications = JSON.parse(data);
    const application = applications.find(app => app.id === id);
    return application ? new JobApplication(application) : null;
  } catch (error) {
    return null;
  }
}

module.exports = JobApplication;;