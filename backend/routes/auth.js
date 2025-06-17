const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

//api check
router.get('/', (req, res) => {
  res.send('API running');
});

//send
router.post('/send-otp', controller.sendOtp);

//check
router.post('/verify-otp', controller.verifyOtp);

module.exports = router;