

const express = require("express");
const router = express.Router();
const UniformOrderModel = require('../models/UniformOrderModel');

// POST route for submitting a uniform order
router.post("/", async (req, res) => {
  try {
    const { employeeNumber, position, tshirtSize, waistSize, uniformCount } = req.body;
    
    // Here, you can perform any necessary validations on the form data
    
    // Create a new instance of the UniformOrderModel and save it to the database
    const newUniformOrder = new UniformOrderModel({
      employeeNumber,
      position,
      tshirtSize,
      waistSize,
      uniformCount
    });
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

// GET route for retrieving a uniform order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await UniformOrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Uniform order not found", success: false });
    }
    res.status(200).json({ message: "Uniform order found", success: true, order });
  } catch (error) {
    console.error('Error fetching uniform order by ID:', error);
    res.status(500).json({ message: "Failed to fetch uniform order", success: false });
  }
});

// PUT route for modifying a uniform order
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await UniformOrderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Uniform order modified successfully", success: true, updatedOrder });
  } catch (error) {
    console.error('Error modifying uniform order:', error);
    res.status(500).json({ message: "Failed to modify uniform order", success: false });
  }
});

// DELETE route for deleting a uniform order
router.delete("/:id", async (req, res) => {
  try {
    await UniformOrderModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Uniform order deleted successfully", success: true });
  } catch (error) {
    console.error('Error deleting uniform order:', error);
    res.status(500).json({ message: "Failed to delete uniform order", success: false });
  }
});

// Route to fetch total number of shirts ordered by Factory Workers
router.get('/shirtTotals', async (req, res) => {
  try {
    const shirtTotals = await UniformOrderModel.aggregate([
      { $match: { position: 'Factory Worker', tshirtSize: { $exists: true } } },
      {
        $group: {
          _id: '$tshirtSize',
          totalShirts: { $sum: '$uniformCount' }
        }
      }
    ]);
    res.json(shirtTotals);
  } catch (error) {
    console.error('Error fetching shirt totals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
