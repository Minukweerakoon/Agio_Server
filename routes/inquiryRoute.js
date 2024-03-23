const express = require("express");
const router = express.Router();
const Inquiry = require('../models/inquiryModel');

router.post("/inquiry", async (req, res) => {
    try {
        const newInquiry = new Inquiry(req.body);
        await newInquiry.save();
        res.status(200).send({ message: "Inquiry submission successful.", success: true });
    } catch (error) {
        console.error("Error processing inquiry:", error); // Log the error
        res.status(500).send({ message: "Inquiry submission unsuccessful.", success: false, error });
    }
});

module.exports = router;
