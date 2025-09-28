import Customer from '../models/Customer.js';

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, address, mobile1, mobile2 } = req.body;
    const newCustomer = new Customer({ name, address, mobile1, mobile2 });
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
