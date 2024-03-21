const express = require('express');
const router = express.Router();
const Announcement = require('../models/AnnHRSupervisorModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");



// POST a new announcement
router.post('/AnnHRsup', async (req, res) => {
    try {
        
        const announcement = new Announcement (req.body);
        await announcement.save();
        res.status(200).send({ message: "Announcement uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Announcement upload unsuccessful.", success: false, error });
    }
});

//read
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
// Update an announcement
router.put('/updateAnnHRsup/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({ message: "Announcement updated successfully", success: true, announcement });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to update announcement.", success: false, error });
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
