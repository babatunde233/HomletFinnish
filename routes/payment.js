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

    // Generate unique reference
    const reference = `unlock_${Date.now()}_${req.session.user._id}`;
    
    // For demo purposes, simulate successful payment initialization
    const mockPaymentData = {
      authorization_url: `https://checkout.paystack.com/${reference}`,
      access_code: 'demo_access_code',
      reference: reference
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

    if (!reference) {
      req.flash('error_msg', 'Invalid payment reference');
      return res.redirect('/client/dashboard');
    }

    // For demo purposes, simulate successful payment verification
    // In production, this would verify with Paystack API
    
    // Extract property and user info from reference
    const parts = reference.split('_');
    if (parts.length < 3) {
      req.flash('error_msg', 'Invalid payment reference format');
      return res.redirect('/client/dashboard');
    }
    
    const userId = parts[2];
    
    // Update client's unlocked agents (this would be done after successful payment verification)
    req.flash('success_msg', '🎉 Payment successful! Agent contact has been unlocked.');
    res.redirect('/client/dashboard');
  } catch (error) {
    console.error('Payment callback error:', error);
    req.flash('error_msg', 'Payment verification failed');
    res.redirect('/client/dashboard');
  }
});

module.exports = router;