const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const authMiddleware2 = require("../middleware/authMiddleware2");

router.post("/leaveHRsup", async (req, res) => {
    try {
        
        const newLeave = new Leave(req.body); // Use User model for consistency
        await newLeave.save();

        res.status(200).send({ message: "Leave submission successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Leave submission unsuccessful.", success: false, error });
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


module.exports = router;