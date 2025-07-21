const express = require('express');
const router = express.Router();
const { isAuthenticated, isClient } = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');

// Initialize payment
router.post('/initialize', isAuthenticated, isClient, async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId).populate('agent');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if client has already unlocked this agent
    const client = await User.findById(req.session.user._id);
    if (client.unlockedAgents.includes(property.agent._id)) {
      return res.status(400).json({ error: 'Agent already unlocked' });
    }

    // For demo purposes, simulate successful payment initialization
    const mockPaymentData = {
      authorization_url: '#',
      access_code: 'demo_access_code',
      reference: `unlock_${Date.now()}_${req.session.user._id}`
    };

    res.json({
      success: true,
      data: mockPaymentData
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Payment callback
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query;

    // For demo purposes, simulate successful payment
    // In production, this would verify with Paystack
    req.flash('success_msg', 'Payment feature is ready! In production, this would process the actual payment.');
    res.redirect('/client/dashboard');
  } catch (error) {
    console.error('Payment callback error:', error);
    req.flash('error_msg', 'Payment verification failed');
    res.redirect('/client/dashboard');
  }
});

module.exports = router;