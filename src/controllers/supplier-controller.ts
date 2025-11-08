import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";
import { UserRole } from "@prisma/client";

// Get products data from database
export const getProducts = async (req: Request, res: Response, next: any) => {
  const { minPrice, maxPrice, minStock, maxStock, orderBy, order, limit, offset } = req.query;
  const role = (req as any).user.role;
  const supplierId = (req as any).user.id;
  const productFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Product')?.fields.map((field) => field.name);
  const orderMethods = ['asc', 'desc'];
  const filters: any = {};

  try {
    if (Number.isNaN(Number(supplierId))) {
      throw { status: 400, message: "Supplier ID must be numeric" };
    }

    if ((role as UserRole) !== UserRole.SUPPLIER) {
      throw { status: 400, message: "Unauthorized Supplier. Can't see the products" };
    }

    if (!productFields?.includes(orderBy as string) && (orderBy as string).length !== 0) {
      throw { status: 400, message: `Product doesn't have ${orderBy as string} property` };
    }

    if (!orderMethods.includes(order as string) && (order as string).length !== 0) {
      throw { status: 400, message: 'Order method is invalid' };
    }

    if (Number.isNaN(Number(limit)) && (limit as string).length !== 0) {
      throw { status: 400, message: 'Limit value must be numeric' };
    }

    if (Number.isNaN(Number(offset)) && (offset as string).length !== 0) {
      throw { status: 400, message: 'Offset value must be numeric' };
    }

    if ((Number.isNaN(Number(minPrice))) && (minPrice as string).length !== 0) {
      throw { status: 400, message: 'Minimum price must be numeric' };
    }

    if ((Number.isNaN(Number(maxPrice))) && (maxPrice as string).length !== 0) {
      throw { status: 400, message: 'Maximum price must be numeric' };
    }

    if (supplierId) filters.supplierId = Number(supplierId);

    if (minPrice) filters.price = { gte: parseFloat(minPrice as string) };

    if (maxPrice) {
      filters.price = {
        ...(filters.price || {}),
        lte: parseFloat(maxPrice as string)
      };
    }

    if (minStock) filters.stock = { gte: parseFloat(minStock as string) };

    if (maxStock) {
      filters.stock = {
        ...(filters.stock || {}),
        lte: parseFloat(maxStock as string)
      };
    }

    const sortBy = ((orderBy as string).length === 0) ? 'id' : orderBy as string;
    const products = await prismaClient.product.findMany({
      where: filters,
      orderBy: {
        [sortBy]: ((order as string).length === 0) ? orderMethods[0] : order as string
      },
      take: ((limit as string).length === 0) ? 5 : Number(limit),
      skip: ((offset as string).length === 0) ? 0 : Number(offset)
    });
    const productsCount = await prismaClient.product.count({ where: filters });
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Products retrieved successfully',
      dataCount: productsCount,
      data: {
        products: products
      }
    };

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};