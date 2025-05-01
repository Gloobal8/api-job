// Job Application Controller
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper to read/write to JSON file
const DB_PATH = path.join(__dirname, '../data/db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { jobs: [], companies: [], users: [], categories: [], applications: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Job Application Controller methods
const getAllApplications = (req, res) => {
  try {
    const db = readDB();
    
    // Only admin can see all applications
    // Employers can see applications for their jobs
    // Candidates can see their own applications
    let applications = [];
    
    if (req.user.role === 'admin') {
      applications = db.applications;
    } else if (req.user.role === 'employer') {
      // Get employer's company
      const company = db.companies.find(company => company.userId === req.user.id);
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found for this employer' });
      }
      
      // Get jobs for this company
      const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
      const companyJobIds = companyJobs.map(job => job.id);
      
      // Get applications for these jobs
      applications = db.applications.filter(app => companyJobIds.includes(app.jobId));
    } else if (req.user.role === 'candidate') {
      // Get candidate's applications
      applications = db.applications.filter(app => app.userId === req.user.id);
    } else {
      return res.status(403).json({ message: 'Not authorized to view applications' });
    }
    
    // Filter by query parameters
    const { jobId, status } = req.query;
    
    if (jobId) {
      applications = applications.filter(app => app.jobId === jobId);
    }
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      totalApplications: applications.length,
      totalPages: Math.ceil(applications.length / limit),
      currentPage: page,
      applications: applications.slice(startIndex, endIndex)
    };
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

const getApplicationById = (req, res) => {
  try {
    const db = readDB();
    const application = db.applications.find(app => app.id === req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCandidate = req.user.role === 'candidate' && application.userId === req.user.id;
    
    let isEmployer = false;
    if (req.user.role === 'employer') {
      // Get employer's company
      const company = db.companies.find(company => company.userId === req.user.id);
      
      if (company) {
        // Get jobs for this company
        const job = db.jobs.find(job => job.id === application.jobId);
        isEmployer = job && job.company && job.company.id === company.id;
      }
    }
    
    if (!isAdmin && !isCandidate && !isEmployer) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    // Get related job and user data
    const job = db.jobs.find(job => job.id === application.jobId);
    const user = db.users.find(user => user.id === application.userId);
    
    // Return application with job and user data
    res.status(200).json({
      ...application,
      job: job || { message: 'Job not found' },
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        resume: user.resume,
        skills: user.skills,
        jobTitle: user.jobTitle,
        experience: user.experience,
        education: user.education,
        workHistory: user.workHistory
      } : { message: 'User not found' }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
};

const createApplication = (req, res) => {
  try {
    const db = readDB();
    
    // Check if user is authenticated and is a candidate
    if (!req.user || req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply for jobs' });
    }
    
    // Validate required fields
    const { jobId, coverLetter } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    
    // Check if job exists
    const job = db.jobs.find(job => job.id === jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user already applied for this job
    const existingApplication = db.applications.find(
      app => app.jobId === jobId && app.userId === req.user.id
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Create new application
    const newApplication = {
      id: uuidv4(),
      jobId,
      userId: req.user.id,
      status: 'Applied',
      coverLetter: coverLetter || '',
      resume: req.body.resume || '',
      expectedSalary: req.body.expectedSalary || null,
      availableFrom: req.body.availableFrom || null,
      isRead: false,
      notes: '',
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.applications.push(newApplication);
    
    // Update job application count
    const jobIndex = db.jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      db.jobs[jobIndex].applications = (db.jobs[jobIndex].applications || 0) + 1;
    }
    
    writeDB(db);
    
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Server error while creating application' });
  }
};

const updateApplication = (req, res) => {
  try {
    const db = readDB();
    const applicationIndex = db.applications.findIndex(app => app.id === req.params.id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = db.applications[applicationIndex];
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCandidate = req.user.role === 'candidate' && application.userId === req.user.id;
    
    let isEmployer = false;
    if (req.user.role === 'employer') {
      // Get employer's company
      const company = db.companies.find(company => company.userId === req.user.id);
      
      if (company) {
        // Get job for this application
        const job = db.jobs.find(job => job.id === application.jobId);
        isEmployer = job && job.company && job.company.id === company.id;
      }
    }
    
    if (!isAdmin && !isCandidate && !isEmployer) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Different update permissions for different roles
    let updatedApplication = { ...application };
    
    if (isCandidate) {
      // Candidates can only update their cover letter, resume, expected salary, and availability
      updatedApplication = {
        ...application,
        coverLetter: req.body.coverLetter !== undefined ? req.body.coverLetter : application.coverLetter,
        resume: req.body.resume !== undefined ? req.body.resume : application.resume,
        expectedSalary: req.body.expectedSalary !== undefined ? req.body.expectedSalary : application.expectedSalary,
        availableFrom: req.body.availableFrom !== undefined ? req.body.availableFrom : application.availableFrom,
        updatedAt: new Date().toISOString()
      };
    } else if (isEmployer || isAdmin) {
      // Employers and admins can update status, notes, rating, and isRead
      updatedApplication = {
        ...application,
        status: req.body.status !== undefined ? req.body.status : application.status,
        notes: req.body.notes !== undefined ? req.body.notes : application.notes,
        rating: req.body.rating !== undefined ? req.body.rating : application.rating,
        isRead: req.body.isRead !== undefined ? req.body.isRead : application.isRead,
        updatedAt: new Date().toISOString()
      };
    }
    
    db.applications[applicationIndex] = updatedApplication;
    writeDB(db);
    
    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error while updating application' });
  }
};

const deleteApplication = (req, res) => {
  try {
    const db = readDB();
    const applicationIndex = db.applications.findIndex(app => app.id === req.params.id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = db.applications[applicationIndex];
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCandidate = req.user.role === 'candidate' && application.userId === req.user.id;
    
    if (!isAdmin && !isCandidate) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }
    
    // Remove application
    db.applications.splice(applicationIndex, 1);
    
    // Update job application count
    const jobIndex = db.jobs.findIndex(job => job.id === application.jobId);
    if (jobIndex !== -1 && db.jobs[jobIndex].applications > 0) {
      db.jobs[jobIndex].applications -= 1;
    }
    
    writeDB(db);
    
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error while deleting application' });
  }
};

// Export controller methods
module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};