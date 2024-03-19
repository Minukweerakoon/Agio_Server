const express = require('express');
const router = express.Router();
const Announcement = require('../models/AnnHRSupervisorModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

 // Adjust the path as necessary

// Middleware for logging request paths and methods
// router.use((req, res, next) => {
//     console.log(req.path, req.method);
//     next();
// });

// GET all announcements
// router.get('/', async (req, res) => {
//     try {
//         const announcements = await AnnHRSupervisorModel.find();
//         res.status(200).json(announcements);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// POST a new announcement
router.post('/AnnHRsup', async (req, res) => {
    try {
        
        const announcement = new Announcement (req.body);
        await announcement.save();
        res.status(200).send({ message: "Announcement uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Announcement upload unsuccessful.", success: false, error });
    }
});


// // GET a specific announcement by ID
// router.get('/:id', getAnnouncement, (req, res) => {
//     res.json(res.announcement);
// });

// // UPDATE a specific announcement by ID
// router.patch('/:id', getAnnouncement, async (req, res) => {
//     if (req.body.name != null) {
//         res.announcement.name = req.body.name;
//     }
//     // Add other properties here as necessary

//     try {
//         const updatedAnnouncement = await res.announcement.save();
//         res.json(updatedAnnouncement);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // DELETE a specific announcement by ID
// router.delete('/:id', getAnnouncement, async (req, res) => {
//     try {
//         await res.announcement.remove();
//         res.json({ message: 'Deleted Announcement' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Middleware to get announcement by ID
// async function getAnnouncement(req, res, next) {
//     let announcement;
//     try {
//         announcement = await AnnHRSupervisorModel.findById(req.params.id);
//         if (announcement == null) {
//             return res.status(404).json({ message: 'Cannot find announcement' });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }

//     res.announcement = announcement;
//     next();
// }

module.exports = router;
