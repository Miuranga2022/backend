import express from "express";
import { getPaidBillsBySupplierBill, paySupplierBill } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", paySupplierBill);
router.get("/:supplierBillID/payments",getPaidBillsBySupplierBill)

export default router;
