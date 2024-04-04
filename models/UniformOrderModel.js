const mongoose = require('mongoose');

const uniformOrderSchema = new mongoose.Schema({
    employeeNumber: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    tshirtSize: {
        type: String,
        required: true
    },
    waistSize: {
        type: String,
        required: function() {
            return this.position === 'Factory Worker'; // Only required if position is 'Factory Worker'
        }
    },
    uniformCount: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

const UniformOrderModel = mongoose.model('UniformOrder', uniformOrderSchema);

module.exports = UniformOrderModel;
