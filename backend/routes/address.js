const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/addresses", verifyToken, addressController.getUserAddresses);
router.post("/address", verifyToken, addressController.createAddress);
router.put("/address/:id", verifyToken, addressController.updateAddress);
router.delete("/address/:id", verifyToken, addressController.deleteAddress);

module.exports = router;
