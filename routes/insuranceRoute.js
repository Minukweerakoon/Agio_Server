const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/uploadInsurance');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware2');

// Serve files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Post the insurance data
router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber, description } = req.body;
        const file = req.file.filename; 

        const newInsurance = new Insurance({ name, id, phoneNumber, description, file }); 
        await newInsurance.save();
        res.status(200).send({ message: "Claim submission successful.", success: true, userId: id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

// Get the insurance data by id 
router.get('/getInsuranceEmployee/:userId', authMiddleware,async (req, res) => {
    try {
        const userId = req.params.userId; 
        console.log(userId);

        if (!userId) {
            return res.status(400).send({ message: "User ID is required.", success: false });
        }

        const insuranceData = await Insurance.find({ id: userId });
        console.log(insuranceData);
        if (!insuranceData) {
            return res.status(404).send({ message: "No insurance details found for the specified user ID.", success: false });
        }

        res.status(200).send({ insuranceData, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve insurance details.", success: false, error });
    }
});

// Get all the insurance data
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

// Get the file
router.get('/view-file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../uploads', fileName);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ status: "Error", message: "Failed to read file" });
            }
            res.setHeader('Content-Type', 'application/pdf'); 
            res.send(data);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "Error", message: "Internal server error" });
    }
});

// Update insurance data
router.put('/updateInsurance/:id', async (req, res) => {
    const id = req.params.id;
    const { name, phoneNumber, description, file} = req.body;
  
    try {
        
        const updatedinsurance = await Insurance.findByIdAndUpdate(
            id,
            { name, phoneNumber, description, file },
            { new: true}
        );

        if (!updatedinsurance) {
            return res.status(404).json({ success: false, message: "Insurance not found." });
        }

        res.json({ success: true, message: "Insurance Claim Requset updated successfully.", insurance: updatedinsurance});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
  });

  
// Delete insurance data
router.delete('/deleteInsurance/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const insuranceData = await Insurance.findByIdAndDelete(req.params.id);
  
      if (!insuranceData) {
        return res.status(404).json({ success: false, message: "Insurance data not found." });
      }
  
      res.status(200).send({ message: "Claim Requset deleted successfully", success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to delete claim request.", success: false, error });
    }
});

// Update insurance status
router.put('/changeStatus/:id', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    try {
        const updatedInsurance = await Insurance.findByIdAndUpdate(
            id,
            { status }, 
            { new: true }
        );

        if (!updatedInsurance) {
            return res.status(404).json({ success: false, message: "Insurance not found." });
        }

        res.json({ success: true, message: `Insurance status updated to ${status} successfully.`, insurance: updatedInsurance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


module.exports = router;