const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();



// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

// Create multer instance
const upload = multer({
    storage: storage
});

// Serve static files from the 'uploads' directory


module.exports = upload;