import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { getUsers, logUserIn, registerUser, truncateAllUsers, updateUser, updateUserProfileImage } from "../services/user-service.js";
import { UserRole } from "@prisma/client";
import { signToken } from "../utils/jwt.js";
import { UserPayload } from "../models/userpayload-model.js";

export const handleUsersSelected = async (req: Request, res: Response, next: NextFunction) => {
  const userFields = prisma.dmmf.datamodel.models.find(model => model.name === 'User')?.fields.map(field => field.name);
  const sortMethods = ['asc', 'desc'];
  const schema = Joi.object({
    role: Joi.string().valid(...Object.values(UserRole)).allow('').optional().error(new Error('Role is invalid')),
    sortBy: Joi.string().lowercase().valid(...userFields!).allow('').optional().error(new Error("User doesn't have this property")),
    sort: Joi.string().lowercase().valid(...sortMethods).allow('').optional().error(new Error('Sort method is invalid')),
    limit: Joi.number().integer().min(5).allow('').optional().error(new Error('Limit must be integer and minimum value is 5')),
    offset: Joi.number().integer().min(1).allow('').optional().error(new Error('Offset must be integer and minimum value is 1'))
  });
  const { error } = schema.validate(req.query);
  
  try {
    if (error) throw { status: 400, message: error.message };

    const { role, sortBy, sort, limit, offset } = req.query;
    const filters: any = {};
    
    if (role) filters.role = role as UserRole;

    const users = await getUsers(
      filters, 
      ((sortBy as string).length === 0) ? (userFields as string[])[0] as string : sortBy as string, 
      ((sort as string).length === 0) ? sortMethods[0] as string : sort as string, 
      ((limit as string).length === 0) ? 5 : Number(limit as string),
      ((offset as string).length === 0) ? 0 : Number(offset as string), 
      next
    );
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'User retrieved successfully',
      dataCount: (users) ? users.length : 0,
      data: { users: users }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserLogin = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email({ allowFullyQualified: true, minDomainSegments: 2, tlds: { allow: ['com'] } }).required().error(new Error('Email is invalid')),
    password: Joi.string().alphanum().min(8).required().error(new Error('Password must be greater than 8 characters')),
  });
  const { error } = schema.validate(req.body);

  try {
    if (error) throw { status: 400, message: error.message };

    const { email, password } = req.body;
    const user = await logUserIn(email, password, next);
    const token = signToken(user as UserPayload);
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'Login success!',
      token: token,
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserAdminRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(40).required().error(new Error('Name must be greater than 4 characters')),
    email: Joi.string().email({ allowFullyQualified: true, minDomainSegments: 2, tlds: { allow: ['com'] } }).required().error(new Error('Email is invalid')),
    password: Joi.string().alphanum().min(8).required().error(new Error('Password must be greater than 8 characters')),
    repeatPassword: Joi.valid(Joi.ref('password')).required().error(new Error('Password validation is incorrect'))
  });
  const { error } = schema.validate(req.body);

  try {
    if (error) throw { status: 400, message: error.message };

    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password, UserRole.ADMIN, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User registered successfully',
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserCustomerRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(40).required().error(new Error('Name must be greater than 4 characters')),
    email: Joi.string().email({ allowFullyQualified: true, minDomainSegments: 2, tlds: { allow: ['com'] } }).required().error(new Error('Email is invalid')),
    password: Joi.string().alphanum().min(8).required().error(new Error('Password must be greater than 8 characters')),
    repeatPassword: Joi.valid(Joi.ref('password')).required().error(new Error('Password validation is incorrect'))
  });
  const { error } = schema.validate(req.body);

  try {
    if (error) throw { status: 400, message: error.message };

    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password, UserRole.CUSTOMER, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User registered successfully',
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserSupplierRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(40).required().error(new Error('Name must be greater than 4 characters')),
    email: Joi.string().email({ allowFullyQualified: true, minDomainSegments: 2, tlds: { allow: ['com'] } }).required().error(new Error('Email is invalid')),
    password: Joi.string().alphanum().min(8).required().error(new Error('Password must be greater than 8 characters')),
    repeatPassword: Joi.valid(Joi.ref('password')).required().error(new Error('Password validation is incorrect'))
  });
  const { error } = schema.validate(req.body);

  try {
    if (error) throw { status: 400, message: error.message };

    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password, UserRole.SUPPLIER, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User registered successfully',
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const loggedInUserId: number = (req as any).user.id;
  const schema = Joi.object({
    id: Joi.number().integer().required().error(new Error('User ID is invalid')),
    name: Joi.string().min(4).max(40).required().error(new Error('Name must be greater than 4 characters')),
    email: Joi.string().email({ allowFullyQualified: true, minDomainSegments: 2, tlds: { allow: ['com'] } }).required().error(new Error('Email is invalid'))
  });
  const { error } = schema.validate({
    id: Number(req.params.id),
    name: req.body.name,
    email: req.body.email
  });

  try {
    if (error) throw { status: 400, message: error.message };

    const { name, email } = req.body;
    const user = await updateUser(loggedInUserId, Number(req.params.id), name, email, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User updated successfully',
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleUserUpdateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  const loggedInUserId: number = (req as any).user.id;
  const imageFile = req.file;

  try {
    if (!imageFile) throw { status: 404, message: 'Profile image is not uploaded' };

    const user = await updateUserProfileImage(loggedInUserId, Number(req.params.id), imageFile.filename, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User profile image updated successfully',
      dataCount: [user].length,
      data: { user: user }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleAllUsersTruncation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedUsersCount = await truncateAllUsers(next);
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'All user data deleted successfully',
      dataCount: deletedUsersCount
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};