import DailyReport from "../models/DailyReport.js";
import Attendance from "../models/Attendance.js";
import Advance from "../models/Advance.js";
import Bill from "../models/Bill.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import SupplierBill from "../models/SupplierBill.js";
import PaidBill from "../models/PaidBill.js";
import Expense from "../models/Expense.js";
import Stock from "../models/Stock.js";

// Get today's date in Sri Lanka in YYYY-MM-DD format
// ✅ Get start and end of day in Sri Lanka for a given date
function getSriLankaDayRange(dateStr) {
  const slTime = new Date(
    new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Colombo" })
  );
  const start = new Date(slTime);
  start.setHours(0, 0, 0, 0);
  const end = new Date(slTime);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const getDailyReport = async (req, res) => {
  try {
    const now = new Date();
    const slTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
    );
    const todayStr = slTime.toISOString().split("T")[0];
    const { start, end } = getSriLankaDayRange(todayStr);

    // Fetch attendance and advances
    const attendance = await Attendance.find({ createdAt: { $gte: start, $lte: end } }).populate("employeeId");
    const advances = await Advance.find({ createdAt: { $gte: start, $lte: end } }).populate("employeeId");

    // Fetch orders
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).populate("customerId");

    // Fetch bills
    const bills = await Bill.find({ createdAt: { $gte: start, $lte: end } }).populate({
      path: "orderId",
      populate: { path: "customerId", select: "name address mobile1 mobile2" }
    });

    // Fetch order items linked to bills
    const orderItems = await OrderItem.find({ createdAt: { $gte: start, $lte: end } })
      .populate({
        path: "orderId",
        populate: { path: "customerId", select: "name address mobile1 mobile2" }
      })
      .populate("billId");

    // Map bills with their order items and include billNo
    const billsWithItems = bills.map((bill) => {
      const items = orderItems.filter(
        (item) => item.billId?.toString() === bill._id.toString()
      );
      return {
        _id: bill._id,
        billNo: bill.billNo,           // ✅ include billNo here
        billTotal: bill.billTotal,
        discount: bill.discount,
        paidAmount: bill.paidAmount,
        paymentType: bill.paymentType,
        createdAt: bill.createdAt,
        items,
        order: bill.orderId ? {
          _id: bill.orderId._id,
          orderAmount: bill.orderId.orderAmount,
          balance: bill.orderId.balance,
          customer: bill.orderId.customerId,
        } : null
      };
    });

    // Format times for frontend
    const formatToSLTime = (date) => new Date(date).toLocaleString("en-US", { timeZone: "Asia/Colombo" });

    const attendanceFormatted = attendance.map((a) => ({ ...a.toObject(), createdAt: formatToSLTime(a.createdAt) }));
    const advancesFormatted = advances.map((a) => ({ ...a.toObject(), createdAt: formatToSLTime(a.createdAt) }));

    // Fetch other data
    const supplierBills = await SupplierBill.find({ createdAt: { $gte: start, $lte: end } }).populate("supplier");
    const paidBills = await PaidBill.find({ createdAt: { $gte: start, $lte: end } }).populate({
      path: "supplierBill",
      populate: { path: "supplier" },
    });
    const expenses = await Expense.find({ createdAt: { $gte: start, $lte: end } });
    const stocks = await Stock.find({ updatedAt: { $gte: start, $lte: end } });

    res.json({
      date: todayStr,
      attendance: attendanceFormatted,
      advances: advancesFormatted,
      bills: billsWithItems,     // ✅ bills with billNo
      orders,
      orderItems,
      supplierBills,
      paidBills,
      expenses,
      stocks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};


// Save or update daily report
export const saveDailyReport = async (req, res) => {
  try {
    const { date, ...rest } = req.body;

    const report = await DailyReport.findOneAndUpdate(
      { date: new Date(date) },
      { date: new Date(date), ...rest },
      { new: true, upsert: true }
    );

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error saving daily report", error });
  }
};

// Get report by date
// Get report by date
export const getDailyReportByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { start, end } = getSriLankaDayRange(date);

    // Fetch all data dynamically
    const attendance = await Attendance.find({ date }).populate("employeeId");
    const advances = await Advance.find({ date }).populate("employeeId");
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).populate("customerId");
    const orderItems = await OrderItem.find({ createdAt: { $gte: start, $lte: end } });
    const bills = await Bill.find({ createdAt: { $gte: start, $lte: end } }).populate({
      path: "orderId",
      populate: { path: "customerId", select: "name" } // ✅ populate customer name
    });
    const supplierBills = await SupplierBill.find({ createdAt: { $gte: start, $lte: end } }).populate("supplier");
    const paidBills = await PaidBill.find({ createdAt: { $gte: start, $lte: end } })
      .populate({
        path: "supplierBill",
        populate: { path: "supplier" }
      });
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    res.status(200).json({
      date,
      attendance,
      advances,
      orders,
      orderItems,
      bills,          // ✅ include bills here
      supplierBills,
      paidBills,
      expenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching daily report by date", error });
  }
};


// Get all reports (optional)
export const getAllDailyReports = async (req, res) => {
  try {
    const reports = await DailyReport.find({})
      .populate("attendance.employeeId")
      .populate("advances.employeeId")
      .populate("orders.customerId")
      .populate("supplierBills.supplier")
      .populate("paidBills.supplierBill");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all reports", error });
  }
};




