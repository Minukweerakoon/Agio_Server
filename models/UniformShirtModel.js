// UniformShirtModel.js

const mongoose = require('mongoose');

const uniformShirtSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const UniformShirt = mongoose.model('UniformShirt', uniformShirtSchema);

module.exports = UniformShirt;
