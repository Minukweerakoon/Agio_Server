const express = require('express');
const router = express.Router();
const Insurance = require('../models/insuranceModel');
const upload = require('../middleware/uploadInsurance');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware2');
const PDFDocument = require('pdfkit');
const Employee = require('../models/employeeModel');

// Serve files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Post the insurance data
router.post('/insClaimSubmit', upload.single('file'), async (req, res) => {
    try {
        const { name, id, phoneNumber, description } = req.body;
        const file = req.file.filename; 

        const insuranceID = `INS${Math.floor(1000 + Math.random() * 9000)}`;

        const newInsurance = new Insurance({ 
            insuranceID,
            name,
            id,
            phoneNumber,
            description,
            file
        }); 
        await newInsurance.save();

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const claimsSubmittedToday = await Insurance.countDocuments({ createdAt: { $gte: today } });

        const inssup = await Employee.findOne({isinsu:true})
        const unseenNotifications = inssup.unseenNotifications
        unseenNotifications.push({
            type:"New Claim request",
            message :`${ newInsurance.name} has submitted a Claim request`,
            data:{
                leaveid:newInsurance._id,
                name: newInsurance.name
            },
            onclickpath:"/"

        }

        )
        await Employee.findByIdAndUpdate(inssup._id,{unseenNotifications});
        res.status(200).send(
            {
                success:true,
                 message: "Claim submission successful.",
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Claim submission unsuccessful.", success: false, error });
    }
});

// Get the insurance data by id 
router.get('/getInsuranceEmployee/:userId',authMiddleware, async (req, res) => {
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

// Get the insurance data by id
router.get('/getInsuranceEmployee/:empid', authMiddleware, async (req, res) => {
    try {
        const empid = req.params.empid; 
        console.log(empid);

        if (!empid) {
            return res.status(400).send({ message: "Employee ID is required.", success: false });
        }

        const insuranceData = await Insurance.find({ id: empid }); // Assuming id in insuranceData matches empid
        if (!insuranceData) {
            return res.status(404).send({ message: "No insurance details found for the specified employee ID.", success: false });
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

// Update insurance method
router.put('/changeMethod/:id', async (req, res) => {
    const id = req.params.id;
    const { method } = req.body;

    try {
        const updatedInsurance = await Insurance.findByIdAndUpdate(
            id,
            { method }, 
            { new: true }
        );

        if (!updatedInsurance) {
            return res.status(404).json({ success: false, message: "Insurance not found." });
        }

        res.json({ success: true, message: `Insurance Method updated to ${method} successfully.`, insurance: updatedInsurance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Generate and download PDF for a specific record
router.get('/generate-pdf/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      const insuranceData = await Insurance.findOne({ id });
  
      if (!insuranceData) {
        return res.status(404).json({ success: false, message: 'Insurance data not found' });
      }
  
      const doc = new PDFDocument();

      const borderWidth = 10;
      doc.rect(borderWidth, borderWidth, doc.page.width - 2 * borderWidth, doc.page.height - 2 * borderWidth).stroke();
  
      doc.pipe(res);

      const logoPath = path.join(__dirname, '../images/logo.png');
      const logoData = fs.readFileSync(logoPath);

      const logoWidth = 100;

      const centerX = (doc.page.width - logoWidth) / 2;

      doc.image(logoData, centerX, 50, { width: logoWidth});

      doc.y = 150;

      doc.fontSize(24).text(`Insurance Claim Report for ${insuranceData.name}`, { align: 'center' });

      doc.moveDown();
      doc.moveDown();
      

       doc.fontSize(16).text(`Name                     : ${insuranceData.name}`).moveDown(0.5);
       doc.fontSize(16).text(`Employee ID          : ${insuranceData.id}`).moveDown(0.5);
       doc.fontSize(16).text(`Insurance Number : ${insuranceData.insuranceID}`).moveDown(0.5);
       doc.fontSize(16).text(`Phone Number      : ${insuranceData.phoneNumber}`).moveDown(0.5);
       doc.fontSize(16).text(`Description            : ${insuranceData.description}`).moveDown(0.5);
       doc.fontSize(16).text(`File                        : ${insuranceData.file}`).moveDown(0.5);
       doc.fontSize(16).text(`Status                    : ${insuranceData.status}`).moveDown(0.5);

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  });

  router.post('/generate-allpdf', async (req, res) => {
    try {
        const insuranceData = req.body.insuranceData;

        if (!insuranceData || insuranceData.length === 0) {
            return res.status(400).json({ success: false, message: 'No insurance data provided' });
        }

        const doc = new PDFDocument();

        doc.pipe(res);

        const borderWidth = 10;
        const borderColor = '#000000'; 
        doc.rect(borderWidth, borderWidth, doc.page.width - 2 * borderWidth, doc.page.height - 2 * borderWidth).stroke();

        doc.on('pageAdded', () => {
            doc.rect(borderWidth, borderWidth, doc.page.width - 2 * borderWidth, doc.page.height - 2 * borderWidth)
               .strokeColor(borderColor)
               .lineWidth(1)
               .stroke();
        });

        const logoPath = path.join(__dirname, '../images/logo.png');
        const logoData = fs.readFileSync(logoPath);

        const logoWidth = 100;

        const centerX = (doc.page.width - logoWidth) / 2;

        doc.image(logoData, centerX, 50, { width: logoWidth});

        doc.y = 150;

        doc.fontSize(24).text('Insurance Claims Report', { align: 'center' });
        doc.moveDown();

        insuranceData.forEach((data) => {
            doc.fontSize(16).text(`Name: ${data.name}`);
            doc.text(`Employee ID: ${data.id}`);
            doc.text(`Insurance Number: ${data.insuranceID}`);
            doc.text(`Phone Number: ${data.phoneNumber}`);
            doc.text(`Description: ${data.description}`);
            doc.text(`File: ${data.file}`);
            doc.text(`Status: ${data.status}`);
            doc.moveDown(); 
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
});


module.exports = router;