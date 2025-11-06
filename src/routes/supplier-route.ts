import { Router } from "express";
import { updateStockAndQuantity } from "../controllers/supplier-controller.js";

// Create Router instance
const router = Router();

// Route to update stock and quantity from product stock and supplier
router.put('/suppliers/stock', updateStockAndQuantity);

// Set default export for router variable
export default router;