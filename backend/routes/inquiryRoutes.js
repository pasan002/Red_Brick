import express from 'express';
import Inquiry from '../models/inquiryModel.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// @route   POST /api/inquiries
// @desc    Submit a new inquiry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { selectedPackage, name, email, message } = req.body;
    
    if (!selectedPackage || !name || !email || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const newInquiry = new Inquiry({
      packageType: selectedPackage,
      name,
      email,
      message
    });
    
    const savedInquiry = await newInquiry.save();
    
    res.status(201).json({ 
      success: true,
      data: savedInquiry 
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Public (temporary for debugging)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 