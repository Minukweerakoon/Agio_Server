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

router.get('/employee/:EmployeeID', async (req, res) => {
    const { EmployeeID } = req.params;
  
    try {
      const employee = await EmployeeModel.findOne({ EmployeeID });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee", error });
    }
});

module.exports = router;