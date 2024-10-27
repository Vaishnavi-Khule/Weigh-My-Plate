const express = require('express');
const foodController = require('../controller/foodController');

const router = express.Router();

router.get('/getAllFood',foodController.getAllFood);
router.post('/addFood',foodController.addFood);

module.exports = router; 