import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';
import OrderItem from '../models/OrderItem.js';
import Stock from '../models/Stock.js';
import Expense from '../models/Expense.js';
import { printBill } from './printer.js';



// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId', 'name mobile1 address');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new order (basic)
export const createOrder = async (req, res) => {
  try {
    const { customerId, fixingDate, orderStatus, orderAmount, balance, paymentStatus } = req.body;
    const newOrder = new Order({
      customerId,
      fixingDate,
      orderStatus,
      orderAmount,
      balance,
      paymentStatus
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create order with customer, order items, bill
export const createOrderWithCustomer = async (req, res) => {
  try {
    const { customer, orderDetails, items, billDetails } = req.body;

    // --- 1️⃣ Create or find customer ---
    let customerDoc;
    if (customer._id) {
      customerDoc = await Customer.findById(customer._id);
      if (!customerDoc) return res.status(404).json({ message: "Customer not found" });
    } else {
      customerDoc = await Customer.create(customer);
    }

    // --- 2️⃣ Calculate order financials ---
    const subTotal = items.reduce((sum, i) => sum + i.total, 0);
    const discountPercent = billDetails.discount || 0;
    const discountAmount = (subTotal * discountPercent) / 100;
    const grandTotal = subTotal - discountAmount;

    const paidAmount = billDetails.paidAmount || 0;
    const balance = grandTotal - paidAmount;
    const paymentStatus = balance > 0 ? "partial" : "paid";

    // --- 3️⃣ Create order ---
    const order = await Order.create({
      customerId: customerDoc._id,
      fixingDate: orderDetails.fixingDate,
      orderStatus: orderDetails.orderStatus || "pending",
      orderAmount: grandTotal,
      balance,
      paymentStatus,
    });

    // --- 4️⃣ Generate sequential daily bill number safely ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const todayEnd = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

    const lastBill = await Bill.findOne({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ createdAt: -1 });

    let sequenceNumber = "001";
    if (lastBill) {
      const lastSeq = parseInt(lastBill.billNo.split("-").pop(), 10);
      sequenceNumber = String(lastSeq + 1).padStart(3, "0");
    }

    const billNo = `ORD-${yyyy}${mm}${dd}-${sequenceNumber}`;

    // --- 5️⃣ Create bill ---
    const bill = await Bill.create({
      orderId: order._id,
      billNo,
      billTotal: grandTotal,
      discount: discountPercent,
      discountAmount,
      subTotal,
      paidAmount,
      paymentType: billDetails.paymentType,
    });

    // --- 6️⃣ Create order items & reduce stock ---
    const orderItemsData = [];
    for (const i of items) {
      const stockItem = await Stock.findOne({ itemName: i.itemName.trim() });
      if (!stockItem) throw new Error(`Item not found: ${i.itemName}`);
      if (i.itemQuantity > stockItem.quantity) {
        throw new Error(`Not enough stock for ${i.itemName}. Available: ${stockItem.quantity}`);
      }

      await Stock.findByIdAndUpdate(stockItem._id, {
        $inc: { quantity: -i.itemQuantity },
      });

      orderItemsData.push({
        orderId: order._id,
        billId: bill._id,
        stockId: stockItem._id,
        itemName: i.itemName,
        itemQuantity: i.itemQuantity,
        itemRate: i.itemRate,
        costPrice: i.costPrice,
        total: i.total,
      });
    }
    const createdItems = await OrderItem.insertMany(orderItemsData);

    // --- 7️⃣ Prepare data for printing ---
    const billDataForPrint = {
      billNo: bill.billNo,
      customerName: customerDoc.name,
      customerMobile: customerDoc.mobile1,
      customerAddress: customerDoc.address,
      fixingDate: order.fixingDate,
      items: createdItems,
      subTotal,
      discountAmount,
      grandTotal,
      paidAmount,
      balance,
    };

    // --- 8️⃣ Print bill ---
    printBill(billDataForPrint)
      .then(() => console.log("Bill printed successfully"))
      .catch((err) => console.error("Failed to print bill:", err));

    // --- 9️⃣ Return response ---
    const populatedBill = await Bill.findById(bill._id).populate("orderId").lean();
    res.status(201).json({ order, bill: populatedBill, items: createdItems });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


// Quick sell with costPrice in order items
export const quickSell = async (req, res) => {
  try {
    const { items, discount = 0, paidAmount, paymentType } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // --- Calculate totals ---
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subTotal * discount) / 100;
    const grandTotal = subTotal - discountAmount;
    const balance = grandTotal - paidAmount;

    // --- Generate unique daily bill number using last bill ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const todayEnd = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

    const lastBill = await Bill.findOne({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ createdAt: -1 });

    let sequenceNumber = "001";
    if (lastBill) {
      const lastSeq = parseInt(lastBill.billNo.split("-").pop(), 10);
      sequenceNumber = String(lastSeq + 1).padStart(3, "0");
    }

    const billNo = `QS-${yyyy}${mm}${dd}-${sequenceNumber}`;

    // --- Create the bill ---
    const bill = await Bill.create({
      billNo,
      billTotal: grandTotal,
      discount,
      paidAmount,
      paymentType,
    });

    // --- Reduce stock & prepare items ---
    const orderItemsData = [];
    for (const item of items) {
      const stockItem = await Stock.findOne({ itemName: item.itemName.trim() });
      if (!stockItem) throw new Error(`Item not found: ${item.itemName}`);
      if (item.itemQuantity > stockItem.quantity) {
        throw new Error(
          `Not enough stock for ${item.itemName}. Available: ${stockItem.quantity}`
        );
      }

      await Stock.findByIdAndUpdate(stockItem._id, {
        $inc: { quantity: -item.itemQuantity },
      });

      orderItemsData.push({
        billId: bill._id,
        stockId: stockItem._id,
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        itemRate: item.itemRate,
        costPrice: item.costPrice,
        total: item.total,
      });
    }

    // --- Save order items ---
    await OrderItem.insertMany(orderItemsData);

    // --- Print bill via backend ---
    try {
      await printBill({
        billNo,
        items,
        subTotal,
        discountAmount,
        grandTotal,
        paidAmount,
        balance,
      });
    } catch (printErr) {
      console.error("⚠️ Print failed:", printErr.message);
    }

    res
      .status(201)
      .json({ message: "Quick sell saved & printed", bill, items: orderItemsData });

  } catch (error) {
    console.error("❌ QuickSell error:", error.message);
    res.status(400).json({ message: error.message });
  }
};








export const getAllOrderDetails = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { customerId: { $ne: null } } },

      // Lookup customer
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },

      // Lookup order items
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "items"
        }
      },

      // Lookup bills
      {
        $lookup: {
          from: "bills",
          localField: "_id",
          foreignField: "orderId",
          as: "bills"
        }
      },

      // Project only needed fields
      {
        $project: {
          _id: 1,
          orderStatus: 1,
          paymentStatus: 1,
          fixingDate: 1,
          orderAmount: 1,
          balance: 1,
          createdAt: 1, // include createdAt to sort
          "customer._id": 1,
          "customer.name": 1,
          "customer.mobile1": 1,
          "customer.mobile2": 1,
          "customer.address": 1,
          items: 1,
          bills: 1
        }
      },

      // Sort newest first
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};



export const getOrderDetailsById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const orders = await Order.aggregate([
      // Match only this order
      { $match: { _id: new mongoose.Types.ObjectId(id), customerId: { $ne: null } } },

      // Lookup customer
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },

      // Lookup order items
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "items"
        }
      },

      // Lookup all bills
      {
        $lookup: {
          from: "bills",
          localField: "_id",
          foreignField: "orderId",
          as: "bills" // now all bills will be here
        }
      },

      // Project fields
      {
        $project: {
          _id: 1,
          orderStatus: 1,
          paymentStatus: 1,
          fixingDate: 1,
          orderAmount: 1,
          balance: 1,
          "customer._id": 1,
          "customer.name": 1,
          "customer.mobile1": 1,
          "customer.mobile2": 1,
          "customer.address": 1,
          items: 1,
          bills: 1 // include all bills as array
        }
      }
    ]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(orders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expects pending | in-progress | completed

    // Find the order
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Reduce stock ONLY when moving from "pending" → "in-progress"
    if (order.orderStatus === "pending" && status === "in-progress") {
      const orderItems = await OrderItem.find({ orderId: order._id });

      for (const item of orderItems) {
        const stockItem = await Stock.findOne({ itemName: item.itemName }); // ✅ correct field
        if (stockItem) {
          stockItem.quantity -= item.itemQuantity;
          if (stockItem.quantity < 0) stockItem.quantity = 0;
          await stockItem.save();
        }
      }
    }

    // Update status (correct field name)
    order.orderStatus = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status", error });
  }
};



export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // 1️⃣ Find the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 2️⃣ Find bills linked to this order
    const bills = await Bill.find({ orderId: order._id });
    if (bills.length === 0) return res.status(404).json({ message: "No bills linked to this order" });

    let totalPaidAmount = 0;

    // 3️⃣ Loop through each bill to restock and remove items
    for (const bill of bills) {
      const orderItems = await OrderItem.find({ billId: bill._id });

      // 3a️⃣ Restock items
      for (const item of orderItems) {
        if (item.stockId) {
          await Stock.findByIdAndUpdate(item.stockId, {
            $inc: { quantity: item.itemQuantity },
          });
        }
      }

      // 3b️⃣ Delete order items linked to this bill
      await OrderItem.deleteMany({ billId: bill._id });

      // 3c️⃣ Keep track of total paid amount
      totalPaidAmount += bill.paidAmount || 0;

      // 3d️⃣ Delete the bill
      await Bill.findByIdAndDelete(bill._id);
    }

    // 4️⃣ Delete the order itself
    await Order.findByIdAndDelete(order._id);

    // 5️⃣ Save the advance paid as daily expense
    if (totalPaidAmount > 0) {
      await Expense.create({
        name: order.customerId ? (await Customer.findById(order.customerId)).name : "Unknown Customer",
        amount: totalPaidAmount,
      });
    }

    return res.status(200).json({
      message: "Order canceled successfully, stock restored, and advance saved as expense",
    });

  } catch (error) {
    console.error("Error canceling order:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUpcomingOrders = async (req, res) => {
  try {
    // Get start of today in local time (Asia/Colombo for you)
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
    const today = new Date(todayStr + "T00:00:00"); // midnight today (local)

    // Fetch orders where fixingDate >= today
    const upcomingOrders = await Order.find({
      fixingDate: { $gte: today }
    }).populate("customerId");

    res.status(200).json(upcomingOrders);
  } catch (error) {
    console.error("Error fetching upcoming orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};










