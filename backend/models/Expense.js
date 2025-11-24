import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['material', 'labor', 'equipment', 'transport', 'utilities', 'other']
  },
  date: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'credit', 'debit', 'check', 'transfer']
  },
  projectId: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  receipt: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Expense', expenseSchema);