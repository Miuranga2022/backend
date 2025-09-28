// models/DailyReport.js
import mongoose from "mongoose";

const dailyReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true, // Only one report per date
  },

  attendance: [
    {
      employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      date: String,
      inTime: String,
      outTime: String,
      otHours: Number,
      dailySalary: Number,
    },
  ],

  advances: [
    {
      employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      date: String,
      amount: Number,
    },
  ],

  bills: [
    {
      billTotal: Number,
      discount: Number,
      paidAmount: Number,
      paymentType: String,
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    },
  ],

  orders: [
    {
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      fixingDate: Date,
      orderStatus: String,
      orderAmount: Number,
      balance: Number,
      paymentStatus: String,
    },
  ],

  orderItems: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
      itemName: String,
      itemQuantity: Number,
      itemRate: Number,
      costPrice: Number,
      total: Number,
    },
  ],

  supplierBills: [
    {
      supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
      items: [
        {
          itemName: String,
          itemType: String,
          itemColor: String,
          quantity: Number,
          cost: Number,
          sellPrice: Number,
        },
      ],
      totalBill: Number,
      paidAmount: Number,
      paymentDate: Date,
    },
  ],

  paidBills: [
    {
      supplierBill: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierBill" },
      paidAmount: Number,
      paidDate: Date,
    },
  ],

  expenses: [
    {
      name: String,
      amount: Number,
      date: Date,
    },
  ],

  stocks: [
    {
      // You can expand this later if needed
      itemName: String,
      quantity: Number,
      costPrice: Number,
      sellPrice: Number,
    },
  ],
});

export default mongoose.model("DailyReport", dailyReportSchema);
