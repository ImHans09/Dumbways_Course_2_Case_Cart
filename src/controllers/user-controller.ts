import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Get users data from database
export const getUsers = async (req: Request, res: Response, next: any) => {
  const { minPoint, maxPoint, sortBy, sort, limit, offset } = req.query;
  const userFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'User')?.fields.map((field) => field.name);
  const sortMethods = ['asc', 'desc'];
  const filters: any = {}

  try {
    if ((Number.isNaN(Number(minPoint as string)) || !minPoint) && (minPoint as string).length !== 0) {
      throw { status: 400, message: 'Minimum point must be numeric' };
    }

    if ((Number.isNaN(Number(maxPoint as string)) || !maxPoint) && (maxPoint as string).length !== 0) {
      throw { status: 400, message: 'Maximum point must be numeric' };
    }

    if (!userFields?.includes(sortBy as string) && (sortBy as string).length !== 0) {
      throw { status: 400, message: `User doesn't have ${sortBy} property` };
    }

    if (!sortMethods.includes(sort as string) && (sort as string).length !== 0) {
      throw { status: 400, message: 'Sort method is invalid' };
    }

    if (Number.isNaN(Number(limit as string)) && (limit as string).length !== 0) {
      throw { status: 400, message: 'Limit value must be numeric' };
    }

    if (Number.isNaN(Number(offset as string)) && (offset as string).length !== 0) {
      throw { status: 400, message: 'Offset value must be numeric' };
    }

    if (minPoint) filters.point = { gte: Number(minPoint as string) };

    if (maxPoint) {
      filters.point = {
        ...(filters.point || {}),
        lte: Number(maxPoint as string)
      };
    }

    const sortByStr = ((sortBy as string).length === 0) ? 'id' : sortBy as string;
    const users = await prismaClient.user.findMany({
      where: filters,
      orderBy: {
        [sortByStr]: ((sort as string).length === 0) ? sortMethods[0] : sort as string
      },
      take: ((limit as string).length === 0) ? 5 : Number(limit as string),
      skip: ((offset as string).length === 0) ? 0 : Number(offset as string)
    });
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'Users retrieved successfully',
      dataCount: users.length,
      data: { users: users }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Create new user and insert to database
export const createUser = async (req: Request, res: Response, next: any) => {
  const { name, email, password } = req.body;

  try {
    if (name.trim().length === 0) throw { status: 400, message: 'Name is empty' };

    if (email.trim().length === 0) throw { status: 400, message: 'Email is empty' };

    if (password.trim().length < 8) throw { status: 400, message: 'Password must be more than 8 characters' };

    const existingUser = await prismaClient.user.findUnique({
      where: { email: email }
    });

    if (existingUser !== null) throw { status: 400, message: 'User with this email has been registered' };

    const user = await prismaClient.user.create({
      data: {
        name: name,
        email: email,
        password: password
      }
    });
    const userArray = [user];
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User created successfully',
      dataCount: userArray.length,
      data: { users: userArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Update user from database
export const updateUser = async (req: Request, res: Response, next: any) => {
  const userId = Number(req.params.id);
  const { name, email, password } = req.body;

  try {
    if (Number.isNaN(userId)) throw { status: 400, message: 'User ID must be numeric' };

    if (name.trim().length === 0) throw { status: 400, message: 'Name is empty' };

    if (email.trim().length === 0) throw { status: 400, message: 'Email is empty' };

    if (password.trim().length < 8) throw { status: 400, message: 'Password must be more than 8 characters' };

    const [existingUser, existingUserEmail] = await Promise.all([
      prismaClient.user.findUnique({
        where: { id: userId }
      }),
      prismaClient.user.findUnique({
        where: { email: email }
      })
    ]);

    if (existingUser === null) throw { status: 404, message: `User with ID: ${userId} is not found` };

    if (existingUserEmail !== null && existingUser.email !== email) throw { status: 400, message: `This email has been already taken` };

    const user = await prismaClient.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
        password: password
      }
    });
    const userArray = [user];
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'User updated successfully',
      dataCount: userArray.length,
      data: { users: userArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Update users point by transfering point
export const transferPoint = async (req: Request, res: Response, next: any) => {
  const { amount, senderId, receiverId } = req.body;

  try {
    if (Number.isNaN(Number(amount))) throw { status: 400, message: 'Amount point value must be number' };

    if (Number(amount) <= 0) throw { status: 400, message: 'Amount point value must be greater than 0' };

    if (Number.isNaN(Number(senderId)) || senderId.length === 0) throw { status: 400, message: 'Sender ID must be number' };

    if (Number.isNaN(Number(receiverId)) || receiverId.length === 0) throw { status: 400, message: 'Receiver ID must be number' };

    const [sender, receiver] = await Promise.all([
      prismaClient.user.findUnique({ where: { id: Number(senderId) } }),
      prismaClient.user.findUnique({ where: { id: Number(receiverId) } })
    ]);

    if (!sender) throw { status: 404, message: `User with ID: ${senderId} is not found`};

    if (!receiver) throw { status: 404, message: `User with ID: ${receiverId} is not found`};

    if (sender.point < Number(amount)) throw { status: 400, message: `Point is not sufficient`};
    
    const userArray = await prismaClient.$transaction([
      prismaClient.user.update({
        where: { id: Number(senderId) },
        data: { 
          point: { decrement: Number(amount)}
        }
      }),
      prismaClient.user.update({
        where: { id: Number(receiverId) },
        data: {
          point: { increment: Number(amount) }
        }
      })
    ]);

    const status = 201;
    const response = {
      success: true,
      status: status,
      message: `Transfer point to ${receiver.name} success`,
      dataCount: userArray.length,
      data: { users: userArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete user from database
export const deleteUser = async (req: Request, res: Response, next: any) => {
  const userId = Number(req.params.id);
  
  try {
    if (Number.isNaN(userId)) throw { status: 400, message: 'User ID must be numeric' };

    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (existingUser === null) throw { status: 404, message: `User with ID: ${userId} is not found` };

    const deletedOrdersAndUser = await prismaClient.$transaction([
      prismaClient.order.deleteMany({
        where: { userId: userId}
      }),
      prismaClient.user.delete({
        where: { id: userId }
      })
    ]);
    const userArray = [deletedOrdersAndUser[1]];
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'User deleted successfully',
      dataCount: userArray.length,
      data: { users: userArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};