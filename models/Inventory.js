import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },                  // Item name
  type: { 
    type: String, 
    enum: ['Curtain', 'Other Accessories', 'Poles'],       // Item categories
    required: true 
  },
  costPrice: { type: Number, required: true },             // Cost price per unit
  sellPrice: { type: Number, required: true },             // Selling price per unit
  quantity: { type: Number, required: true, default: 0 }   // Stock quantity
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);