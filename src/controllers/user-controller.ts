import { Request, Response } from "express";
import { validateGetUsersQuery, validateUserCreation, validateUserLogin, validateUserUpdate } from '../utils/user/user-validation.js';
import { userListSelection, userCreation, userLogin, existingUserEmail, userUpdate } from '../utils/user/user-data-manipulation.js';
import { response } from '../utils/response.js';
import { UserRole } from '@prisma/client';
import { signToken } from "../utils/jwt.js";
import { UserPayload } from "../models/userpayload-model.js";

// Get users data from database
export const getUsers = async (req: Request, res: Response, next: any) => {
  const { role, sortBy, sort, limit, offset } = req.query;
  const lowercaseSortBy = (sortBy as string).toLowerCase();
  const lowercaseSort = (sort as string).toLowerCase();
  const getUsersQueryValidation = validateGetUsersQuery(role as UserRole, lowercaseSortBy, lowercaseSort, limit as string, offset as string);
  const filters: any = {};

  try {
    if (Object.keys(getUsersQueryValidation).length !== 0) throw getUsersQueryValidation;
    if (role) filters.role = role;

    const users = await userListSelection(lowercaseSortBy, lowercaseSort, limit as string, offset as string, filters, next);

    res.status(users?.status as number).json(response(true, users?.status as number, 'Users retrieved successfully', (users?.data as []).length, { users: users?.data }));
  } catch (error) {
    next(error);
  }
};

// Create new admin and insert to database
export const createUserAdmin = async (req: Request, res: Response, next: any) => {
  const { name, email, password, passwordValidation } = req.body;
  const userInputValidation = validateUserCreation(name, email, password, passwordValidation);
  const userEmail = await existingUserEmail(email);

  try {
    if (Object.keys(userInputValidation).length !== 0) throw userInputValidation;
    if (userEmail) throw { status: 400, message: 'User with this email has been registered' };

    const user = await userCreation(name, email, password, UserRole.ADMIN, next);

    res.status(user?.status as number).json(response(true, user?.status as number, 'User created successfully', [user?.data].length, { user: user?.data }));
  } catch (error) {
    next(error);
  }
};

// Create new customer and insert to database
export const createUserCustomer = async (req: Request, res: Response, next: any) => {
  const { name, email, password, passwordValidation } = req.body;
  const userInputValidation = validateUserCreation(name, email, password, passwordValidation);
  const userEmail = await existingUserEmail(email);

  try {
    if (Object.keys(userInputValidation).length !== 0) throw userInputValidation;
    if (userEmail) throw { status: 400, message: 'User with this email has been registered' };

    const user = await userCreation(name, email, password, UserRole.CUSTOMER, next);

    res.status(user?.status as number).json(response(true, user?.status as number, 'User created successfully', [user?.data].length, { user: user?.data }));
  } catch (error) {
    next(error);
  }
};

// Create new supplier and insert to database
export const createUserSupplier = async (req: Request, res: Response, next: any) => {
  const { name, email, password, passwordValidation } = req.body;
  const userInputValidation = validateUserCreation(name, email, password, passwordValidation);
  const userEmail = await existingUserEmail(email);

  try {
    if (Object.keys(userInputValidation).length !== 0) throw userInputValidation;
    if (userEmail) throw { status: 400, message: 'User with this email has been registered' };

    const user = await userCreation(name, email, password, UserRole.SUPPLIER, next);

    res.status(user?.status as number).json(response(true, user?.status as number, 'User created successfully', [user?.data].length, { user: user?.data }));
  } catch (error) {
    next(error);
  }
};

// Update user from database
export const updateUser = async (req: Request, res: Response, next: any) => {
  const userId = Number(req.params.id);
  const role = (req as any).user.role;
  const { name, email } = req.body;
  const userInputValidation = validateUserUpdate(userId, name, email);

  try {
    if (Object.keys(userInputValidation).length !== 0) throw userInputValidation;

    const user = await userUpdate(userId, name, email, role as UserRole, next);

    res.status(user?.status as number).json(response(true, user?.status as number, 'User updated successfully', [user?.data].length, { user: user?.data }));
  } catch (error) {
    next(error);
  }
};

// Login user
export const loginUser = async (req: Request, res: Response, next: any) => {
  const { email, password } = req.body;
  const userInputValidation = validateUserLogin(email, password);
  const userEmail = await existingUserEmail(email);
  
  try {
    if (Object.keys(userInputValidation).length !== 0) throw userInputValidation;
    if (!userEmail) throw { status: 404, message: 'User with this email is not found' };
    
    const user = await userLogin(email, password, next);
    const userPayload = {
      id: user?.data.id,
      role: user?.data.role
    };
    const token = signToken(userPayload as UserPayload);
    const response = {
      success: true,
      status: user?.status as number,
      message: 'Log in success!',
      token: token,
      dataCount: [userPayload].length,
      data: { user: userPayload }
    };

    res.status(user?.status as number).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete user from database
// export const deleteUser = async (req: Request, res: Response, next: any) => {
//   const userId = Number(req.params.id);
  
//   try {
//     if (Number.isNaN(userId)) throw { status: 400, message: 'User ID must be numeric' };

//     const existingUser = await prismaClient.user.findUnique({
//       where: { id: userId }
//     });

//     if (existingUser === null) throw { status: 404, message: `User with ID: ${userId} is not found` };

//     const deletedOrdersAndUser = await prismaClient.$transaction([
//       prismaClient.order.deleteMany({
//         where: { userId: userId}
//       }),
//       prismaClient.user.delete({
//         where: { id: userId }
//       })
//     ]);
//     const userArray = [deletedOrdersAndUser[1]];
//     const status = 200;
//     const response = {
//       success: true,
//       status: status,
//       message: 'User deleted successfully',
//       dataCount: userArray.length,
//       data: { users: userArray }
//     };

//     res.status(status).json(response);
//   } catch (error) {
//     next(error);
//   }
// };