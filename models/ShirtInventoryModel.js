// ShirtInventoryModel.js
const mongoose = require('mongoose');

const ShirtInventorySchema = new mongoose.Schema({
  Size: String,
  Quantity: Number
});

module.exports = mongoose.model('ShirtInventory', ShirtInventorySchema);
