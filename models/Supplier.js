import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true },
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "SupplierBill" }]
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);
