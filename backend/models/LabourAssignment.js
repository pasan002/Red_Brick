import mongoose from 'mongoose';

const labourAssignmentSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    required: true
  },
  taskCode: {
    type: String,
    required: true
  },
  labourType: {
    type: String,
    required: true,
    enum: ['Mason', 'Helper', 'Carpenter', 'Steel Fixer', 'Plumber', 'Electrician', 'Painter']
  },
  numberOfLabourers: {
    type: Number,
    required: true,
    min: 1
  },
  assignmentDate: {
    type: Date,
    required: true
  },
  siteName: {
    type: String,
    required: true
  },
  supervisor: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('LabourAssignment', labourAssignmentSchema);