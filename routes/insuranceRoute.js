const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/upload');

router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber } = req.body;
        const file = req.file.filename; 

        const newInsurance = new Insurance({ name, id, phoneNumber, file }); 
        await newInsurance.save();
        
        // Send the ID of the newly created insurance entry in the response
        res.status(200).send({ message: "Claim submission successful.", success: true, insuranceId: newInsurance._id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

router.get('/getInsurance', async (req, res) => {
    try {
        const userId = req.query.userid; // Extract userId from query parameter

        if (!userId) {
            return res.status(400).send({ message: "User ID is required.", success: false });
        }

        // Fetch insurance data based on the provided user ID
        const insuranceData = await Insurance.findOne({ id: userId });

        if (!insuranceData) {
            return res.status(404).send({ message: "No insurance details found for the specified user ID.", success: false });
        }

        res.status(200).send({ insuranceData, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve insurance details.", success: false, error });
    }
});

module.exports = router;
