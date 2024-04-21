const router = require("express").Router();
const multer = require("multer");


const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"../Per_uploads");
        
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }    
})
const upload = multer({
    storage,
})

router.route("/uploadexcel").post(upload.single("csvFile"),(req,res)=>{
    res.json("OK");
})

module.exports =router;