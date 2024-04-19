const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const AvailableDate = require("../models/dateModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");

/* ================== Available dates ================= */

/*
*
*
Read available dates
*
*
*/
router.post("/medical-available-date-read-all-existing", authMiddleware, async (req, res) => {
  try {
      const response = await AvailableDate.find({ status: "available" });

      if (response) {
          res.status(200).send({
              message: "Sucessfully retrieved existing available date records",
              success: true,
              fetched: response,
          });
          console.log("Existing available dates: ", response.data);
      } else {
          res.status(200).send({
              message: "No existing available date records were found",
              success: false
          })
      }
      
  } catch (error) {
    console.log("Error occured when reading existing available dates @medEmployeeRoute => ", error);
      res.status(400).send({
          message: "Error occured when reading existing available dates",
          success: false,
          error: error,
      })
      
  }
})


/*
*
*
Update available date details
*
*
*/
router.post("/medical-available-date-update", authMiddleware, async (req, res) => {
    try {
      const updateAvailableDate = await AvailableDate.findByIdAndUpdate(
        req.body.id,
        {
          $set: {
            appointmentCount: req.body.appointmentCount,
            appointmentIds: req.body.appointmentIds,
            status: req.body.status,
            nextAppointmentTime: req.body.nextAppointmentTime,
            nextAppointmentNo: req.body.nextAppointmentNo,
            appointmentIds: req.body.appointmentIds,
            version: req.body.version,
            updatedAt: req.body.updatedAt,
          },
        },
        { new: true }
      );

      if (updateAvailableDate) {
        res.status(200).send({
          message: `Successfully updated the document for the date: ${req.body.id}`,
          success: true,
        });
      } else {
        res.status(200).send({
          message: `Updating the document for the date: ${req.body.id} failed`,
          success: false,
        });
      }
    } catch (error) {
      console.log(`Error occured when updating the document for the date: ${req.body.id} @medEmployeeRoute => `, error);
      res.status(400).send({
        message: `Error occured when updating the document for the date: ${req.body.id}`,
        success: false,
        error,
      });
    }
  }
);

/*
**
**
Read specific available date
**
**
*/
router.post("/medical-available-date-read-one-specific", authMiddleware, async (req, res) => {
    try {
      const response = await AvailableDate.findOne({
        date: req.body.date,
      });

      if (response) {
        res.status(200).send({
          message: `Retrieved the record for the date: ${req.body.date}`,
          success: true,
          fetched: response,
        });
      } else {
        res.status(200).send({
          message: `No record was found for the date: ${req.body.date}`,
          success: false,
        });
      }
    } catch (error) {
        console.log(`Error occured when retrieving the date record for the date: ${req.body.date} @medEmployeeRoute => `, error)
        res.status(400).send({
          message: `Error occured when retrieving the date record for the date: ${req.body.date}`,
          success: false,
          error: error,
        })
    }
  }
);




/* ================== Appointments ================= */

/*
*
*
Read existing appointment for a specific user
*
*
*/
router.post("/medical-appointment-read-one-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.findOne(
      {
        userId: req.body.id,
        status: "pending", 
      }
    )

    if (response) {
      res.status(200).send({
        message: `Successfully retrieved an existing appointment record for the user: ${req.body.id}`,
        success: true,
        fetched: response,
      })
    } else {
      res.status(200).send({
        message: `No existing appointment record found for the user: ${req.body.id}`,
        success: false,
      })
    }


  } catch (error) {
    console.log(`Error occured when retrieving an existing appointment record for the user: ${req.body.id} @medEmployeeRoute => `, error)
    res.status(400).send({
      message: `Error occured when retrieving an existing appointment record for the user: ${req.body.id}`,
      success: false,
      error: error,
    })
  }
});


/*
*
*
Create new appointment
*
*
*/
router.post("/medical-appointment-create-new", authMiddleware, async (req, res) => {
    try {
      const response = new Appointment({
        userId: req.body.id,
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        appointmentNo: req.body.appointmentNo,
        status: "pending",
      });
      await response.save();

      /*const doctorUser = await User.findOne({ isDoctor: true });*/

      //await User.findByIdAndUpdate(doctorUser._id, { unseenNotifications });
      res.status(200).send({
        success: true,
        message: "Appointment scheduled successfully",
        objectId: response._id,
      });
    } catch (error) {
      console.log(`Error occured when scheduling the appointment for user: ${req.body.id} @medEmployeeRoute => `, error);
      res.status(400).send({
        message: `Error occured when scheduling the appointment for user: ${req.body.id}`,
        success: false,
        error: error,
      });
    }
  }
);



/*
*
*
Update existing appointmet
*
*
*/
router.post("/medical-appointment-update-one-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.findByIdAndUpdate(
      req.body.recordId,
      {
        $set: {
          appointmentDate: req.body.appointmentDate,
          appointmentTime: req.body.appointmentTime,
          appointmentNo: req.body.appointmentNo,
          status: req.body.status,
          isReminderSet: req.body.isReminderSet,
          updatedAt: req.body.updatedAt,
        },
      },
      { new: true }
    );

    if (response) {
      res.status(200).send({
        message: `Successfully updated the appointment for the user: ${req.body.id}`,
        success: true,
      });
    } else {
      res.status(200).send({
        message: `Failed to update the appointment for the user: ${req.body.id}`,
        success: false,
      });
    }
    
  } catch (error) {
    console.log(`Error occured when updating the appointment for user: ${req.body.id} @medEmployeeRoute => `, error);

      res.status(400).send({
        message: `Error occured when updating the appointment for user: ${req.body.id}`,
        success: false,
        error: error,
      });
  }
})



/*
*
*
Delete existing appointment
*
*
*/
router.post("/medical-appointment-delete-one-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.deleteOne(
      {_id: req.body.recordId}
    );

    if (response.deletedCount > 0) {
      res.status(200).send({
          message: `Successfully deleted the appointment record: ${req.body.recordId}`,
          success: true,
          deletedCount: response.deletedCount,
      })
  } else {
      res.status(200).send({
          message: `Deleting the record for the appointment: ${req.body.recordId} was unsuccessful`,
          success: false,
      })
  }

  } catch (error) {
    console.log(`Error occured when deleting the appointment for user: ${req.body.id} @medEmployeeRoute => `, error);

      res.status(400).send({
        message: `Error occured when deleting the appointment for user: ${req.body.id}`,
        success: false,
        error: error,
      });
  }
})


/*
*
*
Read all appointments for a specific user
*
*
*/
router.post("/medical-appointment-read-all-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.find(
      {
        userId: req.body.id,
        status: { $ne: "pending" }
      }
    )

    if (response) {
      res.status(200).send({
          message: `Sucessfully retrieved all existing appointments for the user: ${req.body.id}`,
          success: true,
          fetched: response,
      });
  } else {
      res.status(200).send({
          message: `No existing appointments were found for the user: ${req.body.id}`,
          success: false
      })
  }


  } catch (error) {
    console.log(`Error occured when retrieving all the appointment for user: ${req.body.id} @medEmployeeRoute => `, error);

      res.status(400).send({
        message: `Error occured when retrieving all the appointment for user: ${req.body.id}`,
        success: false,
        error: error,
      });
  }
})


// export the router
module.exports = router;
