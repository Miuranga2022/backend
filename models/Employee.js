import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  mobile: { type: String },
  dailyRate: { type: Number, required: true },   // salary per full day
  otRate: { type: Number, default: 0 },          // per hour OT pay
  totalSalary: { type: Number, default: 0 },     // cumulative salary
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
