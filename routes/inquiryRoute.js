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

router.get('/my-inquiries', async (req, res) => {
    try {
      const inquiries = await Inquiry.find();
      res.status(200).json(inquiries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch inquiries.' });
    }
  });

  // Express route to fetch inquiries based on username
// app.get('my-inquiries/:username', async (req, res) => {
//     try {
//       const inquiries = await Inquiry.find({ username: req.params.username });
//       res.json(inquiries);
//     } catch (error) {
//       console.error('Error fetching inquiries:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
  
  


module.exports = router;
