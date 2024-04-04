const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/upload')

router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber } = req.body;
        const file = req.file.filename; 

        const newInsurance = new Insurance({ name, id, phoneNumber, file }); 
        await newInsurance.save();
        
        res.status(200).send({ message: "Claim submission successful.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

router.get('/employee/:id', async (req, res) => {
  const { id } = req.params;

  try {

      const insurance = await Insurance.findOne({ id });
      if (!insurance) {
          return res.status(404).json({ message: "Insurance data not found" });
      }
      
      res.json(insurance);
  } catch (error) {
      res.status(500).json({ message: "Failed to fetch insurance data", error });
  }
});

module.exports = router;