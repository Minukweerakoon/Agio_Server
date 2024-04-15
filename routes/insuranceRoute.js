const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Serve files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber, description } = req.body;
        const file = req.file.filename; 

        const newInsurance = new Insurance({ name, id, phoneNumber, description, file }); 
        await newInsurance.save();
        
        // Send the ID of the newly created insurance entry in the response
        res.status(200).send({ message: "Claim submission successful.", success: true, insuranceId: newInsurance._id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

router.get('/getInsuranceEmployee', async (req, res) => {
    try {
        const userId = req.query.userId; // Extract userId from query parameter

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

router.put('/updateInsurance/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, file } = req.body;

        // Assuming Insurance is a Mongoose model
        const updatedInsurance = await Insurance.findOneAndUpdate(
            { id }, // Use the user ID directly without attempting to cast it to an ObjectId
            { name, phoneNumber, file },
            { new: true } // To return the updated document
        );

        if (!updatedInsurance) {
            return res.status(404).json({ success: false, message: "Insurance not found." });
        }

        res.json({ success: true, message: "Insurance updated successfully.", insurance: updatedInsurance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.get('/getInsurance', async (req, res) => {
    try {
        const insurance = await Insurance.find();
        if (!insurance || insurance.length === 0) {
            return res.status(404).send({ message: "No details found.", success: false });
        }
        res.status(200).send({ insurance, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve details.", success: false, error });
    }
});

router.get('/get-files', async (req, res) => {
    try {
        const files = await Insurance.find({}, 'file'); // Fetch only the 'file' field
        res.status(200).send({ status: "Ok", data: files });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "Error", message: "Failed to retrieve files" });
    }
});

router.get('/view-file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../uploads', fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ status: "Error", message: "Failed to read file" });
            }
            res.setHeader('Content-Type', 'application/pdf'); // Adjust content type as needed
            res.send(data);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "Error", message: "Internal server error" });
    }
});



module.exports = router;
