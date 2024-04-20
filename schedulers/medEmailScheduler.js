const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
require("dotenv").config();

const EventEmitter = require('events');
const emitter = new EventEmitter();




// Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USER, // Sender gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // App password from gmail account
    },
  });
  

// Options for the email
const mailOptions = {
    from: {
        name: "Agio Support",
        address: process.env.EMAIL_USER, 
    }, // sender address
    to: ["dinuravimukthi66@gmail.com"], // list of receivers
    subject: "Agio Medical Appointment Monthly Report", // Subject line
    text: "This is the report for the month:  . Please check the attachments for the report document.", // plain text body
    html: "<p>This is the report for the month: <b></b>.<br>Please check the attachments for the report document.</p>", // html body
    attachments: [
        {
            filename: 'Report.pdf',
            path: 'C:\\Users\\Dinura Vimukthi\\Documents\\GitHub\\agio-server\\pdf\\Report.pdf',
            contentType: 'application/pdf'
        },
    ]
};


/*
Send the email
*/
const sendEmail = async (transporter, mailOptions) => {
    try {
        const response = await transporter.sendMail(mailOptions);

        // Log the response
        console.log(`@sendEmail() @medEmailScheduler() Response => ${response.messageId}`)
    } catch (error) {
        console.log("Error occured when sending the email @sendEmail() @medEmailScheduler() => ", error);
    }
}

/*const medMonthlyReportGenerateScheduler = schedule.scheduleJob('* * * * * *', () => {
    console.log('Med email scheduler ran');
    // Emit an event when the scheduler runs
   
})

emitter.on('medEmailScheduler', () => {
    console.log('got medEmailScheduler event @medEmailScheduler()');
}) */

/*
 * 
 * 
 Scheduler for sending the mail
 * 
 */
// Run the scheduler at 00:30 on the 1st day of every month => '30 0 1 * *'
const medMonthlyReportScheduler = schedule.scheduleJob('30 0 1 * *', () => {
    sendEmail(transporter, mailOptions);
})
