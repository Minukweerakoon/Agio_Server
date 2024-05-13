

const express = require('express');
const router = express.Router();
const UniformShirt = require('../models/UniformShirtModel');

// Route to handle POST request to add shirt inventory
router.post('/', async (req, res) => {
  try {
    const { size, quantity } = req.body;
    const newShirt = new UniformShirt({ size, quantity });
    await newShirt.save();
    res.status(201).json({ message: 'Shirt inventory added successfully' });
  } catch (error) {
    console.error('Error adding shirt inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to handle GET request to retrieve all shirt inventory items
router.get('/', async (req, res) => {
    try {
      const shirtInventory = await UniformShirt.find();
      res.json(shirtInventory);
    } catch (error) {
      console.error('Error fetching shirt inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route to handle GET request to retrieve a specific shirt inventory item by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const shirtInventoryItem = await UniformShirt.findById(id);
      
      if (!shirtInventoryItem) {
        return res.status(404).json({ error: 'Shirt inventory item not found' });
      }
      
      res.json(shirtInventoryItem);
    } catch (error) {
      console.error('Error fetching shirt inventory item:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to handle PUT request to update shirt inventory
router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { size, quantity } = req.body;
  
      const updatedShirt = await UniformShirt.findByIdAndUpdate(
        id,
        { size, quantity },
        { new: true } 
      );
  
      if (!updatedShirt) {
        return res.status(404).json({ error: 'Shirt inventory not found' });
      }
  
      res.json({ message: 'Shirt inventory updated successfully', updatedShirt });
    } catch (error) {
      console.error('Error updating shirt inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;
