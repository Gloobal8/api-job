// Job Controller
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

// Job Controller methods
const getAllJobs = (req, res) => {
  try {
    const db = readDB();
    
    // Support for filtering
    let jobs = [...db.jobs];
    
    // Filter by query parameters
    const { category, type, location, company, skill, search, featured } = req.query;
    
    if (category) {
      jobs = jobs.filter(job => job.category === category);
    }
    
    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }
    
    if (location) {
      jobs = jobs.filter(job => job.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (company) {
      jobs = jobs.filter(job => job.company.name.toLowerCase().includes(company.toLowerCase()));
    }
    
    if (skill) {
      jobs = jobs.filter(job => job.skills && job.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
    }
    
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) || 
        job.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (featured === 'true') {
      jobs = jobs.filter(job => job.isFeatured);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      totalJobs: jobs.length,
      totalPages: Math.ceil(jobs.length / limit),
      currentPage: page,
      jobs: jobs.slice(startIndex, endIndex)
    };
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
};

const getJobById = (req, res) => {
  try {
    const db = readDB();
    const job = db.jobs.find(job => job.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Increment view count
    job.views = (job.views || 0) + 1;
    writeDB(db);
    
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
};

const createJob = (req, res) => {
  try {
    const db = readDB();
    
    // Check if user is authenticated and has permission
    if (!req.user || (req.user.role !== 'employer' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to create jobs' });
    }
    
    // Validate required fields
    const { title, description, company, location, type } = req.body;
    if (!title || !description || !company || !location || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create new job
    const newJob = {
      id: uuidv4(),
      ...req.body,
      status: 'Active',
      views: 0,
      applications: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.jobs.push(newJob);
    writeDB(db);
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
};

const updateJob = (req, res) => {
  try {
    const db = readDB();
    const jobIndex = db.jobs.findIndex(job => job.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user is authorized
    const job = db.jobs[jobIndex];
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && req.user.role === 'employer' && 
                    job.company && job.company.id && 
                    req.user.companyId === job.company.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    // Update job
    const updatedJob = {
      ...job,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    db.jobs[jobIndex] = updatedJob;
    writeDB(db);
    
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
};

const deleteJob = (req, res) => {
  try {
    const db = readDB();
    const jobIndex = db.jobs.findIndex(job => job.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user is authorized
    const job = db.jobs[jobIndex];
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && req.user.role === 'employer' && 
                    job.company && job.company.id && 
                    req.user.companyId === job.company.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    // Remove job
    db.jobs.splice(jobIndex, 1);
    writeDB(db);
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
};

// Export controller methods
module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};