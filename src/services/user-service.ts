import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { NextFunction } from "express";
import { prismaClient } from "../prisma/client.js";

export const getUsers = async (filters: any, sortBy: string, sort: string, limit: number, offset: number, next: NextFunction) => {
  try {
    const users = await prismaClient.user.findMany({
      where: filters,
      orderBy: {
        [sortBy]: sort
      },
      take: limit,
      skip: offset
    });

    return Promise.resolve(users);
  } catch (error) {
    next(error);
  }
};

export const logUserIn = async (email: string, password: string, next: NextFunction) => {
  try {
    const registeredUser = await prismaClient.user.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      },
      where: { email: email }
    });

    if(registeredUser === null) throw { status: 400, message: 'This account is not found' };
    
    const passwordValidation = await bcrypt.compare(password, registeredUser.password)

    if (!passwordValidation) throw { status: 400, message: 'Password is incorrect' };

    const responseUserData = {
      id: registeredUser.id,
      role: registeredUser.role
    }
    
    return Promise.resolve(responseUserData);
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (name: string, email: string, password: string, role: UserRole, next: NextFunction) => {
  try {
    const registeredUserEmail = await prismaClient.user.findUnique({
      select: { email: true },
      where: { email: email }
    });

    if(registeredUserEmail !== null) throw { status: 400, message: 'This email has been already registered' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role
      }
    });
    const responseUserData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      imageName: newUser.imageName,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }

    return Promise.resolve(responseUserData);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (loggedInId: number, id: number, name: string, email: string, next: NextFunction) => {
  try {
    const [loggedInUser, registeredUserById, registeredUserByEmail] = await Promise.all([
      prismaClient.user.findUnique({
        select: { id: true },
        where: { id: loggedInId }
      }),
      prismaClient.user.findUnique({
        select: { id: true },
        where: { id: id }
      }),
      prismaClient.user.findUnique({
        select: { id: true },
        where: { email: email }
      })
    ]);
    
    if (registeredUserById === null) throw { status: 404, message: 'This account is not found' };

    if (loggedInUser?.id !== registeredUserById.id) throw { status: 404, message: `Can't update user with ID: ${registeredUserById?.id}` };

    if (registeredUserByEmail !== null && registeredUserById.id !== registeredUserByEmail.id) throw { status: 400, message: 'This email has been already registered with another user' };

    const updateDate = new Date(Date.now());
    const updatedUser = await prismaClient.user.update({
      where: { id: id },
      data: {
        name: name,
        email: email,
        updatedAt: updateDate
      }
    });
    const responseUserData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      imageName: updatedUser.imageName,
      updatedAt: updatedUser.updatedAt
    }
    
    return Promise.resolve(responseUserData);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileImage = async (loggedInId: number, id: number, imageName: string, next: NextFunction) => {
  try {
    const [loggedInUser, registeredUserById] = await Promise.all([
      prismaClient.user.findUnique({
        select: { id: true },
        where: { id: loggedInId }
      }),
      prismaClient.user.findUnique({
        select: { id: true },
        where: { id: id }
      })
    ]);

    if (registeredUserById === null) throw { status: 404, message: 'This account is not found' };

    if (loggedInUser?.id !== registeredUserById.id) throw { status: 404, message: `Can't update user profile image with ID: ${registeredUserById?.id}` };

    const updatedDate = new Date(Date.now());
    const updatedUserProfileImage = await prismaClient.user.update({
      where: { id: id },
      data: {
        imageName: imageName,
        updatedAt: updatedDate
      }
    });
    const responseUserData = {
      id: updatedUserProfileImage.id,
      email: updatedUserProfileImage.email,
      imageName: updatedUserProfileImage.imageName,
      updatedAt: updatedUserProfileImage.updatedAt
    }

    return Promise.resolve(responseUserData);
  } catch (error) {
    next(error);
  }
};

export const truncateAllUsers = async (next: NextFunction) => {
  try {
    const allUsers = await prismaClient.user.findMany({
      select: { id: true }
    });

    if (allUsers === null) throw { status: 404, message: 'Users data are empty' };

    const deleteAllUsers = await prismaClient.user.deleteMany({});

    return Promise.resolve(deleteAllUsers.count);
  } catch (error) {
    next(error);
  }
};