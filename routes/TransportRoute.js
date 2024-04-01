const express = require('express');
const router = express.Router();
const booking = require('../models/TransportModel');
const Dregister = require('../models/TraDriverModel');
const Vregister = require('../models/TraVehicleModule')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");



// POST a new Booking
router.post('/TraBooking', async (req, res) => {
    try {
        
        const Booking = new booking (req.body);
        await Booking.save();
        res.status(200).send({ message: "Booking uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Booking upload unsuccessful.", success: false, error });
    }
});

router.get('/getTraBooking', async (req, res) => {
    try {
        const bookings = await booking.find(); 
        if (!bookings || bookings.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ bookings, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking.", success: false, error });
    }
});

 //read
 router.get('/getTraBooking2/:id', async (req, res) => {
     try {
         const { id } = req.params;
        const Booking = await booking.findById(id);
         if (!Booking) {
             return res.status(404).send({ message: "Announcement not found.", success: false });
         }
         res.status(200).send({Booking, success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
     }
 });

 // Update an Booking
 router.put('/updateTraBooking/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await booking.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        res.status(200).json({ success: true, message: "Booking updated successfully.", booking: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


// // DELETE Booking
 router.delete('/deletebooking/:id', async (req, res) => {
    try {
        const Booking = await booking.findByIdAndDelete(req.params.id);
         if (!Booking) {
             return res.status(404).send({ message: "Booking not found.", success: false });
         }
         res.status(200).send({ message: "Booking deleted successfully", success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to delete Booking.", success: false, error });
     }
 });


// Driver Register
router.post('/Driveregister', async (req, res) => {
    try {
        
        const Dregisters = new Dregister (req.body);
        await Dregisters.save();
        res.status(200).send({ message: "Booking uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Booking upload unsuccessful.", success: false, error });
    }
});

// Driver details read
router.get('/getDrivers', async (req, res) => {
    try {
        const Dregisters = await Dregister.find(); 
        if (!Dregisters || Dregisters.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ Dregisters, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking.", success: false, error });
    }
});

 //read
 router.get('/getDrivers2/:id', async (req, res) => {
    try {
        const { id } = req.params;
       const drivers = await Dregister.findById(id);
        if (!drivers) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({drivers, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
    }
});

// DELETE Drivers
router.delete('/deleteDriver/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDriver = await Dregister.findByIdAndDelete(id);
        if (!deletedDriver) {
            return res.status(404).send({ message: "Driver not found.", success: false });
        }
        res.status(200).send({ message: "Driver deleted successfully", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to delete Driver.", success: false, error });
    }
});


// vehicle Register
router.post('/Vehicleregister', async (req, res) => {
    try {
        
        const VehicleRegister = new Vregister (req.body);
        await VehicleRegister.save();
        res.status(200).send({ message: "Booking uploaded Successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Booking upload unsuccessful.", success: false, error });
    }
});
// vehicle details read
router.get('/getVehicles', async (req, res) => {
    try {
        const Vregisters = await Vregister.find(); 
        if (!Vregisters || Vregisters.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ Vregisters, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking.", success: false, error });
    }
});



module.exports = router;