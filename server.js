 const express = require("express");
const app = express();
require('dotenv').config()  // env configuration
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");
const workoutRoutes= require('./routes/annWorkouts')//from routes

app.use('/api/user', userRoute);
const port = process.env.PORT || 5001;

//announcement

app.use((req,res,next)=>{
    console.log(req.path,req.method)
    next()
 }) 
 app.use('/api/annWorkouts',workoutRoutes)

 

 
 
app.listen(port, () => console.log(`Nodemon Server started at port ${port}`));