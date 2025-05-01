const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Register a new user
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Validate input
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if email already exists
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use' });
  }
  
  // Create new user
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role, // 'jobseeker' or 'employer'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save user to database
  db.get('users')
    .push(newUser)
    .write();
  
  // Return success message
  res.status(201).json({ 
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
};

// User login
exports.login = (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Find user by email
  const user = db.get('users').find({ email }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check password
  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Invalid password' });
  }
  
  // Generate JWT token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRATION) // 24 hours
  });
  
  // Return user info and token
  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
};

// Get current user info
exports.getCurrentUser = (req, res) => {
  // User information is attached to the request by the auth middleware
  const user = req.user;
  
  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
};