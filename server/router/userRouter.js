const express = require('express');
const userController = require('../controller/userController');
const verifyToken = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/registerUser',userController.registerUser);
router.post('/loginUser',userController.loginUser);
router.post('/forgotPassword',userController.forgotPassword);
router.use(verifyToken);
router.get('/getUserProfile',userController.getUserProfile);
router.post('/editUserProfile',userController.editUserProfile);

module.exports = router; 