/**
 * @api {get} /api/companies Get all companies
 * @apiName GetAllCompanies
 * @apiGroup Companies
 * @apiQuery {String} [industry] Filter by industry
 * @apiQuery {String} [location] Filter by location
 * @apiQuery {String} [search] Search in name and description
 * @apiQuery {Boolean} [featured] Filter featured companies
 * @apiQuery {Number} [page=1] Page number for pagination
 * @apiQuery {Number} [limit=10] Number of items per page
 *
 * @api {get} /api/companies/:id Get company by ID
 * @apiName GetCompanyById
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 *
 * @api {post} /api/companies Create new company
 * @apiName CreateCompany
 * @apiGroup Companies
 * @apiBody {String} name Company name
 * @apiBody {String} [industry] Company industry
 * @apiBody {String} [location] Company location
 * @apiBody {Number} [employeeCount] Number of employees
 * @apiBody {Number} [foundedYear] Year company was founded
 * @apiBody {Object} [socialMedia] Social media links
 * @apiBody {Array} [benefits] Company benefits
 * @apiBody {Object} [culture] Company culture details
 *
 * @api {put} /api/companies/:id Update company
 * @apiName UpdateCompany
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 *
 * @api {delete} /api/companies/:id Delete company
 * @apiName DeleteCompany
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 *
 * @api {get} /api/companies/:id/analytics Get company analytics
 * @apiName GetCompanyAnalytics
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 * 
 * @api {get} /api/companies/:id/export Export company data
 * @apiName ExportCompanyData
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 * 
 * @api {post} /api/companies/:id/import Import company data
 * @apiName ImportCompanyData
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 * @apiBody {Object} data Company data to import
 * 
 * @api {put} /api/companies/:id/profile Update company profile
 * @apiName UpdateCompanyProfile
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 * @apiBody {Object} profileData Company profile data
 * 
 * @api {get} /api/companies/:id/predictions Get predictive analytics
 * @apiName GetPredictiveAnalytics
 * @apiGroup Companies
 * @apiParam {String} id Company unique ID
 */

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

// Company Controller methods
const getAllCompanies = (req, res) => {
  try {
    const db = readDB();
    
    // Support for filtering
    let companies = [...db.companies];
    
    // Filter by query parameters
    const { industry, location, search, featured } = req.query;
    
    if (industry) {
      companies = companies.filter(company => company.industry === industry);
    }
    
    if (location) {
      companies = companies.filter(company => company.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (search) {
      companies = companies.filter(company => 
        company.name.toLowerCase().includes(search.toLowerCase()) || 
        (company.description && company.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (featured === 'true') {
      companies = companies.filter(company => company.isFeatured);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {
      totalCompanies: companies.length,
      totalPages: Math.ceil(companies.length / limit),
      currentPage: page,
      companies: companies.slice(startIndex, endIndex)
    };
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error while fetching companies' });
  }
};

const getCompanyById = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Increment view count
    company.views = (company.views || 0) + 1;
    writeDB(db);
    
    // Get company's jobs
    const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
    
    // Return company with its jobs
    res.status(200).json({
      ...company,
      jobs: companyJobs
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Server error while fetching company' });
  }
};

const createCompany = (req, res) => {
  try {
    const db = readDB();
    
    // Check if user is authenticated and has permission
    if (!req.user || (req.user.role !== 'employer' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to create companies' });
    }
    
    // Validate required fields
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    
    // Check if user already has a company
    if (req.user.role === 'employer') {
      const existingCompany = db.companies.find(company => company.userId === req.user.id);
      if (existingCompany) {
        return res.status(400).json({ message: 'You already have a company registered' });
      }
    }
    
    // Create new company
    const newCompany = {
      id: uuidv4(),
      ...req.body,
      userId: req.user.id,
      isVerified: false,
      isFeatured: false,
      views: 0,
      employeeCount: req.body.employeeCount || 0,
      foundedYear: req.body.foundedYear || null,
      socialMedia: req.body.socialMedia || {},
      benefits: req.body.benefits || [],
      culture: req.body.culture || {},
      ratings: [],
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.companies.push(newCompany);
    
    // Update user with companyId
    const userIndex = db.users.findIndex(user => user.id === req.user.id);
    if (userIndex !== -1) {
      db.users[userIndex].companyId = newCompany.id;
    }
    
    writeDB(db);
    
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error while creating company' });
  }
};

const updateCompany = (req, res) => {
  try {
    const db = readDB();
    const companyIndex = db.companies.findIndex(company => company.id === req.params.id);
    
    if (companyIndex === -1) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const company = db.companies[companyIndex];
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this company' });
    }
    
    // Update company
    const updatedCompany = {
      ...company,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Don't allow changing userId or verification status unless admin
    if (!isAdmin) {
      updatedCompany.userId = company.userId;
      updatedCompany.isVerified = company.isVerified;
    }
    
    db.companies[companyIndex] = updatedCompany;
    writeDB(db);
    
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error while updating company' });
  }
};

const deleteCompany = (req, res) => {
  try {
    const db = readDB();
    const companyIndex = db.companies.findIndex(company => company.id === req.params.id);
    
    if (companyIndex === -1) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const company = db.companies[companyIndex];
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this company' });
    }
    
    // Remove company
    db.companies.splice(companyIndex, 1);
    
    // Remove associated jobs
    db.jobs = db.jobs.filter(job => job.company.id !== req.params.id);
    
    // Update user's companyId
    if (isOwner) {
      const userIndex = db.users.findIndex(user => user.id === req.user.id);
      if (userIndex !== -1) {
        db.users[userIndex].companyId = null;
      }
    }
    
    writeDB(db);
    
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error while deleting company' });
  }
};

// New methods for company analytics and data management
const getCompanyAnalytics = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view company analytics' });
    }
    
    // Get applications for company jobs
    const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
    const jobIds = companyJobs.map(job => job.id);
    const applications = db.applications.filter(app => jobIds.includes(app.jobId));
    
    // Calculate analytics
    const analytics = {
      totalJobs: companyJobs.length,
      activeJobs: companyJobs.filter(job => job.status === 'active').length,
      totalApplications: applications.length,
      applicationsByStatus: {
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        interviewing: applications.filter(app => app.status === 'interviewing').length,
        offered: applications.filter(app => app.status === 'offered').length,
        hired: applications.filter(app => app.status === 'hired').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      },
      jobViews: companyJobs.reduce((total, job) => total + (job.views || 0), 0),
      companyViews: company.views || 0,
      applicationRate: companyJobs.length > 0 
        ? (applications.length / companyJobs.length).toFixed(2) 
        : 0,
      responseTime: company.responseTime || 0,
      averageRating: company.averageRating || 0,
      // Time-based metrics could be added here
      monthlyViews: company.monthlyViews || 0
    };
    
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({ message: 'Server error while fetching company analytics' });
  }
};

const exportCompanyData = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to export company data' });
    }
    
    // Get company's jobs and applications
    const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
    const jobIds = companyJobs.map(job => job.id);
    const applications = db.applications.filter(app => jobIds.includes(app.jobId));
    
    // Prepare export data
    const exportData = {
      company,
      jobs: companyJobs,
      applications
    };
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=company-${company.id}-export.json`);
    
    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting company data:', error);
    res.status(500).json({ message: 'Server error while exporting company data' });
  }
};

const importCompanyData = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to import company data' });
    }
    
    // Validate import data
    const { data } = req.body;
    if (!data || !data.company) {
      return res.status(400).json({ message: 'Invalid import data' });
    }
    
    // Update company data while preserving ID and owner
    const companyIndex = db.companies.findIndex(c => c.id === company.id);
    if (companyIndex !== -1) {
      // Preserve critical fields
      const preservedFields = {
        id: company.id,
        userId: company.userId,
        createdAt: company.createdAt
      };
      
      // Update with imported data but keep preserved fields
      db.companies[companyIndex] = {
        ...data.company,
        ...preservedFields,
        updatedAt: new Date().toISOString()
      };
      
      // Handle jobs if included
      if (data.jobs && Array.isArray(data.jobs)) {
        // Remove existing jobs for this company
        db.jobs = db.jobs.filter(job => !job.company || job.company.id !== company.id);
        
        // Add imported jobs with new IDs
        data.jobs.forEach(job => {
          const newJobId = uuidv4();
          db.jobs.push({
            ...job,
            id: newJobId,
            company: { id: company.id, name: company.name },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      }
      
      writeDB(db);
      
      res.status(200).json({ 
        message: 'Company data imported successfully',
        company: db.companies[companyIndex]
      });
    } else {
      res.status(500).json({ message: 'Failed to import company data' });
    }
  } catch (error) {
    console.error('Error importing company data:', error);
    res.status(500).json({ message: 'Server error while importing company data' });
  }
};

const updateCompanyProfile = (req, res) => {
  try {
    const db = readDB();
    const companyIndex = db.companies.findIndex(company => company.id === req.params.id);
    
    if (companyIndex === -1) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const company = db.companies[companyIndex];
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this company profile' });
    }
    
    // Update profile specific fields
    const updatedCompany = {
      ...company,
      name: req.body.name || company.name,
      description: req.body.description || company.description,
      website: req.body.website || company.website,
      industry: req.body.industry || company.industry,
      size: req.body.size || company.size,
      founded: req.body.founded || company.founded,
      location: req.body.location || company.location,
      address: req.body.address || company.address,
      socialLinks: req.body.socialLinks || company.socialLinks,
      logo: req.body.logo || company.logo,
      coverImage: req.body.coverImage || company.coverImage,
      culture: req.body.culture || company.culture,
      benefits: req.body.benefits || company.benefits,
      workEnvironment: req.body.workEnvironment || company.workEnvironment,
      technologies: req.body.technologies || company.technologies,
      keyProjects: req.body.keyProjects || company.keyProjects,
      updatedAt: new Date().toISOString()
    };
    
    db.companies[companyIndex] = updatedCompany;
    writeDB(db);
    
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Server error while updating company profile' });
  }
};

const getCompanyStats = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get company's jobs
    const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
    
    // Calculate basic stats
    const stats = {
      totalJobs: companyJobs.length,
      views: company.views || 0,
      activeJobs: companyJobs.filter(job => job.status === 'active').length,
      featuredJobs: companyJobs.filter(job => job.isFeatured).length,
      averageRating: company.averageRating || 0,
      employeeCount: company.employeeCount || 0,
      yearsFounded: company.founded ? new Date().getFullYear() - company.founded : 0
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ message: 'Server error while fetching company stats' });
  }
};

// New method for predictive analytics
const getPredictiveAnalytics = (req, res) => {
  try {
    const db = readDB();
    const company = db.companies.find(company => company.id === req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if user is authorized
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && company.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access predictive analytics' });
    }
    
    // Get company's jobs
    const companyJobs = db.jobs.filter(job => job.company && job.company.id === company.id);
    const jobIds = companyJobs.map(job => job.id);
    const applications = db.applications.filter(app => jobIds.includes(app.jobId));
    
    // Simple predictive analytics based on historical data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate growth rate based on previous data
    const previousMonthViews = company.previousMonthViews || Math.floor(company.monthlyViews * 0.8);
    const viewsGrowthRate = company.monthlyViews > 0 ? (company.monthlyViews - previousMonthViews) / previousMonthViews : 0.1;
    
    // Predict next month views
    const predictedViews = Math.round(company.monthlyViews * (1 + viewsGrowthRate));
    
    // Predict application rate
    const currentApplicationRate = applications.length / (companyJobs.length || 1);
    const predictedApplicationRate = Math.min(currentApplicationRate * 1.05, currentApplicationRate + 0.5);
    
    // Predict optimal job posting times
    const applicationsByDay = [12, 15, 20, 18, 25, 10, 5]; // Mock data
    const bestDayToPost = applicationsByDay.indexOf(Math.max(...applicationsByDay)) + 1;
    
    // Prepare prediction data
    const predictions = {
      nextMonthViews: predictedViews,
      predictedApplicationRate: parseFloat(predictedApplicationRate.toFixed(2)),
      bestDayToPost: bestDayToPost, // 1-7 for Monday-Sunday
      estimatedHiringTimeInDays: 15 + Math.round(Math.random() * 10), // Mock data
      potentialGrowthAreas: [
        'Technical Skills',
        'Marketing Positions',
        'Remote Work'
      ],
      marketTrends: {
        increasingDemand: ['Remote Work', 'AI Specialists', 'Data Analysis'],
        decreasingDemand: ['Office Administration', 'Entry Level Sales']
      }
    };
    
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error generating predictive analytics:', error);
    res.status(500).json({ message: 'Server error while generating predictive analytics' });
  }
};

// Export controller methods
module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyAnalytics,
  exportCompanyData,
  importCompanyData,
  updateCompanyProfile,
  getCompanyStats,
  getPredictiveAnalytics
};