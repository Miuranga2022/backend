// routes/reportRoutes.js
import express from "express";
import { getDailyReport, getDailyReportByDate, saveDailyReport } from "../controllers/dailyReportController.js";

const router = express.Router();

// GET today’s data
router.get("/daily", getDailyReport);
router.post("/save", saveDailyReport);
router.get("/:date", getDailyReportByDate);



export default router;
