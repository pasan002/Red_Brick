import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inquiry_received', 'project_created', 'project_updated', 'project_deleted'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
}, { 
  timestamps: true 
});

export default mongoose.model('Notification', notificationSchema); 