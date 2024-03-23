const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');

router.post('/insClaimSubmit' , async(req, res) => {

    try {
        const newInsurance = new Insurance(req.body); 
        await newInsurance.save();
        res.status(200).send({ message: "Claim submission successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
})

module.exports = router;