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
        default: function () {
            return this.position === 'Executive' ? '0' : '';
        },
        required: function () {
            return this.position === 'Factory Worker';
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
