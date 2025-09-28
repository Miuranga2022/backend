import express from "express";
import {  getAttendanceByEmployee, addBulkAttendance, getMonthlyAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

// Single attendance (optional, can keep)


// Bulk attendance (all employees at once)
router.post("/bulk", addBulkAttendance);

// Get attendance by employee
router.get("/:employeeId", getAttendanceByEmployee);

router.get("/month/:year/:month", getMonthlyAttendance);

export default router;