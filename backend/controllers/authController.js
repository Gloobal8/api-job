const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth')
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');

// Register a new user
exports.register = async (req, res) => {
  
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Create new user
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role, // 'jobseeker' or 'employer'
    isAuthenticated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const data = await Auth.register(newUser)
  res.status(data.status ? 201 : 400).json(data);
  return console.log(data)
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Login Model
  const data = await Auth.login({ email, password });
  console.log({
    archive: 'authController.js',
    data
  })
  res.status(201).json(data);
  return console.log(data)

  // const user = db.get('users').find({ email }).value();
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

// Get All
exports.getAllUsers = async (req, res) => {
  // User information is attached to the request by the auth middleware
  const users = await User.getAllUsers();
  res.status(201).json(users)
  
};

exports.verifyEmail = (req, res) => {
  const token = req.body.token;
  console.log(req)
  console.log({
    archive: 'authController.js',
    data: 'Confirm your email',
    token
  })

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    console.log('Test2')
    if (err) {
      console.log({
        status: 'expired',
        archive: 'authController.js'
      })
      return res.status(201).send({
        type: 'expired',
        message: 'Invalid or expired verification token.',
        status: false
      });
    }

    const email = decoded.to;
    console.log({
      archive: 'authController.js',
      data: 'Verification',
      email
    })
    const userModel = await User.verifyEmail(email)

    res.status(201).json(userModel);

    console.log({
      archive: 'authController.js',
      data: userModel
    })
  });
}
exports.resendVerification = async (req, res) => {
  const email = req.body.email;
  console.log({
    archive: 'authController.js',
    email
  })

  const data = await User.resendVerification(email)

  res.status(201).json(data);

  console.log({
    archive: 'authController.js',
    data
  })

}
