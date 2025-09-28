import express from "express";
import { createSupplier, getSuppliers, getSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);

export default router;
