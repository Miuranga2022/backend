import SupplierBill from "../models/SupplierBill.js";
import Supplier from "../models/Supplier.js";
import Stock from "../models/Stock.js";
import PaidBill from "../models/PaidBill.js";

// Create Supplier Bill & Update Stock
export const createSupplierBill = async (req, res) => {
  try {
    const { supplierId, items, totalBill, paymentDate } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // 1. Create Supplier Bill
    const bill = new SupplierBill({
      supplier: supplierId,
      items,
      totalBill,
      paidAmount: 0,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
    });
    await bill.save();

    // 2. Update or add items to stock
    for (let item of items) {
      const existingStock = await Stock.findOne({ 
        itemName: item.itemName, 
        itemType: item.itemType,
        itemColor: item.itemColor // optional, include if you want to separate colors
      });

      if (existingStock) {
        // Update existing stock details
        existingStock.quantity += Number(item.quantity); 
        existingStock.cost = Number(item.cost);
        existingStock.sellPrice = Number(item.sellPrice);
        await existingStock.save();
      } else {
        // Create new stock item
        await Stock.create({
          itemName: item.itemName,
          itemType: item.itemType,
          itemColor: item.itemColor,
          quantity: Number(item.quantity),
          cost: Number(item.cost),
          sellPrice: Number(item.sellPrice),
          supplierBill: bill._id
        });
      }
    }

    // 3. Link Bill to Supplier
    await Supplier.findByIdAndUpdate(supplierId, { $push: { bills: bill._id } });

    res.status(201).json({ message: "Bill created and stock updated", bill });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all bills for a supplier including payments
export const getSupplierBills = async (req, res) => {
  try {
    const { supplierId } = req.query;
    if (!supplierId) return res.status(400).json({ message: "supplierId is required" });

    const bills = await SupplierBill.find({ supplier: supplierId })
      .populate("supplier", "name address mobile")
      .lean();

    const billsWithPayments = await Promise.all(
      bills.map(async (bill) => {
        const payments = await PaidBill.find({ supplierBill: bill._id }).lean();
        const paidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);
        return {
          ...bill,
          paidAmount,
          payments: payments.map(p => ({ paidAmount: p.paidAmount, paidDate: p.paidDate }))
        };
      })
    );

    res.json(billsWithPayments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
