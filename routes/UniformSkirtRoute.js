const express = require('express');
const router = express.Router();
const UniformSkirt = require('../models/UniformSkirtModel');

// POST request to add a new skirt to inventory
router.post('/', async (req, res) => {
  try {
    const { waistSize, quantity } = req.body;
    
    // Create a new skirt object
    const newSkirt = new UniformSkirt({
      waistSize,
      quantity,
    });

    // Save the new skirt to the database
    await newSkirt.save();

    res.status(201).json({ message: 'Skirt inventory updated successfully' });
  } catch (error) {
    console.error('Error adding skirt to inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET request to retrieve all skirt inventory
router.get('/', async (req, res) => {
    try {
      const skirts = await UniformSkirt.find();
      res.status(200).json(skirts);
    } catch (error) {
      console.error('Error retrieving skirt inventory:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // PUT request to update skirt inventory by ID
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { waistSize, quantity } = req.body;
  
      // Find the skirt by ID and update its properties
      const updatedSkirt = await UniformSkirt.findByIdAndUpdate(id, { waistSize, quantity }, { new: true });
  
      if (!updatedSkirt) {
        return res.status(404).json({ message: 'Skirt not found' });
      }
  
      res.status(200).json({ message: 'Skirt inventory updated successfully', updatedSkirt });
    } catch (error) {
      console.error('Error updating skirt inventory:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
