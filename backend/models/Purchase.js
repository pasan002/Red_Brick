import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    required: true
  },
  materialType: {
    type: String, 
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'm3', 'bags']
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Purchase', purchaseSchema);