import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },  // ✅ add this
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
  itemName: { type: String, required: true },
  itemQuantity: { type: Number, required: true },
  itemRate: { type: Number, required: true },
  costPrice: {         // Cost price per unit (new field)
    type: Number,
    required: true,
  },
  total: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('OrderItem', orderItemSchema);
