const mongoose = require('mongoose');

const uniformSkirtSchema = new mongoose.Schema({
  waistSize: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const UniformSkirt = mongoose.model('UniformSkirt', uniformSkirtSchema);

module.exports = UniformSkirt;
