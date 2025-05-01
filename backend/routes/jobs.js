// Job routes
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);

// Protected routes
router.post("/", verifyToken, jobController.createJob);
router.put("/:id", verifyToken, jobController.updateJob);
router.delete("/:id", verifyToken, jobController.deleteJob);

module.exports = router;
