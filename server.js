import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; 
import billRoutes from './routes/billRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from "./routes/supplierRoutes.js";
import supplierBillRoutes from "./routes/supplierBillRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import advanceRoutes from "./routes/advanceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dotenv from 'dotenv';

import "./cron.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supplier-bills", supplierBillRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/advances", advanceRoutes);
app.use("/api/report", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
