// Job application routes
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// All application routes are protected
router.get('/', authMiddleware.verifyToken, applicationController.getAllApplications);
router.get('/:id', authMiddleware.verifyToken, applicationController.getApplicationById);
router.post('/', authMiddleware.verifyToken, applicationController.createApplication);
router.put('/:id', authMiddleware.verifyToken, applicationController.updateApplication);
router.delete('/:id', authMiddleware.verifyToken, applicationController.deleteApplication);

module.exports = router;