import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  manufacturer: String,
  serialNumber: String,
  status: { type: String, required: true, enum: ['Stocked', 'Rented'] },
  condition: { type: String, required: true, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Under Repair'] },
  location: { type: String, required: true },
  notes: String,
  purchaseDate: Date,
  lastMaintenanceDate: Date,
  rentalStart: Date,
  rentalEnd: Date,
  vendorName: String,
  vendorContact: String,
  rentalCost: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Equipment', equipmentSchema);