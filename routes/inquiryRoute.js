const express = require("express");
const router = express.Router();
const Inquiry = require('../models/inquiryModel');


router.post('/inquiry', async (req, res) => {
    try {
        
        const inquiry = new Inquiry (req.body);
        await inquiry.save();
        res.status(200).send({ message: "Inquiry uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Inquiry upload unsuccessful.", success: false, error });
    }
});


module.exports = router;
