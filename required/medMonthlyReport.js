const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const Appointment = require("../models/appointmentModel");
const AvailableDate = require("../models/dateModel");

const generateReport = () => {


const lastDate = new Date(new Date().setDate(new Date().getDate()-1));
const firstDate = new Date(lastDate.getFullYear(), 0, 1);
const isoFirstDate = firstDate.toISOString();
const isoLastDate = lastDate.toISOString();

// Last date for testing for the month April => const isoLastDate = new Date(2024, 4, 30).toISOString();

const selectedRange = [
    {
        $D: firstDate.getDate(),
        $H: 0,
        $L: "en",
        $M: firstDate.getMonth(),
        $W: null,
        $d: firstDate.toString(),
        $isDayjsObject: true,
        $m: 0,
        $ms: 0,
        $s: 0,
        $u: undefined,
        $x: {},
        $y: firstDate.getFullYear(),
    },
    {
        $D: lastDate.getDate(),
        $H: 0,
        $L: "en",
        $M: lastDate.getMonth(),
        $W: null,
        $d: lastDate.toString(),
        $isDayjsObject: true,
        $m: 0,
        $ms: 0,
        $s: 0,
        $u: undefined,
        $x: {},
        $y: lastDate.getFullYear(),
    },
]

const emitter = new EventEmitter();

var selectedRangeAvailableDates = [];
var isSelectedRangeAvailableDatesSet = false;
var selectedRangeAppointments = [];
var isSelectedRangeAppointmentsSet = false;
var isDetailsSet = false;
var monthObjects = [];
var summary = {};

/*
Get available dates for the selected range
*/
const getSelectedRangeAvailableDates = async () => {
    try {
        const response = await AvailableDate.find({
          date: {
            $gte: isoFirstDate,
            $lte: isoLastDate,
        }
        });
  
        if (response) {
            selectedRangeAvailableDates = response;
            emitter.emit("selectedRangeAvailableDates");
        }

        // Log the response
        //console.log(`@getSelectedRangeAvailableDates() @MedMonthlyReport() Response => ${response}`);
        
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
            $gte: isoFirstDate,
            $lte: isoLastDate,
        }
        });
  
        if (response) {
            selectedRangeAppointments = response;
            emitter.emit("selectedRangeAppointments");
        } 

        // Log the response
        //console.log(`@getSelectedRangeAppointments() @MedMonthlyReports() Response => ${response}`);
        
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
    //console.log(`months : ${Number(selectedRange[0].$M)}, ${Number(selectedRange[1].$M)}`)
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

    //console.log("monthList => ", monthList.length);
    // Add the available dates & appointments to the corresponding month
    for (var mObj of monthList) {
      var dateCount = 0;
      var appointmentCount = 0;
      var missedAppointmentCount = 0;
      var completedAppointmentCount = 0;

      //console.log("selectedRangeAvailableDates => ", selectedRangeAvailableDates.length);
      // Set the available date details to the month objects
      for (var dObj of selectedRangeAvailableDates) {
        if (
          Number(new Date(dObj.date).toLocaleDateString().split("/")[0]) ==
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

      //console.log("selectedRangeAppointments => ", selectedRangeAppointments.length);
      // Set the appointment details to the month objects
      for (var aObj of selectedRangeAppointments) {
        if (
          Number(
            new Date(aObj.appointmentDate).toLocaleDateString().split("/")[0]
          ) == mObj.monthNumber
        ) {
            
          mObj.appointments.push(aObj);

          appointmentCount++;
        }
      }

      //console.log("monthObject.appointments => ", mObj.appointments.length);
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

  /*
  set the summary
  */
  const getSummary = () => {
    var startingMonth;
    var endingMonth;
    var totalAvailableDates = 0;
    var totalAppointments = 0;
    var totalAppointmentsPercentage = 0.0;
    var totalAvailabledAppointments = 0;
    var completedAppointmentCount = 0;
    var missedAppointmentCount = 0;

    startingMonth = monthObjects[0].monthName;
    endingMonth = monthObjects[monthObjects.length - 1].monthName;

    for (var m of monthObjects) {
      totalAvailableDates += m.availableDateCount;
      totalAppointments += m.appointmentCount;
      totalAvailabledAppointments += m.totalMaxAppointments;
      completedAppointmentCount += m.completedAppointmentCount;
      missedAppointmentCount += m.missedAppointmentCount;
    }

    totalAppointmentsPercentage = (
      totalAppointments / totalAvailabledAppointments
    ).toFixed(3);

    const s = {
      startingMonth: startingMonth,
      endingMonth: endingMonth,
      totalAvailableDates: totalAvailableDates,
      totalAppointments: totalAppointments,
      totalAppointmentsPercentage: totalAppointmentsPercentage,
      totalAvailabledAppointments: totalAvailabledAppointments,
      totalCompletedAppointments: completedAppointmentCount,
      totalMissedAppointments: missedAppointmentCount,
    };

    summary = s;
  };


// Call the function to get available dates
getSelectedRangeAvailableDates();


//console.log("@const: selectedRangeAvailableDates => ",selectedRangeAvailableDates);

//console.log("@const: selectedRangeAppointments => ",selectedRangeAppointments);


// If available dates are fetched successfully, get the appointments next,
// and create relevant month objects and get the summary
emitter.on("selectedRangeAvailableDates", () => {
    
    isSelectedRangeAvailableDatesSet = true;
    getSelectedRangeAppointments();
    console.log("selectedAvailableDates set");

    if (isSelectedRangeAvailableDatesSet && isSelectedRangeAppointmentsSet) { 
        arrangeDetailsByMonth();
        getSummary();
        
        emitter.emit("detailsOk");
    }
})

// If appointments are fetched successfully, create relevant month objects and get the summary
emitter.on("selectedRangeAppointments", () => {
    isSelectedRangeAppointmentsSet = true;

    console.log("selectedRangeAppointments set");
    if (isSelectedRangeAvailableDatesSet && isSelectedRangeAppointmentsSet) {
        arrangeDetailsByMonth();
        getSummary();
        
        emitter.emit("detailsOk");
        
    }
})


//console.log("@const: monthObjects => ", monthObjects);
//console.log("@const: summary => ", summary);

/*
If all details are available, create the pdf
*/
emitter.on("detailsOk", () => {
    console.log("@medMonthlyReport => Pdf details Ok!");
    //console.log("@const: monthObjects => ", monthObjects);
    //console.log("@const: summary => ", summary);
    isDetailsSet = true;
    setupMonthlyReportLogic(monthObjects);
})



/*
 * 
 * 
 Generate the pdf function
 * 
 */
const setupMonthlyReportLogic = async (monthObjects) => {
    // Create a new PDFDocument
    const doc = new PDFDocument({size: 'A4'});
  
    // Specify the directory where you want to save the PDF file
    const directoryPath =
      "./pdf";
  
    // Specify the filename (example.pdf in this case)
    const filename = "report.pdf";
  
    // Combine the directory path and filename to get the full path to the file
    const filePath = path.join(directoryPath, filename);
  
    // Pipe the PDF document to the write stream with the specified file path
    doc.pipe(fs.createWriteStream(filename, {flags: 'w'}));

    /* ====================== Chart data ==================== */

    const availableDatesChartImageData = await generateLineChartForAvailableDates(monthObjects);

    const scheduledAppointmentsChartImageData = await generateLineChartForScheduledAppointments(monthObjects, 500, 300);
    
    const appointmentCompletionChartImageData = await generateLineChartForAppointmentCompletion(monthObjects, 500, 300);
  

    /* ====================== Design the document ==================== */
    doc.image('required/reportHeader1.png', 0, 0, {width: 600, height: 120 , align: "center",});

    doc.fontSize(15).fillColor('gray').text("Summary", 72, 140).fillColor('black').fontSize(10);

    doc.moveDown();
    doc.text(`Time period: ${summary.startingMonth} To ${summary.endingMonth}`, 80);
    doc.moveDown();
    doc.text(`Total available dates: ${summary.totalAvailableDates}`);
    doc.moveDown();
    doc.text(`Total availabled appointments: ${summary.totalAvailabledAppointments}`);
    doc.moveDown();
    doc.text(`Total scheduled appointments: ${summary.totalAppointments}  Percentage: ${summary.totalAppointmentsPercentage}%`);
    
    doc.moveDown();
    doc.text(`Total completed appointments: ${summary.totalCompletedAppointments}`);
    doc.moveDown();
    doc.text(`Total incompleted appointments: ${summary.totalMissedAppointments}`);

    doc.rect(72, 320, 500, 0, 0);
    doc.stroke('gray');

    doc.fontSize(15).fillColor('gray').text("Available Dates", 72, 330).fillColor('black').fontSize(10);

    // ========== Available dates chart ==========
    doc.image(availableDatesChartImageData, 72, 350,  {
        width: 300,
        height: 200,
      });

    // ========== Available dates summary table ==========
    // Table header
    doc.fontSize(10);
    doc.text('Month', 380, 350, {width: 100});
    doc.text('Dates', 430, 350, {width: 130});
    doc.text('Change', 500, 350, {width: 100});

    // Table data
    doc.fontSize(9).fillColor('gray');
    let y = 370; // Initial y-coordinate for table data
    monthObjects.forEach(month => {

        doc.text(month.monthName, 380, y, { width: 100 });
        doc.text(`${month.availableDateChange}%`, 500, y, { width: 100 });

    const availableDatesText = month.availableDatesDateOnly.join(', ');

    
    // Check if the text overflowed to multiple lines
    if (availableDatesText.length > 15) {
        // Adjust y-coordinate for the next row
        count = 0

        while (count < availableDatesText.length) {
            if ((availableDatesText.length - (count)) >= 15) {
                doc.text(availableDatesText.substring(count, count+16), 430, y, { width: 130 });
                count += 16;
                y+=10;
            } else {
                doc.text(availableDatesText.substring(count), 430, y, { width: 130 });
                count += (availableDatesText.length - (count));
            }
        }
    } else {
        doc.text(availableDatesText, 430, y, { width: 130 });
    }
    
    y += 20; // Increment y-coordinate for the next row
    });

    // ========== Available dates end==========

    if (y <= 470) { y = 570}
    doc.rect(72, y, 500, 0, 0);
    doc.stroke('gray');


    // ========== Scheduled appointments chart ==========
    y+=20;
    doc.fontSize(15).fillColor('gray').text("Scheduled Appointments", 72, y).fillColor('black').fontSize(10);
    
    y+=20;
    doc.image(scheduledAppointmentsChartImageData, 72, y, {
        width: 300,
        height: 200,
    });

    // ========== Scheduled appointments summary table ==========
     // Table header
     doc.fontSize(10).fillColor('black');
     doc.text('Month', 380, y, {width: 100});
     doc.fontSize(7).text('Scheduled', 420, y, {width: 35});
     doc.text('Availabled', 460, y, {width: 35});
     doc.fontSize(10).text('Percentage', 500, y, {width: 100});
 
     // Table data
     doc.fontSize(9).fillColor('gray');
     y += 20;

     monthObjects.forEach(month => {
 
         doc.text(month.monthName, 380, y, { width: 100 });
         doc.text(month.appointmentCount, 420, y, { width: 100 });
         doc.text(month.totalMaxAppointments, 460, y, { width: 100 });
         doc.text(`${(month.appointmentCount / month.totalMaxAppointments).toFixed(2)}%`, 500, y, { width: 100 });
         
        y += 20; // Increment y-coordinate for the next row
     });

    // ========== Scheduled appointments end ==========

    doc.addPage();
    

    // ========== Appointment completion chart ============
    y = 40;
    doc.rect(72, y, 500, 0, 0);
    doc.stroke('gray');
    y += 20;

    doc.fontSize(15).fillColor('gray').text("Appointment Completion", 72, y).fillColor('black').fontSize(10);

    y += 20;
    doc.image(appointmentCompletionChartImageData, 72, y, {
        width: 300,
        height: 200,
    });

    // ========== Appointment completion summary table ==========
     // Table header
     doc.fontSize(10).fillColor('black');
     doc.text('Month', 380, y, {width: 100});
     doc.fontSize(7).text('Completed', 420, y, {width: 35});
     doc.text('Incompleted', 460, y, {width: 35});
     doc.fontSize(10).text('Com / Sch', 500, y, {width: 100});
 
     // Table data
     doc.fontSize(9).fillColor('gray');
     y += 20;

     monthObjects.forEach(month => {
 
         doc.text(month.monthName, 380, y, { width: 100 });
         doc.text(month.completedAppointmentCount, 420, y, { width: 100 });
         doc.text(month.missedAppointmentCount, 460, y, { width: 100 });
         doc.text(`${month.appointmentCount !== 0 ? (((month.completedAppointmentCount)* 100)/(month.appointmentCount)).toFixed(2) : Number(0).toFixed(2)}%`, 500, y, { width: 100 });
         
        y += 20; // Increment y-coordinate for the next row
     });



    // ========== Appointment completion end ============

    // End the document
    if (isDetailsSet) {
        console.log("@setupMonthlyReportLogic() => Pdf created");
        doc.end();
    }
};


/* ================ Functions to create the charts ================ */

// Function to generate the line chart for the available dates
const generateLineChartForAvailableDates = async (monthObjects) => {
    const labels = monthObjects.map((data) => data.monthName);
    const data = monthObjects.map((data) => data.availableDateCount);
  
    const configuration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Available Dates',
          data: data,
          fill: false,
          borderColor: '#FFC15E',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months'
            },
            ticks: {
                font: {
                    size: 15
                }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Available Date Count'
            },
            ticks: {
                font: {
                    size: 15
                }
            }
          }
        }
      }
    };
  
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 });
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  };


// Function to generate the line chart
const generateLineChartForScheduledAppointments = async (monthObjects, width, height) => {
    const labels = monthObjects.map((data) => data.monthName);
    const data = monthObjects.map((data) => data.appointmentCount);
  
    const configuration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Appointment Count',
          data: data,
          fill: false,
          borderColor: '#FFC15E',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Appointment Count'
            }
          }
        }
      }
    };
  
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height });
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  };


  const generateLineChartForAppointmentCompletion = async (monthObjects, width, height) => {
    const labels = monthObjects.map((data) => data.monthName);
    const completedData = monthObjects.map((data) => data.completedAppointmentCount);
    const missedData = monthObjects.map((data) => data.missedAppointmentCount);
  
    const configuration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Completed Appointment Count',
          data: completedData,
          fill: false,
          borderColor: '#FFC15E',
          tension: 0.1
        },
        {
          label: 'Missed Appointment Count',
          data: missedData,
          fill: false,
          borderColor: '#000000',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Appointment Count'
            }
          }
        }
      }
    };
  
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: width, height: height });
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  };
  
/* ================ Functions to create the charts  end ================ */
}

module.exports = generateReport;

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
