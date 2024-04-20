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

app.use('/api/user', userRoute);

app.use('/api/employee', employeeRoute);
app.use('/api/leave', leaveRoute);


app.use('/api/UniformOrder', UniformOrderRoute);
app.use('/api/UniformShirt', UniformShirtRoute);
app.use('/api/UniformSkirt', uniformSkirtRoute);
app.use('/api/UniformTotals', UniformTotalsRoute);


app.use('/api/inquiry/', inquiryRoute);


app.use('/api/insurance', insuranceRoute)



app.use('/uploads', express.static('uploads'));

app.use('/api/TransportRoute',TransportRoute)




const workoutRoutes= require('./routes/annWorkouts');//from routes




const port = process.env.PORT || 5001;


//announcement

app.use((req,res,next)=>{
    console.log(req.path,req.method)
    next()
 }) 
 app.use('/api/annWorkouts',workoutRoutes)

 

 
 
app.listen(port, () => console.log(`Nodemon Server started at port ${port}`));