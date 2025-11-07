import { Router } from "express";
import { getSuppliers, updateStockAndQuantity } from "../controllers/supplier-controller.js";

// Create Router instance
const router = Router();

// Route to get suppliers data
router.get('/suppliers', getSuppliers);

// Route to update stock and quantity from product stock and supplier
router.put('/suppliers/stock', updateStockAndQuantity);

// Set default export for router variable
export default router;