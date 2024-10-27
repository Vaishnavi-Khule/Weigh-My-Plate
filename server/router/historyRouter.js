const express = require('express');
const historyController = require('../controller/historyController');
const verifyToken = require('../middleware/jwtAuth');
const multer = require("multer");
const fs = require('fs');

const router = express.Router();

// To access file use : localhost:3080/original/filename

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/original';
    
        // Check if the "uploads" directory exists, and create it if it doesn't
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
    
        cb(null, uploadDir);
      },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
    },
  })

  const uploadStorage = multer({ storage: storage })

// upload image with add histoory if user is logged in
router.post('/uploadAndGetResult',uploadStorage.single("file"),historyController.uploadAndGetResult);
router.use(verifyToken);
router.get('/getAllHistoryByUserId',historyController.getAllHistoryByUserId);
module.exports = router; 