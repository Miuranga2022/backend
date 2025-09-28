// models/Advance.js
import mongoose from "mongoose";

const advanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  amount: { type: Number, required: true }, // advance amount
}, { timestamps: true });

export default mongoose.model("Advance", advanceSchema);
