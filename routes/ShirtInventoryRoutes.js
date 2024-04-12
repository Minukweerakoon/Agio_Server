// shirtInventoryRoutes.js
const express = require('express');
const router = express.Router();
const ShirtInventory = require('../models/ShirtInventoryModel');

// Define routes for fetching Shirt inventory data
router.get('/ShirtInventory', async (req, res) => {
  try {
    const inventory = await ShirtInventory.find();
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching Shirt inventory:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
