// routes/advanceRoutes.js
import express from "express";
import { addAdvance, getAdvancesByEmployee } from "../controllers/advanceController.js";

const router = express.Router();

router.post("/", addAdvance);
router.get("/:employeeId", getAdvancesByEmployee);

export default router;
