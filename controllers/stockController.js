import Stock from "../models/Stock.js";

// Get all stock items (optionally filter by type)
export const getStock = async (req, res) => {
  try {
    const { itemType } = req.query;
    const filter = itemType ? { itemType } : {};
    const stock = await Stock.find(filter);
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refill stock
export const refillStock = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) {
      return res.status(400).json({ message: "Item ID and quantity are required" });
    }

    const stockItem = await Stock.findById(itemId);
    if (!stockItem) return res.status(404).json({ message: "Item not found" });

    stockItem.quantity += Number(quantity);
    await stockItem.save();

    res.status(200).json({ message: "Stock refilled successfully", updatedItem: stockItem });
  } catch (error) {
    res.status(500).json({ message: "Error refilling stock", error: error.message });
  }
};

// ✅ Get stock by supplier (for Add Bill modal)
export const getStockBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.query;
    if (!supplierId) return res.status(400).json({ message: "supplierId is required" });

    const stock = await Stock.find({ supplierBill: { $in: await SupplierBill.find({ supplier: supplierId }).distinct("_id") } });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stockItem = await Stock.findByIdAndDelete(id);

    if (!stockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.status(200).json({ message: "Stock item deleted successfully", deletedItem: stockItem });
  } catch (err) {
    res.status(500).json({ message: "Error deleting stock", error: err.message });
  }
};
