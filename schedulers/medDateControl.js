const express = require("express");
const schedule = require("node-schedule");
require("dotenv").config();

const Appointment = require("../models/appointmentModel");
const AvailableDate = require("../models/dateModel");
const Employee = require("../models/employeeModel");

const EventEmitter = require("events");


// Emitter
const emitter = new EventEmitter();

// Today's available date details
var availableDate = null;

// Today's scheduled appointment list
var appointmentList = [];




// Get today's appointments
const getTodaysAvailability = async () => {
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), 3);
  /*const today = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );*/
  const todayIso = today.toISOString();

  // Check if today is an available date

  try {
    const availablilityResponse = await AvailableDate.findOne({
      date: todayIso,
    });

    // Log the response
    console.log(
      `@getTodaysAvailability() @medDateControl availability Response => ${availablilityResponse}`
    );

    // If today is an available date, get the scheduled appointments
    if (availablilityResponse) {
      // set the available date details
      availableDate = availablilityResponse;
      emitter.emit("set_available_date_details_date_control");

      try {
        const appointmentsResponse = await Appointment.find({
          _id: { $in: availablilityResponse.appointmentIds },
        });

        // Log the response
        console.log(
          `@getTodaysAvailability() @medDateControl appointments Response => ${appointmentsResponse.length} records retrieved`
        );

        // Set appointment list
        if (appointmentsResponse.length > 0) {
            for (a of appointmentsResponse) {
                // Add the object to the appointment list
                appointmentList.push(a);
            }

            emitter.emit("set_appointment_details_date_control");
        }

      } catch (error) {
        console.log(
          `Error occured when retrieving appointment records for the given ids @getTodaysAvailability() @medDateControl => `,
          error
        );
      }
    }
  } catch (error) {
    console.log(
      `Error occured when checking if today's an available date @getTodaysAvailability() @medDateControl => `,
      error
    );
  }
};



const updateDateStatus = async () => {
    if (availableDate !== null) {
        try {
            const response = await AvailableDate.findByIdAndUpdate(
              availableDate._id,
              {
                $set: {
                  status: "unavailable",
                },
              },
              { new: true }
            );
      
            // Log the response
            console.log(
                `@updateDateStatus() @medDateControl Response => ${response}`
            );
          } catch (error) {
            console.log(`Error occured when updating the document for the date: ${availableDate.date} @updateDateStatus() @medDateControl => `, error);
          }
    }
}


const updateAppointmentStatus = async () => {
    //
}



/*
 * 
 * 
 Scheduler updating the date
 * 
 */
// Run the scheduler at 00:10 on every day of every month => '10 0 * * *' 
// For testing => '* * * * * *'
const dateControl = schedule.scheduleJob('10 0 * * *' , () => {

    getTodaysAvailability();

    emitter.on("set_available_date_details_date_control", () => {
        updateDateStatus();
    })

    /*emitter.on("set_appointment_details_date_control", () => {
        sendEmployeesMessages();
    })*/
    
    dateControl.cancel();
})
