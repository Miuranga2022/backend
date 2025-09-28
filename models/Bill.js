import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  billNo: { type: String, required: true, unique: true }, // <-- add this

  billTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  paidAmount: { type: Number, required: true },
  paymentType: {
    type: String,
    enum: ['cash', 'card', 'bank-transfer'],
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);
