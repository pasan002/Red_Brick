import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications (sorted by most recent first)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50); // Limiting to the 50 most recent notifications
    
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { message, type, inquiryId, projectId } = req.body;
    
    if (!message || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and type are required' 
      });
    }
    
    const newNotification = new Notification({
      message,
      type,
      inquiryId,
      projectId
    });
    
    await newNotification.save();
    
    res.status(201).json({ success: true, notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    notification.isRead = req.body.isRead !== undefined ? req.body.isRead : true;
    
    await notification.save();
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all/read', async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 