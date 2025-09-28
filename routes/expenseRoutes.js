import express from "express";
import { addExpense, getTodayExpenses, getMonthlyExpenses, deleteExpense } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", addExpense);               // Add expense
router.get("/today", getTodayExpenses);    // Get today's expenses
router.get("/month", getMonthlyExpenses);  // Get monthly expenses
router.delete("/:id", deleteExpense);   // ✅ new route
export default router;
