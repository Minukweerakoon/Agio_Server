// SkirtInventoryModel.js
const mongoose = require('mongoose');

const SkirtInventorySchema = new mongoose.Schema({
  WaistSize: Number,
  Quantity: Number
});

module.exports = mongoose.model('SkirtInventory', SkirtInventorySchema);
