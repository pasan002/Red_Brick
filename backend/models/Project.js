import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial', 'Industrial', 'Infrastructure']
  },
  location: {
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
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled']
  },
  budget: {
    type: Number,
    required: true
  },
  manager: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
