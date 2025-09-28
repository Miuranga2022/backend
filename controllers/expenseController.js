import Expense from "../models/Expense.js";

// ➤ Add new expense
export const addExpense = async (req, res) => {
  try {
    const { name, amount, description } = req.body;

    const expense = new Expense({
      name,
      amount,
      description,
      date: new Date() // always today
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ Get expenses for today
export const getTodayExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const expenses = await Expense.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ success: true, total, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ Get expenses for any month
export const getMonthlyExpenses = async (req, res) => {
  try {
    const { month, year } = req.query; // e.g., ?month=8&year=2025

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({ date: { $gte: start, $lt: end } });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ success: true, total, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ Delete expense by ID
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
