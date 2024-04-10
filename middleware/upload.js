const path = require('path')
const multer = require('multer')
const express = require('express');
const app = express()


const storage = multer.diskStorage({
    destination: function(req,file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer ({
    storage: storage
})


module.exports = upload