import { Router } from "express";
import { authenticate } from "../middlerwares/user-authentication.js";
import { authorizeSupplier } from "../middlerwares/user-supplier-authorization.js";
import { upload } from "../utils/multer.js";
import { handleAllProductsSelected, handleProductCreation, handleProductImageUpdate } from "../controllers/product-controller.js";

const router = Router();

router.get('/products', authenticate, authorizeSupplier, handleAllProductsSelected);

router.post('/products/add', authenticate, authorizeSupplier, handleProductCreation);

router.put('/products/upload-image/:id', authenticate, authorizeSupplier, upload.single('productImage'), handleProductImageUpdate);

export default router;