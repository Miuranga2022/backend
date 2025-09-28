import express from 'express';
import { getOrders, createOrder,createOrderWithCustomer,quickSell, getAllOrderDetails, getOrderDetailsById, updateOrderStatus, cancelOrder, getUpcomingOrders } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.post('/full', createOrderWithCustomer);
router.post('/quick-sell', quickSell);
router.get('/details', getAllOrderDetails)
router.get('/details/:id', getOrderDetailsById)
router.put('/update-status/:id', updateOrderStatus)
router.delete("/:orderId/cancel", cancelOrder);
router.get("/upcoming", getUpcomingOrders);





export default router;
