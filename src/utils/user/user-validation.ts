import bcrypt from 'bcrypt';
import validator from 'validator';
import { prisma } from "../../prisma/client.js";
import { UserRole } from '@prisma/client';

export const validateGetUsersQuery = (role: UserRole, sortBy: string, sort: string, limit: string, offset: string) => {
  const userFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'User')?.fields.map((field) => field.name);
  const roles = Object.values(UserRole);
  const sortMethods = ['asc', 'desc'];
  let error = {};

  if (!roles.includes(role) && role.trim().length !== 0) {
    error = { status: 400, message: `Role is invalid` };
  }

  if (!userFields?.includes(sortBy as string) && (sortBy as string).trim().length !== 0) {
    error = { status: 400, message: `User doesn't have ${sortBy} property` };
  }

  if (!sortMethods.includes(sort as string) && (sort as string).trim().length !== 0) {
    error = { status: 400, message: 'Sort method is invalid' };
  }

  if (Number.isNaN(Number(limit as string)) && (limit as string).trim().length !== 0) {
    error = { status: 400, message: 'Limit value must be numeric' };
  }

  if (Number.isNaN(Number(offset as string)) && (offset as string).trim().length !== 0) {
    error = { status: 400, message: 'Offset value must be numeric' };
  }

  return error;
};

export const validateUserCreation = (name: string, email: string, password: string, passwordValidation: string) => {
  let error = {};

  if (name.trim().length === 0) error = { status: 400, message: 'Name is empty' };

  if (email.trim().length === 0) error = { status: 400, message: 'Email is empty' };

  if (!validator.isEmail(email)) error = { status: 400, message: 'Input a valid email' };

  if (password.trim().length < 8) error = { status: 400, message: 'Password must be greater than equals 8 characters' };

  if (passwordValidation !== password) error = { status: 400, message: 'Input correct password validation' };

  return error;
};

export const validateUserUpdate = (id: number, name: string, email: string) => {
  let error = {};

  if (Number.isNaN(id)) error = { status: 400, message: 'User ID must be numeric' };

  if (name.trim().length === 0) error = { status: 400, message: 'Name is empty' };

  if (email.trim().length === 0) error = { status: 400, message: 'Email is empty' };

  if (!validator.isEmail(email)) error = { status: 400, message: 'Input a valid email' };

  return error;
};

export const validateUserLogin = (email: string, password: string) => {
  let error = {};

  if (email.trim().length === 0) error = { status: 400, message: 'Email is empty' };

  if (!validator.isEmail(email)) error = { status: 400, message: 'Input a valid email' };

  if (password.trim().length < 8) error = { status: 400, message: 'Password must be greater than equals 8 characters' };

  return error;
};

export const validateUserPasswordLogin = async (password: string, hashedPassword: string) => {
  let error = {};
  const passwordMatched = await bcrypt.compare(password, hashedPassword);

  if (!passwordMatched) error = { status: 400, message: 'Password is incorrect' };

  return error;
};