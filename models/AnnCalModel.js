const mongoose = require('mongoose');

const yearSchema = {
    tName:String,
    bName:String,
    year:String,
    date:String
};
const monthSchema = {
  tName:String,
  bName:String,
  month:String,
  date:String
};
const daySchema = {
  tName:String,
  bName:String,
  fromDay:String,
  toDay:String,
  date:String
};





// modals
const AnnCalModel = {
    year: mongoose.model("year", yearSchema),
    month: mongoose.model("month", monthSchema),
    day: mongoose.model("day", daySchema)
  };
  



module.exports = AnnCalModel;