import express from "express";
import { addEmployee, deleteEmployee, getEmployeeById, getEmployees, updateEmployee } from "../controllers/employeeController.js";

const router = express.Router();

// Add new employee
router.post("/", addEmployee);

// Get all employees
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id",deleteEmployee)

export default router;