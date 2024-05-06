const mongoose = require('mongoose');

const supplierDetailsSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  numberOfUnits: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const SupplierDetails = mongoose.model('SupplierDetails', supplierDetailsSchema);

module.exports = SupplierDetails;
