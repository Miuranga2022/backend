import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true },       // store as "YYYY-MM-DD"
  inTime: { type: String, required: true },     // store as "HH:mm"
  outTime: { type: String, required: true },    // store as "HH:mm"
  otHours: { type: Number, default: 0 },
  dailySalary: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
