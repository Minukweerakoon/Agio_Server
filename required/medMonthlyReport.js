const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const setupMonthlyReportLogic = () => {
  // Create a new PDFDocument
  const doc = new PDFDocument();

  // Specify the directory where you want to save the PDF file
  const directoryPath =
    "./pdf";

  // Specify the filename (example.pdf in this case)
  const filename = "report.pdf";

  // Combine the directory path and filename to get the full path to the file
  const filePath = path.join(directoryPath, filename);

  // Pipe the PDF document to the write stream with the specified file path
  doc.pipe(fs.createWriteStream((filename)));

  doc.text("Hello, world!");

  // End the document
  doc.end();
};

/*function setupMonthlyReportLogic(app) {
    app.get("/api/medMonthlyReport", (req, res) => {
        console.log('Client connected for monthly report');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const intervalId = setInterval(() => {
            const date = new Date().toString();
            res.write(`data: ${date}\n\n`);
        }, 1000);

        res.on('close', () => {
            console.log('Client closed connection for monthly report');
            clearInterval(intervalId);
            res.end();
        });

        // Error handling
        res.on('error', (err) => {
            console.error('Error in monthly report connection:', err);
            clearInterval(intervalId);
            res.end();
        });
    });
}
*/

module.exports = setupMonthlyReportLogic;

const lastDate = new Date(new Date().setDate(new Date().getDate()-1));
const firstDate = new Date(lastDate.getFullYear(), 0, 1);
var selectedRangeAvailableDates = [];
var selectedRangeAppointments = [];
var monthObjects = [];

/*
Get available dates for the selected range
*/
const getSelectedRangeAvailableDates = async () => {
    try {
        const response = await AvailableDate.find({
          date: {
            $gte: firstDate,
            $lte: lastDate,
        }
        });
  
        if (response) {
            selectedRangeAvailableDates = response;
        }

        // Log the response
        console.log(
            `@getSelectedRangeAvailableDates() @MedMonthlyReport() Response => ${response}`
        );
        
    } catch (error) {
      console.log(`Error occured when retrieving available date records for the given period @getSelectedRangeAvailableDates() @MedMonthlyReports() => `, error)
    }
  };

    /*
  Get appointments for the selected range
  */
  const getSelectedRangeAppointments = async () => {
    try {
        const response = await Appointment.find({
          appointmentDate: {
            $gte: firstDate,
            $lte: lastDate,
        }
        });
  
        if (response) {
            selectedRangeAppointments = response;
        } 

        // Log the response
        console.log(
            `@getSelectedRangeAppointments() @MedMonthlyReports() Response => ${response}`
        );
        
    } catch (error) {
      console.log(`Error occured when retrieving appointment records for the given period @getSelectedRangeAppointments() @MedMonthlyReports() => `, error)
    }
  };

    /*
  Arrange details by the month
  */
  const arrangeDetailsByMonth = () => {
    const monthList = [];

    var month;
    var monthName;
    // Get the numbers of selected months
    for (
      var m = Number(selectedRange[0].$M);
      m <= Number(selectedRange[1].$M);
      m++
    ) {
      // Get the name of the month
      switch (m) {
        case 0:
          monthName = "January";
          break;
        case 1:
          monthName = "February";
          break;
        case 2:
          monthName = "March";
          break;
        case 3:
          monthName = "April";
          break;
        case 4:
          monthName = "May";
          break;
        case 5:
          monthName = "June";
          break;
        case 6:
          monthName = "July";
          break;
        case 7:
          monthName = "August";
          break;
        case 8:
          monthName = "September";
          break;
        case 9:
          monthName = "October";
          break;
        case 10:
          monthName = "November";
          break;
        case 11:
          monthName = "December";
          break;
      }

      // Create month object
      month = {
        monthIsoNumber: m,
        monthNumber: m + 1,
        monthName: monthName,
        availableDateCount: 0,
        availableDates: [],
        availableDatesDateOnly: [],
        appointmentCount: 0,
        appointments: [],
        totalMaxAppointments: 0,
        availableDateChange: 0.0,
        completedAppointmentCount: 0,
        missedAppointmentCount: 0,
      };

      // Add the object to the list
      monthList.push(month);
    }

    // Add the available dates & appointments to the corresponding month
    for (var mObj of monthList) {
      var dateCount = 0;
      var appointmentCount = 0;
      var missedAppointmentCount = 0;
      var completedAppointmentCount = 0;

      // Set the available date details to the month objects
      for (var dObj of selectedRangeAvailableDates) {
        if (
          Number(new Date(dObj.date).toLocaleDateString().split("/")[1]) ==
            mObj.monthNumber &&
          !mObj.availableDatesDateOnly.includes(
            new Date(dObj.date).toString().split(" ")[2]
          )
        ) {
          mObj.availableDates.push(dObj);
          mObj.availableDatesDateOnly.push(
            new Date(dObj.date).toString().split(" ")[2]
          );
          dateCount++;
        }
      }

      // Set the appointment details to the month objects
      for (var aObj of selectedRangeAppointments) {
        if (
          Number(
            new Date(aObj.appointmentDate).toLocaleDateString().split("/")[1]
          ) == mObj.monthNumber
        ) {
          mObj.appointments.push(aObj);

          appointmentCount++;
        }
      }

      // Set the appointment completion status
      for (var aObj of mObj.appointments) {
        if (aObj.status === "completed") {
            completedAppointmentCount++;
        } else if (aObj.status === "missed") {
            missedAppointmentCount++;
        }
      }

      mObj.availableDatesDateOnly.sort();
      mObj.availableDateCount = dateCount;
      mObj.appointmentCount = appointmentCount;
      mObj.completedAppointmentCount = completedAppointmentCount;
      mObj.missedAppointmentCount = missedAppointmentCount;
    }

    // Get the available date change
    var previousObjectAvailableDateCount = 0;
    var currentObjectAvailableDateCount = 0;
    for (var mObj of monthList) {
      var maxAppointments = 0;
      previousObjectAvailableDateCount = currentObjectAvailableDateCount;
      currentObjectAvailableDateCount = mObj.availableDateCount;
      for (var dObj of mObj.availableDates) {
        maxAppointments += dObj.maxAppointmentCount;
      }

      if (monthList.indexOf(mObj) === 0) {
        mObj.availableDateChange = (0.0).toFixed(2);
      } else {
        if (previousObjectAvailableDateCount !== 0) {
          mObj.availableDateChange =
            ((currentObjectAvailableDateCount -
              previousObjectAvailableDateCount) /
              previousObjectAvailableDateCount) *
            100;
          mObj.availableDateChange = mObj.availableDateChange.toFixed(2);
        } else {
          mObj.availableDateChange =
            ((currentObjectAvailableDateCount -
              previousObjectAvailableDateCount) /
              1) *
            100;
          mObj.availableDateChange = mObj.availableDateChange.toFixed(2);
        }
      }

      mObj.totalMaxAppointments = maxAppointments;
    }

    monthObjects = monthList;
  };