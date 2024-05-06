// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const cors = require('cors');
// const app = express();



// // Configure multer storage
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.join(__dirname, '../uploads'));
//     },
//     filename: function(req, file, cb) {
//         let ext = path.extname(file.originalname);
//         cb(null, Date.now() + ext);
//     }
// });

// // Create multer instance
// const upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, cb) {
//         const ext = path.extname(file.originalname);
//         if (ext !== '.mp4') {
//             return cb(new Error('Only MP4 files are allowed'));
//         }
//         cb(null, true);
//     }
// });


// // Serve static files from the 'uploads' directory


// module.exports = upload;