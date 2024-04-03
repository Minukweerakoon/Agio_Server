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
      res.status(200).json({ success: true, message: "Booking updated successfully.", Booking: updatedBooking });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  });


// DELETE Booking
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

// read driver register
router.get('/getdrivers', async (req, res) => {
    try {
        const drivers = await Dregister.find(); 
        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ drivers, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking.", success: false, error });
    }
});

//read
router.get('/getdrivers2/:id', async (req, res) => {
    try {
        const { id } = req.params;
       const Dregisters = await Dregister.findById(id);
        if (!Dregisters) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({Dregisters, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
    }
});

// Update Driver

router.put('/updatedrivers/:id', async (req, res) => {
   try {
     const { id } = req.params;
     const updatedDrivers = await Dregister.findByIdAndUpdate(id, req.body, { new: true });
     if (!updatedDrivers) {
       return res.status(404).json({ success: false, message: "Booking not found." });
     }
     res.status(200).json({ success: true, message: "Booking updated successfully.", Dregisters: updatedDrivers });
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal server error." });
   }
 });

// DELETE Driver
router.delete('/deletedrivers/:id', async (req, res) => {
    try {
        const Dregisters = await Dregister.findByIdAndDelete(req.params.id);
         if (!Dregisters) {
             return res.status(404).send({ message: "Booking not found.", success: false });
         }
         res.status(200).send({ message: "Booking deleted successfully", success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to delete Booking.", success: false, error });
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

// read Vehicle register
router.get('/getVehicles', async (req, res) => {
    try {
        const vehicles = await Vregister.find(); 
        if (!vehicles || vehicles.length === 0) {
            return res.status(404).send({ message: "No Booking found.", success: false });
        }
        res.status(200).send({ vehicles, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve Booking.", success: false, error });
    }
});

 //read
 router.get('/getVehicles2/:id', async (req, res) => {
    try {
        const { id } = req.params;
       const VehicleRegister = await Vregister.findById(id);
        if (!VehicleRegister) {
            return res.status(404).send({ message: "Announcement not found.", success: false });
        }
        res.status(200).send({VehicleRegister, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to retrieve the announcement.", success: false, error });
    }
});

// Update Vehicle

router.put('/updatevehicles/:id', async (req, res) => {
   try {
     const { id } = req.params;
     const updatedvehicles = await Vregister.findByIdAndUpdate(id, req.body, { new: true });
     if (!updatedvehicles) {
       return res.status(404).json({ success: false, message: "Booking not found." });
     }
     res.status(200).json({ success: true, message: "Booking updated successfully.", VehicleRegister: updatedvehicles });
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal server error." });
   }
 });


 // DELETE Vehicle
 router.delete('/deletevehicles/:id', async (req, res) => {
    try {
        const VehicleRegister = await Vregister.findByIdAndDelete(req.params.id);
         if (!VehicleRegister) {
             return res.status(404).send({ message: "Booking not found.", success: false });
         }
         res.status(200).send({ message: "Booking deleted successfully", success: true });
     } catch (error) {
         console.log(error);
         res.status(500).send({ message: "Failed to delete Booking.", success: false, error });
     }
 });
module.exports = router;