import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Get stocks data from database
export const getStocks = async (req: Request, res: Response, next: any) => {
  const { minQuantity, maxQuantity, productId, sortBy, sort, limit, offset } = req.query;
  const stockFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Stock')?.fields.map((field) => field.name);
  const sortMethods = ['asc', 'desc'];
  const filters: any = {};

  try {
    if (!stockFields?.includes(sortBy as string) && (sortBy as string).length !== 0) {
      throw { status: 400, message: `Stock doesn't have ${sortBy} property` };
    }

    if (!sortMethods.includes(sort as string) && (sort as string).length !== 0) {
      throw { status: 400, message: 'Sort method is invalid' };
    }

    if (Number.isNaN(Number(limit)) && (limit as string).length !== 0) {
      throw { status: 400, message: 'Limit value must be numeric' };
    }

    if (Number.isNaN(Number(offset)) && (offset as string).length !== 0) {
      throw { status: 400, message: 'Offset value must be numeric' };
    }

    if (Number.isNaN(Number(minQuantity)) && (minQuantity as string).length !== 0) {
      throw { status: 400, message: 'Minimum quantity must be numeric' };
    }

    if (Number.isNaN(Number(maxQuantity)) && (maxQuantity as string).length !== 0) {
      throw { status: 400, message: 'Maximum quantity must be numeric' };
    }

    if (Number.isNaN(Number(productId)) && (productId as string).length !== 0) {
      throw { status: 400, message: 'Product ID must be numeric' };
    }

    if (minQuantity) filters.quantity = { gte: Number(minQuantity) };

    if (maxQuantity) {
      filters.quantity = {
        ...(filters.quantity || {}),
        lte: Number(maxQuantity)
      };
    }

    if (productId) filters.productId = Number(productId);

    const sortByStr = ((sortBy as string).length === 0) ? 'id' : sortBy as string;
    const stocks = await prismaClient.stock.findMany({
      where: filters,
      orderBy: {
        [sortByStr]: ((sort as string).length === 0) ? sortMethods[0] : sort as string
      },
      take: ((limit as string).length === 0) ? 5 : Number(limit),
      skip: ((offset as string).length === 0) ? 0 : Number(offset)
    });
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'Stocks retrieved successfully',
      dataCount: stocks.length,
      data: { stocks: stocks }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};