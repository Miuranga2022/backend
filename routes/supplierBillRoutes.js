import express from "express";
import { createSupplierBill, getSupplierBills } from "../controllers/supplierBillController.js";

const router = express.Router();

router.post("/", createSupplierBill);  // Create bill + update stock
router.get("/", getSupplierBills);     // Get supplier bills with payments

export default router;
