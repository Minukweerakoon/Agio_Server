// UniformOrderRoute.js
const express = require('express');
const UniformOrder = require('../models/UniformOrderModel');


const router = express.Router();

// Create a new uniform order
router.post('/', async (req, res) => {
  try {
    const { position, tshirtSize, waistSize, uniformCount } = req.body;

    // Create a new uniform order
    const newUniformOrder = new UniformOrder({
      position,
      tshirtSize,
      waistSize,
      uniformCount,
    });

    // Save the new uniform order to the database
    await newUniformOrder.save();

    res.status(201).json({ message: 'Uniform order placed successfully!', uniformOrder: newUniformOrder });
  } catch (error) {
    console.error('Error placing uniform order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
