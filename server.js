const express = require("express");
const app = express();
require('dotenv').config()  // env configuration
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");

const employeeRoute = require("./routes/employeeRoute")
const leaveRoute = require("./routes/leaveRoute")

app.use('/api/user', userRoute);

app.use('/api/employee', employeeRoute);
app.use('/api/leave', leaveRoute);



const workoutRoutes= require('./routes/annWorkouts')//from routes



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