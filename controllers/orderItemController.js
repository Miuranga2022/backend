import OrderItem from '../models/OrderItem.js';

// Get all order items
export const getOrderItems = async (req, res) => {
  try {
    // Populate orderId and optionally select fields you want
    const items = await OrderItem.find().populate('orderId');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new order item (now including costPrice)
export const createOrderItem = async (req, res) => {
  try {
    const { orderId, itemName, itemQuantity, itemRate, costPrice, total } = req.body;
    const newItem = new OrderItem({ orderId, itemName, itemQuantity, itemRate, costPrice, total });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
