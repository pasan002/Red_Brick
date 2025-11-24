import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    required: true
  },
  taskCode: {
    type: String,
    required: true,
    unique: true
  },
  taskType: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  siteName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);