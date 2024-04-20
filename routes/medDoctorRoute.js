const express = require("express");
const router = express.Router();
// import the model
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const AvailableDate = require("../models/dateModel");
const Parameters = require("../models/parametersModel");
const Employee = require('../models/employeeModel');

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
        const existingDatesResponse = await AvailableDate.find(
          {
            status: "available",
          }
        );

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




/* =============== Overview page ==================== */

/*
**
**
Read all the available dates for the current month
**
**
*/
router.post("/medical-overview-read-all-available-dates-specific-month", authMiddleware, async (req, res) => {
  try {
      const response = await AvailableDate.find({
        date: {
          $gte: req.body.startDate,
          $lte: req.body.endDate,
      }
      });

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
    console.log(`Error occured when retrieving all available date records @medDocotrRoute => `, error)
      res.status(400).send({
          message: "Error occured when retrieving all available date records",
          success: false,
          error: error,
      })
  }
})


/*
*
*
Read existing appointment for given appointment ids
*
*
*/
router.post("/medical-overview-read-all-appointments-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.find(
      {
        _id: { $in: req.body.appointmentIds },
      }
    );

    if (response.length > 0) {
      res.status(200).send({
        message: `Successfully retrieved ${response.length} existing appointment records for the provided ${req.body.appointmentIds.length} Ids`,
        success: true,
        fetched: response,
      })
    } else {
      res.status(200).send({
        message: `No existing appointment records found for the provided ${req.body.appointmentIds.length} Ids`,
        success: false,
      })
    }


  } catch (error) {
    console.log(`Error occured when retrieving appointment records for the ids @medDoctorRoute => `, req.body.appointmentIds, error)
    res.status(400).send({
      message: `Error occured when retrieving appointment records for the ids ${req.body.appointmentIds}`,
      success: false,
      error: error,
    });
  }
});


/*
*
*
Retrieve employee info for given ids
*
*
*/
router.post("/medical-overview-read-all-employees-specific", authMiddleware, async (req, res) => {
  try {
    const response = await Employee.find(
      {
        _id: { $in: req.body.employeeIds },
      }
    )

    if (response.length > 0) {
      res.status(200).send({
        message: `Successfully retrieved ${response.length} employee records for the provided ${req.body.employeeIds.length} Ids`,
        success: true,
        fetched: response,
      })
    } else {
      res.status(200).send({
        message: `No existing employee records found for the provided ${req.body.employeeIds.length} Ids`,
        success: false,
      })
    }

  } catch (error) {
    console.log(`Error occured when retrieving employee records for the ids @medDoctorRoute => `, req.body.employeeIds, error)
    res.status(400).send({
      message: `Error occured when retrieving employee records for the ids ${req.body.employeeIds}`,
      success: false,
      error: error,
    });
  }
});


/*
*
*
Update the selectd appointment status
*
*
*/
router.post("/medical-overview-update-one-appointment-status", authMiddleware, async (req, res) => {
  try {
    const response = await Appointment.findByIdAndUpdate(
      req.body.recordId,
      {
        $set: {
          status: req.body.status,
          updatedAt: req.body.updatedAt,
        },
      },
      { new: true }
    );

    if (response) {
      res.status(200).send({
        message: `Successfully updated the appointment: ${req.body.recordId}`,
        success: true,
      });
    } else {
      res.status(200).send({
        message: `Failed to update the appointment: ${req.body.recordId}`,
        success: false,
      });
    }
    
  } catch (error) {
    console.log(`Error occured when updating the appointment: ${req.body.recordId} @medDoctorRoute => `, error);

      res.status(400).send({
        message: `Error occured when updating the appointment: ${req.body.recordId}`,
        success: false,
        error: error,
      });
  }
})




/* =============== Reports page ==================== */

/*
**
**
Read all the available dates for the given period
**
**
*/
router.post("/medical-reports-read-all-available-dates-specific-period", authMiddleware, async (req, res) => {
  try {
      const response = await AvailableDate.find({
        date: {
          $gte: req.body.startDate,
          $lte: req.body.endDate,
      }
      });

      if (response) {
          res.status(200).send({
              message: `Sucessfully retrieved available date records for the given period`,
              success: true,
              fetched: response,
          });
          console.log("Existing available dates: ", response);
      } else {
          res.status(200).send({
              message: "No existing available date records were found for the given period",
              success: false
          })
      }
      
  } catch (error) {
    console.log(`Error occured when retrieving available date records for the given period @medDocotrRoute => `, error)
      res.status(400).send({
          message: "Error occured when retrieving available date records for the given period",
          success: false,
          error: error,
      })
  }
})


/*
**
**
Read all the appointment records for the given period
**
**
*/
router.post("/medical-reports-read-all-appointments-specific-period", authMiddleware, async (req, res) => {
  try {
      const response = await Appointment.find({
        appointmentDate: {
          $gte: req.body.startDate,
          $lte: req.body.endDate,
      }
      });

      if (response) {
          res.status(200).send({
              message: `Sucessfully retrieved appointment records for the given period`,
              success: true,
              fetched: response,
          });
          console.log("Existing available dates: ", response);
      } else {
          res.status(200).send({
              message: "No existing appointment records were found for the given period",
              success: false
          })
      }
      
  } catch (error) {
    console.log(`Error occured when retrieving appointment records for the given period @medDocotrRoute => `, error)
      res.status(400).send({
          message: "Error occured when retrieving appointment records for the given period",
          success: false,
          error: error,
      })
  }
})






// export the router
module.exports = router;
