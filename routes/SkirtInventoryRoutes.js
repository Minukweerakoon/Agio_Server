// skirtInventoryRoutes.js
const express = require('express');
const router = express.Router();
const SkirtInventory = require('../models/SkirtInventoryModel');

// Define routes for fetching Skirt inventory data
router.get('/SkirtInventory', async (req, res) => {
  try {
    const inventory = await SkirtInventory.find();
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching Shirt inventory:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
