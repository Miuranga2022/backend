import Inventory from "../models/Inventory.js";

// Get all inventory items
export const getInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new inventory item
export const addInventoryItem = async (req, res) => {
  try {
    const { name, type, costPrice, sellPrice, quantity } = req.body;

    if (!name || !type || costPrice == null || sellPrice == null || quantity == null) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newItem = new Inventory({
      name,
      type,
      costPrice,
      sellPrice,
      quantity
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
