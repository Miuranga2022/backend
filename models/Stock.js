// models/Stock.js
import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemType: { 
    type: String, 
    enum: ["Curtain", "Poles", "Other Accessories"], // ✅ restricted
    required: true
  },
  itemColor: { type: String },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  supplierBill: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierBill" }
}, { timestamps: true });

export default mongoose.model("Stock", stockSchema);
