import PaidBill from "../models/PaidBill.js";
import SupplierBill from "../models/SupplierBill.js";

// Pay Supplier Bill
export const paySupplierBill = async (req, res) => {
  try {
    const { supplierBillId, paidAmount } = req.body;

    const payment = new PaidBill({ supplierBill: supplierBillId, paidAmount });
    await payment.save();

    const bill = await SupplierBill.findById(supplierBillId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.paidAmount += Number(paidAmount);
    if (bill.paidAmount >= bill.totalBill) bill.paymentDate = new Date();

    await bill.save();

    res.status(201).json({ message: "Payment recorded", payment, bill });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all payments for a specific bill
export const getPaidBillsBySupplierBill = async (req, res) => {
  try {
    const { supplierBillId } = req.params;
    const payments = await PaidBill.find({ supplierBill: supplierBillId }).sort({ paidDate: 1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
