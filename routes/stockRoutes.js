import express from "express";
import { getStock, refillStock, getStockBySupplier, deleteStock } from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getStock);
router.post("/refill", refillStock);
router.get("/supplier-items", getStockBySupplier); // ✅ new route for frontend Add Bill modal
router.delete("/:id", deleteStock); // ✅ Delete route

export default router;
