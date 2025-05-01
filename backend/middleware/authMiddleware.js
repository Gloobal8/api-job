const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get the token from the request header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = db.get('users').find({ id: decoded.id }).value();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is an employer
const isEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied. Employer role required.' });
  }
  
  next();
};

// Middleware to check if user is a job seeker
const isJobSeeker = (req, res, next) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Access denied. Job seeker role required.' });
  }
  
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

module.exports = {
  verifyToken,
  isEmployer,
  isJobSeeker,
  isAdmin,
  protect: verifyToken,  // Alias para compatibilidad
  admin: isAdmin,        // Alias para compatibilidad
  authenticateJWT: verifyToken  // Alias para compatibilidad con routes/packages.js
};