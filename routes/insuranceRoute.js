const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/upload')

router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber } = req.body;
        const file = req.file.filename; // Get the filename of the uploaded file

        const newInsurance = new Insurance({ name, id, phoneNumber, file }); // Include file in the Insurance model
        await newInsurance.save();
        
        res.status(200).send({ message: "Claim submission successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

router,get('/')
s
module.exports = router;