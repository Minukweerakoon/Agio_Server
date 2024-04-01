const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware2");
const Leave = require('../models/leaveModel');
const authMiddleware2 = require("../middleware/authMiddleware2");

router.post("/leaveEmpform", async (req, res) => {
    try {
        
        const newLeave = new Leave(req.body); // Use User model for consistency
        await newLeave.save();

        res.status(200).send({ message: "Leave submission successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Leave submission unsuccessful.", success: false, error });
    }
});

router.get('/getleave', async (req, res) => {
    try {
        const leave = await Leave.find();
        if (!leave || leave.length === 0) {
            return res.status(404).send({ message: "No leave details found.", success: false });
        }
        res.status(200).send({ leave, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve leave details.", success: false, error });
    }
});


module.exports = router;