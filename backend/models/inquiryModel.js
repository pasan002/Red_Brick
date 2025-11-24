import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  packageType: {
    type: String,
    required: true,
    enum: ['Design & Build', 'Build Only', 'Renovation/Maintenance']
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry; 