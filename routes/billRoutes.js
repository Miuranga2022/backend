import express from 'express';
import { getBills, createBill,addPaymentToOrder, cancelBill } from '../controllers/billController.js';

const router = express.Router();

router.get('/', getBills);
router.post('/', createBill);
router.post('/payment', addPaymentToOrder);
router.delete("/cancel/:billId", cancelBill);


export default router;
