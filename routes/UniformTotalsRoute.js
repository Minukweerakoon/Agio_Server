// routes/UniformTotalsRoute.js
const express = require('express');
const router = express.Router();
const UniformOrderModel = require('../models/UniformOrderModel');

// Route to fetch total number of shirts and skirts
router.get('/totals', async (req, res) => {
  try {
    // Calculate total number of shirts for factory workers
    const factoryWorkerShirtTotals = await UniformOrderModel.aggregate([
      { $match: { position: 'Factory Worker' } },
      {
        $group: {
          _id: '$tshirtSize',
          totalShirts: { $sum: '$uniformCount' }
        }
      }
    ]);

    // Calculate total number of skirts for factory workers
    const factoryWorkerSkirtTotals = await UniformOrderModel.aggregate([
      { $match: { position: 'Factory Worker' } },
      {
        $group: {
          _id: '$waistSize',
          totalSkirts: { $sum: '$uniformCount' }
        }
      }
    ]);

    // Calculate total number of shirts for executives
    const executiveShirtTotals = await UniformOrderModel.aggregate([
      { $match: { position: 'Executive' } },
      {
        $group: {
          _id: '$tshirtSize',
          totalShirts: { $sum: '$uniformCount' }
        }
      }
    ]);

    res.json({ factoryWorkerShirtTotals, factoryWorkerSkirtTotals, executiveShirtTotals });
  } catch (error) {
    console.error('Error fetching uniform totals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
