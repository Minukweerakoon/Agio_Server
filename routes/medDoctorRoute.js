const express = require("express");
const router = express.Router();
// import the model
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const AvailableDate = require("../models/dateModel");
const Parameters = require("../models/parametersModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");



/* =============== manage available date section ==================== */

/*
**
**
Insert new available date
**
**
*/
router.post("/medical-new-available-date", authMiddleware, async (req, res) => {
  try {
    const newAvailableDate = new AvailableDate({ ...req.body });
    await newAvailableDate.save();

    res.status(200).send({
      message: "New available date created",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Failed to create the new available date",
      success: false,
      error,
    });
  }
});

/*
  **
  **
  Check for same available date already in the db
  **
  **
  */
router.post(
  "/medical-similar-available-date",
  authMiddleware,
  async (req, res) => {
    try {
      const similarDateResult = await AvailableDate.findOne({
        date: req.body.date,
      });

      if (similarDateResult) {
        res.status(200).send({
          message: `A record for the available date: ${req.body.date} already exists`,
          success: true,
          similarDate: similarDateResult,
        });
      } else {
        res.status(200).send({
          message: `No similar records for the available date: ${req.body.date} detected`,
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Error occured when checking for a similar available date",
        success: false,
        error,
      });
    }
  }
);

/*
  **
  **
  Update field in the available dates
  **
  **
  */
router.post(
  "/medical-update-available-date",
  authMiddleware,
  async (req, res) => {
    try {
      const updateAvailableDate = await AvailableDate.findByIdAndUpdate(
        req.body.id,
        {
          $set: {
            appointmentCount: req.body.appointmentCount,
            maxAppointmentCount: req.body.maxAppointmentCount,
            status: req.body.status,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            nextAppointmentTime: req.body.nextAppointmentTime,
            nextAppointmentNo: req.body.nextAppointmentNo,
            updatedAt: req.body.updatedAt,
          },
        },
        { new: true }
      );

      if (updateAvailableDate) {
        res.status(200).send({
          message: `Updated the document for ${req.body.date}`,
          success: true,
        });
      } else {
        res.status(200).send({
          message: "Update document failed",
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Update document error",
        success: false,
        error,
      });
    }
  }
);

/*
**
**
Read existing available dates
**
**
*/
router.post("/medical-available-dates-read-existing", authMiddleware, async (req, res) => {
    try {
        const existingDatesResponse = await AvailableDate.find();

        if (existingDatesResponse) {
            res.status(200).send({
                message: "Sucessfully retrieved existing available date records",
                success: true,
                fetched: existingDatesResponse,
            });
            console.log("Existing available dates: ", existingDatesResponse.data);
        } else {
            res.status(200).send({
                message: "Retrieving existing available date records was unsuccessful",
                success: false
            })
        }
        
    } catch (error) {
        res.status(400).send({
            message: "Error occured when reading existing available dates",
            success: false,
            error: error,
        })
        console.log("Error occured when reading existing available dates @medDoctorRoute ", error);
    }
})

/*
**
**
Delete available dates
**
**
*/
router.post(
    "/medical-available-dates-delete-existing", authMiddleware, async (req, res) => {
        try {
            const response = await AvailableDate.deleteOne(
                {_id: req.body.id}
            );

            if (response.deletedCount > 0) {
                res.status(200).send({
                    message: `Successfully deleted the record ID: ${req.body.id}`,
                    success: true,
                    deletedCount: response.deletedCount,
                })
            } else {
                res.status(200).send({
                    message: `Deleting the record for the date ID: ${req.body.id} was unsuccessful`,
                    success: false,
                })
            }
            
        } catch (error) {
            res.status(400).send({
                message: "Error occured when deleting an existing available date",
                success: false,
                error: error,
            })
            console.log("Error occured when deleting an existing available date @medDoctorRoute ", error);
        }
    }
)

/* =============== manage parameters section ==================== */

/*
  **
  **
  insert new parameters-record
  **
  **
  */
router.post(
  "/medical-parameters-insert-new",
  authMiddleware,
  async (req, res) => {
    try {
      const newRecord = new Parameters({ ...req.body });
      await newRecord.save();

      res.status(200).send({
        message: "Successfully created a new parameters-record",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Error occured when creating a new parameters-record",
        success: false,
        error,
      });
    }
  }
);

/*
  **
  **
  Update the existing parameters-record
  **
  **
  */
router.post(
  "/medical-parameters-update-existing",
  authMiddleware,
  async (req, res) => {
    try {
      const updateRecord = await Parameters.findByIdAndUpdate(
        req.body.id,
        {
          $set: {
            maxAppointments: req.body.maxAppointments,
            avgSessionTime: req.body.avgSessionTime,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            updatedAt: req.body.updatedAt,
          },
        },
        { new: true }
      );

      if (updateRecord) {
        res.status(200).send({
          message: `Successfully updated the parameters-record id: ${req.body.id}`,
          success: true,
        });
      } else {
        res.status(200).send({
          message: `Failed to update the parameters-record id: ${req.body.id}`,
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Error occured when updating a parameters-record",
        success: false,
        error,
      });
    }
  }
);

/*
  **
  **
  Read the existing parameters-record
  **
  **
  */
router.post(
  "/medical-parameters-find-existing",
  authMiddleware,
  async (req, res) => {
    try {
      const existingRecord = await Parameters.findOne();

      if (existingRecord) {
        res.status(200).send({
          message: `Fetched parameters-record id: ${existingRecord._id}`,
          success: true,
          fetched: existingRecord,
        });
      } else {
        res.status(200).send({
          message: "No existing parameters-records",
          success: false,
        });
      }
    } catch (error) {
      res.status(400).send({
        message: "Error occured when finding a parameters-record",
        success: false,
        error,
      });
      console.log("Error occured when finding a parameters-record @medDoctorRoute: ", error);
    }
  }
);

// export the router
module.exports = router;
