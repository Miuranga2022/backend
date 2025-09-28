// models/PaidBill.js
import mongoose from "mongoose";

const paidBillSchema = new mongoose.Schema(
  {
    supplierBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierBill",
      required: true,
    },
    paidAmount: { type: Number, required: true },
    paidDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("PaidBill", paidBillSchema);
