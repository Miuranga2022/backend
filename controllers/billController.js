import Bill from '../models/Bill.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Stock from '../models/Stock.js';
import mongoose from 'mongoose';
import { printBill } from './printer.js';

// Get all bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: 'orderId',
        populate: { path: 'customerId' } // populate customer inside order
      });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new bill
export const createBill = async (req, res) => {
  try {
    const { orderId, billTotal, discount, paidAmount, paymentType } = req.body;
    const newBill = new Bill({ orderId, billTotal, discount, paidAmount, paymentType });
    const savedBill = await newBill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addPaymentToOrder = async (req, res) => {
  try {
    const { orderId, paidAmount, discount = 0, paymentType, billTotal } = req.body;

    const order = await Order.findById(orderId).populate('customerId'); 
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const newBalance = order.balance - paidAmount;
    if (newBalance < 0) return res.status(400).json({ message: 'Paid amount exceeds balance' });

    // Generate bill number
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const todayEnd = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);
    const todayCount = await Bill.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    const sequenceNumber = String(todayCount + 1).padStart(3, "0");
    const billNo = `ORD-${yyyy}${mm}${dd}-${sequenceNumber}`;

    // Create new bill
    let bill = new Bill({
      orderId,
      billNo,
      billTotal,
      discount,
      paidAmount,
      paymentType
    });
    bill = await bill.save();

    // Populate for response
    bill = await Bill.findById(bill._id).populate({
      path: 'orderId',
      populate: { path: 'customerId' }
    });

    // Update order balance & status
    order.balance = newBalance;
    order.paymentStatus = newBalance === 0 ? 'paid' : 'partial';
    await order.save();

    // Fetch previous bills to calculate previous payments
    const previousBills = await Bill.find({ orderId, _id: { $ne: bill._id } });
    const previousPaid = previousBills.reduce((sum, b) => sum + b.paidAmount, 0);

    // Prepare data for printer
    const billData = {
      billNo,
      customerName: order.customerId?.name,
      customerMobile: order.customerId?.mobile1,
      customerAddress: order.customerId?.address,
      fixingDate: order.fixingDate,
      items: await OrderItem.find({ orderId }).lean(),
      subTotal: order.orderAmount,
      discountAmount: 0,
      grandTotal: order.orderAmount,
      previousPaid,
      todayPaid: paidAmount,
      remainingBalance: newBalance,
    };

    // Print the bill
    await printBill(billData);

    res.status(201).json({ message: 'Payment added and bill printed successfully', bill, order });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};



export const cancelBill = async (req, res) => {
  try {
    const billId = req.params.billId;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Find all order items linked to this bill
    const orderItems = await OrderItem.find({ billId });  // ✅ now works

    for (const item of orderItems) {
      if (!item.stockId) continue;
      await Stock.findByIdAndUpdate(item.stockId, { $inc: { quantity: item.itemQuantity } });
    }

    await OrderItem.deleteMany({ billId });
    await Bill.findByIdAndDelete(billId);

    return res.status(200).json({ message: 'Bill canceled and stock updated' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

