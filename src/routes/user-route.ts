import { Router } from "express";
import { handleUserAdminRegistration, handleUserCustomerRegistration, handleUsersSelected, handleUserSupplierRegistration, handleUserUpdate, handleUserUpdateProfileImage, handleUserLogin, handleAllUsersTruncation } from "../controllers/user-controller.js";
import { authenticate } from "../middlerwares/user-authentication.js";
import { authorizeAdmin } from "../middlerwares/user-admin-authorization.js";
import { upload } from "../utils/multer.js";

const router = Router();

router.get('/users', authenticate, authorizeAdmin, handleUsersSelected);

router.post('/login', handleUserLogin);

router.post('/admin/register', handleUserAdminRegistration);

router.post('/register', handleUserCustomerRegistration);

router.post('/supplier/register', handleUserSupplierRegistration);

router.put('/user/update/:id', authenticate, handleUserUpdate);

router.put('/user/update/profile-image/:id', authenticate, upload.single('profileImage'), handleUserUpdateProfileImage);

router.delete('/users/delete-all', handleAllUsersTruncation);

export default router;