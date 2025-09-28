// models/SupplierBill.js
import mongoose from "mongoose";

const supplierBillSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [
      {
        itemName: { type: String, required: true },
        itemType: {
          type: String,
          enum: ["Curtain", "Poles", "Other Accessories"], // ✅ only allowed values
          required: true,
        },
        itemColor: { type: String },
        quantity: { type: Number, required: true },
        cost: { type: Number, required: true },
        sellPrice: { type: Number, required: true },
      },
    ],
    totalBill: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentDate: { type: Date }, // filled when fully settled
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual field to fetch all related payments
supplierBillSchema.virtual("payments", {
  ref: "PaidBill",
  localField: "_id",
  foreignField: "supplierBill",
});

export default mongoose.model("SupplierBill", supplierBillSchema);
