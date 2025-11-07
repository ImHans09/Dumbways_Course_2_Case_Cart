import { Router } from "express";
import { getStocks } from "../controllers/stock-controller.js";

// Create Router instance
const router = Router();

// Route to get stocks
router.get('/stocks', getStocks);

// Set default export for router variable
export default router;