// const schedule = require('node-schedule');
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const EventEmitter = require('events');
// const emitter = new EventEmitter();

// // Run the medMonthlyReport
// const generateReport = require("../required/medMonthlyReport");


// // Get doctor's email
// var DOCTOR_EMAIL = null;
// const getDoctorEmail = async () => {
//     DOCTOR_EMAIL = "dinuravimukthi66@gmail.com";
// }

// getDoctorEmail();




// // Transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//       user: process.env.EMAIL_USER, // Sender gmail address
//       pass: process.env.EMAIL_APP_PASSWORD, // App password from gmail account
//     },
//   });
  

// // Options for the email
// var mailOptions = {};

// const setMailOptions = (monthName) => {
    
//     mailOptions = {
//         from: {
//             name: "Agio Support",
//             address: process.env.EMAIL_USER, 
//         }, 
//         to: [DOCTOR_EMAIL], 
//         subject: "Agio Medical Appointment Monthly Report", 
//         text: `This is the report for the month ${monthName}. Please check the attachments for the report document.`, 
//         html: `<p>This is the report for the month <b>${monthName}</b> <b></b>.<br>Please check the attachments for the report document.</p>`, // html body
//         attachments: [
//             {
//                 filename: 'Report.pdf',
//                 path: 'C://Users//Dinura Vimukthi//Documents//GitHub//agio-server//report.pdf',//'C://Users//Dinura Vimukthi//Documents//GitHub//agio-server//pdf//Report.pdf'
//                 contentType: 'application/pdf'
//             },
//         ]
//     };
// }


// /*
// Send the email
// */
// const sendEmail = async (transporter, mailOptions) => {
//     try {
//         const response = await transporter.sendMail(mailOptions);

//         // Log the response
//         console.log(`@sendEmail() @medEmailScheduler() Response => ${response.messageId}`)
//     } catch (error) {
//         console.log("Error occured when sending the email @sendEmail() @medEmailScheduler() => ", error);
//     }
// }



// /*
// emitter.on('medEmailScheduler', () => {
//     console.log('got medEmailScheduler event @medEmailScheduler()');
// }) */

// /*
//  * 
//  * 
//  Scheduler for generating the email
//  * 
//  */
// // Run the scheduler at 00:10 on the 1st day of every month => '10 0 1 * *'
// const medMonthlyReportGenerateScheduler = schedule.scheduleJob('10 0 1 * *', () => {
//     console.log('Med email scheduler ran');
    
//     generateReport();
    
// })

// /*
//  * 
//  * 
//  Scheduler for sending the mail
//  * 
//  */
// // Run the scheduler at 00:30 on the 1st day of every month => '30 0 1 * *'
// const medMonthlyReportScheduler = schedule.scheduleJob('30 0 1 * *', () => {

//     var monthName = new Date(new Date().setDate(new Date().getDate()-1)).toLocaleString('default', { month: 'long' })
//     setMailOptions(monthName);
//     sendEmail(transporter, mailOptions);
    
// })
