import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Advance from "../models/Advance.js";
// Calculate daily salary
const calculateDailySalary = (inTime, outTime, dailyRate, otHours, otRate) => {
  if (!inTime || !outTime || inTime === "0" || outTime === "0") return 0;

  const [inH, inM] = inTime.split(":").map(Number);
  const [outH, outM] = outTime.split(":").map(Number);

  let hoursWorked = (outH + outM / 60) - (inH + inM / 60);
  if (hoursWorked < 0) hoursWorked = 0; // avoid negative hours

  let baseSalary = 0;
  if (hoursWorked > 7) baseSalary = dailyRate;
  else if (hoursWorked >= 4) baseSalary = dailyRate / 2;

  return baseSalary + (otHours * otRate);
};

// Bulk add attendance (once per day)
export const addBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records) {
      return res.status(400).json({ message: "Date and records are required" });
    }

    const allEmployees = await Employee.find();
    const attendanceDocs = [];

    for (let emp of allEmployees) {
      // Check if attendance already exists for this employee and date
      const exists = await Attendance.findOne({ employeeId: emp._id, date });
      if (exists) continue; // Skip if already exists

      const found = records.find(r => r.employeeId === String(emp._id));

      let inTime = found?.inTime || null;
      let outTime = found?.outTime || null;
      let otHours = found?.otHours || 0;

      const isAbsent = !inTime || !outTime;
      if (isAbsent) {
        inTime = "0";
        outTime = "0";
        otHours = 0;
      }

      const dailySalary = isAbsent ? 0 : calculateDailySalary(
        inTime,
        outTime,
        emp.dailyRate,
        otHours,
        emp.otRate
      );

      attendanceDocs.push({
        employeeId: emp._id,
        date,
        inTime,
        outTime,
        otHours,
        dailySalary,
        status: isAbsent ? "Absent" : "Present"
      });

      // Update employee total salary
      emp.totalSalary += dailySalary;
      await emp.save();
    }

    if (attendanceDocs.length === 0) {
      return res.status(400).json({ message: "Attendance already recorded for today" });
    }

    await Attendance.insertMany(attendanceDocs);

    res.status(201).json({
      message: "Attendance saved for all employees",
      records: attendanceDocs
    });

  } catch (error) {
    console.error("Error saving bulk attendance:", error);
    res.status(500).json({ message: "Error saving attendance" });
  }
};

// Get attendance for an employee
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.find({ employeeId });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching attendance" });
  }
};

export const getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;
    if (!year || !month)
      return res.status(400).json({ message: "Year and month required" });

    const employees = await Employee.find();
    const monthStr = month.toString().padStart(2, "0");

    // Fetch all attendance for that month
    const attendances = await Attendance.find({
      date: { $regex: `^${year}-${monthStr}-` }
    }).sort({ date: 1 }); // sort ascending by date

    // Fetch all advances for that month
    const advances = await Advance.find({
      date: { $regex: `^${year}-${monthStr}-` }
    }).sort({ date: 1 });

    // Map attendance + advances per employee
    const empData = employees.map(emp => {
      let balance = 0;

      // Get employee's records
      const empAttendances = attendances.filter(
        a => a.employeeId.toString() === emp._id.toString()
      );
      const empAdvances = advances.filter(
        adv => adv.employeeId.toString() === emp._id.toString()
      );

      // Merge both attendances and advances into a single timeline
      const mergedRecords = [
        ...empAttendances.map(a => ({
          type: "attendance",
          date: a.date,
          amount: a.dailySalary
        })),
        ...empAdvances.map(adv => ({
          type: "advance",
          date: adv.date,
          amount: -adv.amount // deduct
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      // Process balance day by day
      const dailyRecords = mergedRecords.map(r => {
        const record = {
          date: r.date,
          type: r.type,
          amount: r.amount,
          balanceBefore: balance
        };

        balance += r.amount; // apply salary or advance
        return record;
      });

      return {
        employeeId: emp._id,
        name: emp.name,
        dailyRecords,
        finalBalance: balance
      };
    });

    res.json(empData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching monthly attendance" });
  }
};
