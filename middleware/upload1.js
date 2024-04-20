const path = require('path');
const multer = require('multer');
const express = require('express');
const app = express();
app.use("/files", express.static("files"));

const storage = multer.diskStorage({
    destination: function(req,file, cb) {
        cb(null, 'uploads1/')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})



const upload = multer ({
    storage: storage
})

module.exports = upload