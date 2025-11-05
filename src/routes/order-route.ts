import { Router } from "express";
import { getOrders, countOrdersWithGrouping, createOrder, updateOrder, deleteOrder } from "../controllers/order-controller.js";

// Create Router instance
const router = Router();

// Route to get orders
router.get('/orders', getOrders);

// Route to get summary
router.get('/orders/summary', countOrdersWithGrouping);

// Route to create order
router.post('/orders', createOrder);

// Route to update order
router.put('/orders/:id', updateOrder);

// Route to delete order
router.delete('/orders/:id', deleteOrder);

// Set default export for router variable
export default router;