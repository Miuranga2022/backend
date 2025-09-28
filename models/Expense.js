import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },   // e.g., "Electricity Bill", "Transport"
  amount: { type: Number, required: true },        // how much spent
  date: { type: Date, default: Date.now }          // auto saves today's date
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
