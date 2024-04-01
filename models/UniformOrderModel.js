// UniformOrderModel.js
const mongoose = require('mongoose');

const uniformOrderSchema = new mongoose.Schema({
  position: String,
  tshirtSize: String,
  waistSize: String,
  uniformCount: Number,
});

const UniformOrder = mongoose.model('UniformOrder', uniformOrderSchema);

module.exports = UniformOrder;
