const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// Rutas para módulos
router.get('/modules', moduleController.getAllModules);
router.post('/modules/create', moduleController.createModule);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

module.exports = router; 