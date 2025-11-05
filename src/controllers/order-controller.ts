import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Fetch orders data from database
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { minQuantity, maxQuantity, minSubtotal, maxSubtotal, orderBy, sort, limit, offset } = req.query;
    const orderFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Order')?.fields.map((field) => field.name);
    const sortMethods = ['asc', 'desc'];
    const filters: any = {};

    if (!orderFields?.includes(orderBy as string) && (orderBy as string).length !== 0) {
      throw `Order doesn't have ${orderBy as string} property`;
    }

    if (!sortMethods.includes(sort as string) && (sort as string).length !== 0) {
      throw 'Sort method is invalid';
    }

    if (Number.isNaN(Number(limit)) && (limit as string).length !== 0) {
      throw 'Limit value must be numeric';
    }

    if (Number.isNaN(Number(offset)) && (offset as string).length !== 0) {
      throw 'Offset value must be numeric';
    }

    if ((Number.isNaN(Number(minQuantity)) || !minQuantity) && (minQuantity as string).length !== 0) {
      throw 'Minimum quantity must be numeric';
    }

    if ((Number.isNaN(Number(maxQuantity)) || !maxQuantity) && (maxQuantity as string).length !== 0) {
      throw 'Maximum quantity must be numeric';
    }

    if ((Number.isNaN(Number(minSubtotal)) || !minSubtotal) && (minSubtotal as string).length !== 0) {
      throw 'Minimum subtotal must be numeric';
    }

    if ((Number.isNaN(Number(maxSubtotal)) || !maxSubtotal) && (maxSubtotal as string).length !== 0) {
      throw 'Maximum subtotal must be numeric';
    }

    if (minQuantity) filters.quantity = { gte: parseFloat(minQuantity as string) };

    if (maxQuantity) {
      filters.quantity = {
        ...(filters.quantity || {}),
        lte: parseFloat(maxQuantity as string)
      };
    }

    if (minSubtotal) filters.subtotal = { gte: Number(minSubtotal as string) };

    if (maxSubtotal) {
      filters.subtotal = {
        ...(filters.subtotal || {}),
        lte: Number(maxSubtotal as string)
      };
    }

    const sortBy = ((orderBy as string).length === 0) ? 'id' : orderBy as string;
    const orders = await prismaClient.order.findMany({
      where: filters,
      orderBy: {
        [sortBy]: ((sort as string).length === 0) ? sortMethods[0] : sort as string
      },
      take: ((limit as string).length === 0) ? 5 : Number(limit),
      skip: ((offset as string).length === 0) ? 0 : Number(offset)
    });
    const ordersCount = await prismaClient.order.count({ where: filters });
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Orders retrieved successfully',
      dataCount: ordersCount,
      data: {
        products: orders
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    const statusCode = 500;
    const response = {
      success: false,
      error: {
        code: statusCode,
        message: error
      }
    };

    res.status(statusCode).json(response);
  }
};

// Count orders data grouped by user ID from database
export const countOrdersWithGrouping = async (req: Request, res: Response) => {
  try {
    const { orderBy, sort, limit, offset } = req.query;
    const orderFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Order')?.fields.map((field) => field.name);
    const sortMethods = ['asc', 'desc'];

    if (!orderFields?.includes(orderBy as string) && (orderBy as string).length !== 0) {
      throw `Order doesn't have ${orderBy as string} property`;
    }

    if (!sortMethods.includes(sort as string) && (sort as string).length !== 0) {
      throw 'Sort method is invalid';
    }

    if (Number.isNaN(Number(limit)) && (limit as string).length !== 0) {
      throw 'Limit value must be numeric';
    }

    if (Number.isNaN(Number(offset)) && (offset as string).length !== 0) {
      throw 'Offset value must be numeric';
    }

    const sortBy = ((orderBy as string).length === 0) ? 'userId' : orderBy as string;
    const orders = await prismaClient.order.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          [sortBy]: ((sort as string).length === 0) ? sortMethods[0] : sort as string
        }
      },
      take: ((limit as string).length === 0) ? 5 : Number(limit),
      skip: ((offset as string).length === 0) ? 0 : Number(offset)
    });
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Orders retrieved successfully',
      dataCount: orders.length,
      data: {
        products: orders
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    const statusCode = 500;
    const response = {
      success: false,
      error: {
        code: statusCode,
        message: error
      }
    };

    res.status(statusCode).json(response);
  }
}

// Create new order and insert to database
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, quantity, subtotal, products } = req.body;

    if (Number.isNaN(Number(userId))) {
      throw 'User ID must be numeric';
    }

    if (Number.isNaN(Number(quantity))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(subtotal))) {
      throw 'Price must be numeric';
    }

    if (products.length === 0) {
      throw 'Must select a product';
    }

    const order = await prismaClient.order.create({
      data: {
        userId: Number(userId),
        quantity: Number(quantity),
        subtotal: parseFloat(subtotal),
        products: {
          connect: products.map((productId: number) => ({ id: productId }))
        }
      }
    });
    const orderArray = [order];
    const statusCode = 201;
    const response = {
      success: true,
      code: statusCode,
      message: 'Order created successfully',
      dataCount: orderArray.length,
      data: {
        orders: orderArray
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    const statusCode = 400;
    const response = {
      success: false,
      error: {
        code: statusCode,
        message: error
      }
    };

    res.status(statusCode).json(response);
  }
};

// Update order from database
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { quantity, subtotal, products } = req.body;

    if (Number.isNaN(Number(quantity))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(subtotal))) {
      throw 'Price must be numeric';
    }

    if (products.length === 0) {
      throw 'Must select a product';
    }

    const existingOrder = await prismaClient.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (existingOrder === null) {
      throw `Order with id: ${orderId} is not exist`;
    }

    const updateDate = new Date(Date.now());
    const updatedOrder = await prismaClient.order.update({
      where: {
        id: orderId
      },
      data: {
        quantity: Number(quantity),
        subtotal: parseFloat(subtotal),
        products: {
          connect: products.map((productId: number) => ({ id: productId }))
        },
        updatedAt: updateDate
      }
    });
    const orderArray = [updatedOrder];
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Order updated successfully',
      dataCount: orderArray.length,
      data: {
        orders: orderArray
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    const statusCode = 400;
    const response = {
      success: false,
      error: {
        code: statusCode,
        message: error
      }
    };

    res.status(statusCode).json(response);
  }
};

// Delete order from database
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);

    if (Number.isNaN(orderId)) {
      throw 'Order id is invalid';
    }

    const existingOrder = await prismaClient.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (existingOrder === null) {
      throw `Order with id: ${orderId} is not exist`;
    }

    const deletedOrder = await prismaClient.order.delete({
      where: { 
        id: orderId
      }
    });
    const orderArray = [deletedOrder];
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Order deleted successfully',
      dataCount: orderArray.length,
      data: {
        orders: orderArray
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    const statusCode = 400;
    const response = {
      success: false,
      error: {
        code: statusCode,
        message: error
      }
    };

    res.status(statusCode).json(response);
  }
};