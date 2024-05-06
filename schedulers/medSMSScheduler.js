// const express = require("express");
// const schedule = require("node-schedule");
// require("dotenv").config();

// const Appointment = require("../models/appointmentModel");
// const AvailableDate = require("../models/dateModel");
// const Employee = require("../models/employeeModel");

// const EventEmitter = require("events");

// // SMS essentials
// const twilioSid = process.env.TWILIO_SID;
// const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// const client = require("twilio")(twilioSid, twilioAuthToken);

// // Emitter
// const emitter = new EventEmitter();

// // Employee sms body

// // Today's available date details
// var availableDate = null;
// // Today's scheduled appointment list
// var appointmentList = [];

// // Doctor's phone number
// var doctorsNumber;

// // Get doctor's phone number
// const getDoctorsNumber = async () => {
//   try {
//     const response = await Employee.findOne({
//       isDoctor: true,
//     });

//     // Log the response
//     console.log(
//       `@getDoctorsNumber() @medSMSScheduler employees Response => ${response.length} records retrieved`
//     );

//     var modifiedPhoneNum = response.phoneNumber;
//     modifiedPhoneNum = modifiedPhoneNum.substring(1);
//     modifiedPhoneNum = "+94" + modifiedPhoneNum;

//     doctorsNumber = modifiedPhoneNum;
//   } catch (error) {
//     console.log(
//       `Error occured when retrieving doctor's phone number @getDoctorsNumber() @medSMSScheduler => `,
//       error
//     );
//   }
// };

// // Get today's appointments
// const getTodaysAppointments = async () => {
//   //const today = new Date(new Date().getFullYear(), new Date().getMonth(), 6);
//   const today = new Date(
//     new Date().getFullYear(),
//     new Date().getMonth(),
//     new Date().getDate()
//   );
//   const todayIso = today.toISOString();

//   // Check if today is an available date

//   try {
//     const availablilityResponse = await AvailableDate.findOne({
//       date: todayIso,
//     });

//     // Log the response
//     console.log(
//       `@getTodaysAppointments() @medSMSScheduler availability Response => ${availablilityResponse}`
//     );

//     // If today is an available date, get the scheduled appointments
//     if (availablilityResponse) {
//       // set the available date details
//       availableDate = availablilityResponse;
//       emitter.emit("set_available_date_details");

//       try {
//         const appointmentsResponse = await Appointment.find({
//           _id: { $in: availablilityResponse.appointmentIds },
//         });

//         // Log the response
//         console.log(
//           `@getTodaysAppointments() @medSMSScheduler appointments Response => ${appointmentsResponse.length} records retrieved`
//         );

//         // Get the relevent employee details for the appointments
//         if (appointmentsResponse.length > 0) {
//           var employeeIds = [];
//           for (a of appointmentsResponse) {
//             employeeIds.push(a.userId);
//           }

//           try {
//             const employeesResponse = await Employee.find({
//               _id: { $in: employeeIds },
//             });

//             // Log the response
//             console.log(
//               `@getTodaysAppointments() @medSMSScheduler employees Response => ${employeesResponse.length} records retrieved`
//             );

//             // Merge relevant employee and appointment details
//             if (employeesResponse.length > 0) {
//               for (a of appointmentsResponse) {
//                 for (e of employeesResponse) {
//                   if (a.userId == e._id) {
//                     var modifiedPhoneNum = e.phoneNumber;
//                     modifiedPhoneNum = modifiedPhoneNum.substring(1);
//                     modifiedPhoneNum = "+94" + modifiedPhoneNum;

//                     var mergeObject = {
//                       appointmentId: a._id,
//                       appointmentDate: a.appointmentDate,
//                       appointmentTime: a.appointmentTime,
//                       appointmentNo: a.appointmentNo,
//                       employeeId: e._id,
//                       employeeName: e.fname,
//                       employeePhoneNumber: modifiedPhoneNum,
//                     };

//                     // Add the object to the appointment list
//                     appointmentList.push(mergeObject);
//                   }
//                 }
//               }

//               emitter.emit("set_appointment_details");
//             }
//           } catch (error) {
//             console.log(
//               `Error occured when retrieving employee records for the given ids @getTodaysAppointments() @medSMSScheduler => `,
//               error
//             );
//           }
//         }
//       } catch (error) {
//         console.log(
//           `Error occured when retrieving appointment records for the given ids @getTodaysAppointments() @medSMSScheduler => `,
//           error
//         );
//       }
//     }
//   } catch (error) {
//     console.log(
//       `Error occured when checking if today's an available date @getTodaysAppointments() @medSMSScheduler => `,
//       error
//     );
//   }
// };

// // send employees' messages
// const sendEmployeesMessages = async () => {
//   if (appointmentList.length > 0) {
//     for (a of appointmentList) {
//       let msgOptions = {
//         from: twilioPhoneNumber,
//         to: `${a.employeePhoneNumber}`,
//         body: `You have an appointment with the doctor today!\nName: ${
//           a.employeeName
//         }\nDate: ${new Date(a.appointmentDate).toLocaleDateString()}\nTime: ${
//           a.appointmentTime
//         }\nNo: ${a.appointmentNo}`,
//       };

//       try {
//         const empMessageResponse = await client.messages.create(msgOptions);
//         console.log("empMessageResponse: ", empMessageResponse);
//       } catch (error) {
//         console.log(
//           `Error occured when sending message to ${a.employeeId} @sendEmployeesMessages() @medSMSScheduler => `,
//           error
//         );
//       }
//     }
//   }
// };

// // send doctor's message
// const sendDoctorsMessage = async (docNumber) => {
//   if (availableDate != null) {
//     var msgOptions;
//     if (availableDate.appointmentCount > 0) {
//       msgOptions = {
//         from: twilioPhoneNumber,
//         to: `${docNumber}`,
//         body: `You have scheduled appointments today!\nDate: ${new Date(
//           availableDate.date
//         ).toLocaleDateString()}\nNo of appointments: ${
//           availableDate.appointmentCount
//         }\nStart time: ${availableDate.startTime}\nEnd time: ${
//           availableDate.endTime
//         }`,
//       };
//     } else {
//       msgOptions = {
//         from: twilioPhoneNumber,
//         to: `${docNumber}`,
//         body: `You don't have any scheduled appointments today!\nDate: ${new Date(
//           availableDate.date
//         ).toLocaleDateString()}`,
//       };
//     }

//     try {
//       const docMessageResponse = await client.messages.create(msgOptions);
//       console.log("docMessageResponse: ", docMessageResponse);
//     } catch (error) {
//       console.log(
//         `Error occured when sending message to the doctor @sendDoctorsMessages() @medSMSScheduler => `,
//         error
//       );
//     }
//   }
// };

// /*
//  * 
//  * 
//  Scheduler for sending the mail
//  * 
//  */
// // Run the scheduler at 06:00 on every day of every month => '0 6 * * *'
// // For testing => '* * * * * *'
// const smsScheduler = schedule.scheduleJob("0 6 * * *", () => {
//   getDoctorsNumber();
//   getTodaysAppointments();

//   emitter.on("set_appointment_details", () => {
//     sendEmployeesMessages();
//   });

//   emitter.on("set_available_date_details", () => {
//     sendDoctorsMessage(doctorsNumber);
//   });

//   //smsScheduler.cancel();
// });
