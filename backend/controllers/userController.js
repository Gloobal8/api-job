const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = (req, res) => {
  const users = db.get('users')
    .map(user => {
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    })
    .value();
  
  res.status(200).json(users);
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  
  const user = db.get('users')
    .find({ id })
    .value();
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Get education and experience data
  const education = db.get('education')
    .filter({ userId: id })
    .value();
  
  const experience = db.get('experience')
    .filter({ userId: id })
    .value();
  
  // Remove password from response and add education/experience
  const { password, ...userWithoutPassword } = user;
  const userWithDetails = {
    ...userWithoutPassword,
    education,
    experience
  };
  
  res.status(200).json(userWithDetails);
};

// Update user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  
  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if user is trying to update their own account or is an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to update this user' });
  }
  
  // Update user
  db.get('users')
    .find({ id })
    .assign({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      updatedAt: new Date().toISOString()
    })
    .write();
  
  // Get updated user
  const updatedUser = db.get('users')
    .find({ id })
    .value();
  
  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser;
  
  res.status(200).json({
    message: 'User updated successfully',
    user: userWithoutPassword
  });
};

// Change password
exports.changePassword = (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if user is trying to update their own password
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Unauthorized to change this user\'s password' });
  }
  
  // Verify current password
  const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  
  // Hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  
  // Update password
  db.get('users')
    .find({ id })
    .assign({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    })
    .write();
  
  res.status(200).json({ message: 'Password changed successfully' });
};

// Update education
exports.updateEducation = (req, res) => {
  const { id } = req.params;
  const { education } = req.body;

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user is updating their own education
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Unauthorized to update this user\'s education' });
  }

  // Update education
  db.get('users')
    .find({ id })
    .assign({
      education: education,
      updatedAt: new Date().toISOString()
    })
    .write();

  res.status(200).json({
    message: 'Education updated successfully',
    education: education
  });
};

// Update experience
exports.updateExperience = (req, res) => {
  const { id } = req.params;
  const { experience } = req.body;

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user is updating their own experience
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Unauthorized to update this user\'s experience' });
  }

  // Update experience
  db.get('users')
    .find({ id })
    .assign({
      experience: experience,
      updatedAt: new Date().toISOString()
    })
    .write();

  res.status(200).json({
    message: 'Experience updated successfully',
    experience: experience
  });
};

// Get user transactions
exports.getTransactions = (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user is requesting their own transactions or is an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to view these transactions' });
  }

  const transactions = db.get('transactions')
    .filter({ userId: id })
    .value();

  res.status(200).json({
    transactions: transactions
  });
};

// Update user credits
exports.updateCredits = (req, res) => {
  const { id } = req.params;
  const { credits, operation } = req.body;

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Only admin can update credits
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to update credits' });
  }

  const currentCredits = user.credits || 0;
  let newCredits = currentCredits;

  if (operation === 'add') {
    newCredits = currentCredits + credits;
  } else if (operation === 'subtract') {
    newCredits = Math.max(0, currentCredits - credits);
  }

  // Update credits
  db.get('users')
    .find({ id })
    .assign({
      credits: newCredits,
      updatedAt: new Date().toISOString()
    })
    .write();

  res.status(200).json({
    message: 'Credits updated successfully',
    credits: newCredits
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  
  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if user is trying to delete their own account or is an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to delete this user' });
  }
  
  // Delete user
  db.get('users')
    .remove({ id })
    .write();
  
  res.status(200).json({ message: 'User deleted successfully' });
};