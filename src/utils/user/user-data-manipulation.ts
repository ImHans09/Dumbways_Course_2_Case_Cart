import bcrypt from 'bcrypt';
import { prismaClient } from "../../prisma/client.js";
import { UserRole } from '@prisma/client';
import { validateUserPasswordLogin } from './user-validation.js';

export const userListSelection = async (sortBy: string, sort: string, limit: string, offset: string, filters: any, next: any) => {
  try {
    const sortByStr = (sortBy.length === 0) ? 'id' : sortBy;
    const users = await prismaClient.user.findMany({
      where: filters,
      orderBy: {
        [sortByStr]: (sort.length === 0) ? 'asc' : sort
      },
      take: (limit.length === 0) ? 5 : Number(limit),
      skip: (offset.length === 0) ? 0 : Number(offset)
    });
    const response = {
      data: users,
      status: 200
    };

    return Promise.resolve(response);
  } catch (error) {
    next(error);
  }
};

export const userCreation = async (name: string, email: string, password: string, role: UserRole, next: any) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role
      }
    });
    const response = {
      data: user,
      status: 201
    };

    return Promise.resolve(response);
  } catch (error) {
    next(error);
  }
};

export const userUpdate = async (id: number, name: string, email: string, role: UserRole, next: any) => {
  try {
    const user = await prismaClient.user.findUnique({
      select: { id: true },
      where: { 
        id: id,
        role: role
      }
    });

    if (!user) throw { status: 404, message: `User with ID: ${id} is not found` };

    const updatedUser = await prismaClient.user.update({
      where: { id: user.id },
      data: {
        name: name,
        email: email
      }
    });
    const response = {
      data: updatedUser,
      status: 200
    };

    return Promise.resolve(response);
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (email: string, password: string, next: any) => {
  try {
    const user = await prismaClient.user.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      },
      where: { email: email }
    });

    if (!user) throw { status: 404, message: 'User with this email is not found' };

    const passwordValidation = await validateUserPasswordLogin(password, user?.password);

    if (Object.keys(passwordValidation).length !== 0) throw passwordValidation;

    const response = {
      data: user,
      status: 200
    };

    return Promise.resolve(response);
  } catch (error) {
    next(error);
  }
};

export const existingUserEmail = async (email: string) => {
  const existingUserEmail = await prismaClient.user.findUnique({
    select: { email: true },
    where: { email: email }
  });

  return existingUserEmail;
};