const express = require('express');
const router = express.Router();
const Announcement = require('../models/AnnHRSupervisorModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require('../middleware/upload');


const multer = require('multer');

  
  
  
  // Adjust your POST route to handle file upload
  router.post('/AnnHRsup', upload.single('file'), async (req, res) => {
    try {
        // const fileData = req.file ? {
        //     filePath: req.file.path,
        //     originalName: req.file.originalname
        // } : {};
        const file = req.file.filename; 
        
        // Create a new announcement with the request body and file information
        const announcement = new Announcement({
            ...req.body,
            file: fileData ? [fileData] : [],file// Assuming you might have multiple files in the future
        });

        await announcement.save();
        res.status(200).send({ message: "Announcement uploaded Successfully", success: true, announcement });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Announcement upload unsuccessful.", success: false, error });
    }
});


router.get('/getAnnHRsup', async (req, res) => {
    try {
        const announcements = await Announcement.find();
        if (!announcements || announcements.length === 0) {
            return res.status(404).send({ message: "No announcements found.", success: false });
        }
        res.status(200).send({ announcements, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve announcements.", success: false, error });
    }
});

//read
router.get('/getAnnHRsup2/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({ announcement, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
    }
});
// Update an announcement
router.put('/updateAnnHRsup/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
        if(!updatedAnnouncement) {
            return res.status(404).json({ success: false, message: "Announcement not found." });
        }
        res.json({ success: true, message: "Announcement updated successfully.", announcement: updatedAnnouncement });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


// DELETE an announcement
router.delete('/deleteAnnHRsup/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({ message: "Announcement deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to delete announcement.", success: false, error });
    }
});







module.exports = router;
