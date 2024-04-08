// UniformOrderRoute.js

const express = require("express");
const router = express.Router();
const UniformOrderModel = require('../models/UniformOrderModel');

// POST route for submitting a uniform order
router.post("/", async (req, res) => {
  try {
    const newUniformOrder = new UniformOrderModel(req.body);
    await newUniformOrder.save();
    res.status(200).json({ message: "Uniform order submitted successfully", success: true });
  } catch (error) {
    console.error('Error submitting uniform order:', error);
    res.status(500).json({ message: "Failed to submit uniform order", success: false });
  }
});

// GET route for retrieving all uniform orders
router.get("/", async (req, res) => {
  try {
    const uniformOrders = await UniformOrderModel.find();
    res.status(200).json(uniformOrders);
  } catch (error) {
    console.error('Error fetching uniform orders:', error);
    res.status(500).json({ message: "Failed to fetch uniform orders", success: false });
  }
});

module.exports = router;
