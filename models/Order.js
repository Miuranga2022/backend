// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  fixingDate: { type: Date, required: true },
  orderStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  orderAmount: { type: Number, required: true },
  balance: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
