const express = require("express");
const app = express();
require('dotenv').config()  // env configuration
const dbConfig = require("./config/dbConfig");
app.use(express.json());
const userRoute = require("./routes/userRoute");

app.use('/api/user', userRoute);
const port = process.env.PORT || 5000;


app.listen(port, () => console.log(`Nodemon Server started at port ${port}`));