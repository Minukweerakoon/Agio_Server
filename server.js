const express = require("express");
const app = express();
require('dotenv').config()  // env configuration
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");
const TransportRoute = require("./routes/TransportRoute")

const employeeRoute = require("./routes/employeeRoute")
const leaveRoute = require("./routes/leaveRoute")
const insuranceRoute = require("./routes/insuranceRoute");

const authMiddleware2 = require("./middleware/authMiddleware2");

const inquiryRoute = require("./routes/inquiryRoute")

const cors = require('cors');


app.use(cors())


const UniformOrderRoute = require("./routes/UniformOrderRoute");
const UniformShirtRoute = require('./routes/UniformShirtRoute'); 
const uniformSkirtRoute = require('./routes/UniformSkirtRoute');
const UniformTotalsRoute = require("./routes/UniformTotalsRoute");

const uniformOrderRoute = require('./routes/UniformOrderRoute');
const UniformOrder = require('./models/UniformOrderModel');


//performance
const excelupload = require("./routes/Per_excel.js");


app.use('/api/user', userRoute);

app.use('/api/employee', employeeRoute);
app.use('/api/leave', leaveRoute);
app.use('/api/uniform-orders', uniformOrderRoute);


app.use('/api/UniformOrder', UniformOrderRoute);
app.use('/api/UniformShirt', UniformShirtRoute);
app.use('/api/UniformSkirt', uniformSkirtRoute);
app.use('/api/UniformTotals', UniformTotalsRoute);


app.use('/api/inquiry/', inquiryRoute);


app.use('/api/insurance', insuranceRoute)



app.use('/uploads', express.static('uploads'));

app.use('/api/TransportRoute',TransportRoute)

//performance
app.use("/exceldata",excelupload);


const workoutRoutes= require('./routes/annWorkouts');//from routes




const port = process.env.PORT || 5001;


//announcement

app.use((req,res,next)=>{
    console.log(req.path,req.method)
    next()
 }) 
 app.use('/api/annWorkouts',workoutRoutes)

 
// medical
const medDoctorRoute = require("./routes/medDoctorRoute");
// whenever an api request is coming with the keywords /api/medDoctor
// search for endpoints in medDoctorRoute
app.use('/api/medDoctor', medDoctorRoute);

const medEmployeeRoute = require("./routes/medEmployeeRoute");
// whenever an api request is coming with the keywords /api/medEmployee
// search for endpoints in medEmployeeRoute
app.use('/api/medEmployee', medEmployeeRoute);



// Run the medEmailScheduler
const medEmailScheduler = require("./schedulers/medEmailScheduler");
// Run the medSMSScheduler
const medSMSScheduler = require("./schedulers/medSMSScheduler.js");


// Client connection to listen for request


/*app.get("/", (req, res) => {
    console.log("Client connected");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
  
    const intervalId = setInterval(() => {
        const date = new Date().toString();
        res.write(`data: ${date}\n\n`)
    }, 1000)
  

  
    res.on("close", () => {
      console.log("Client closed connection");
      //clearInterval(intervalId);
      res.end();
    })
  });*/
  





 
 
app.listen(port, () => console.log(`Nodemon Server started at port ${port}`));

