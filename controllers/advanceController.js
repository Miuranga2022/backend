// controllers/advanceController.js
import Advance from "../models/Advance.js";
import Employee from "../models/Employee.js";
import Expense from "../models/Expense.js";
import moment from "moment-timezone";

// Add advance
// Add advance
export const addAdvance = async (req, res) => {
  try {
    const { employeeId, date, amount } = req.body;

    if (!employeeId || !date || !amount) {
      return res.status(400).json({ message: "Employee, date and amount required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Save advance
    const newAdvance = new Advance({ employeeId, date, amount });
    const saved = await newAdvance.save();

    // Save expense with local Sri Lanka time
    const expense = new Expense({
      name: employee.name,
      amount,
      date: moment().tz("Asia/Colombo").toDate() // ✅ current time in SL
    });
    await expense.save();

    res.status(201).json({ advance: saved, expense });
  } catch (err) {
    console.error("Error adding advance:", err);
    res.status(500).json({ message: "Error adding advance" });
  }
};

// Get advances by employee
export const getAdvancesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const advances = await Advance.find({ employeeId });
    res.json(advances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching advances" });
  }
};
