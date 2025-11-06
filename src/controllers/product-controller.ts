import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Get products data from database
export const getProducts = async (req: Request, res: Response, next: any) => {
  const { minPrice, maxPrice, orderBy, order, limit, offset } = req.query;
  const productFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Product')?.fields.map((field) => field.name);
  const orderMethods = ['asc', 'desc'];
  const filters: any = {};

  try {
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

    if ((Number.isNaN(Number(minPrice)) || !minPrice) && (minPrice as string).length !== 0) {
      throw { status: 400, message: 'Minimum price must be numeric' };
    }

    if ((Number.isNaN(Number(maxPrice)) || !maxPrice) && (maxPrice as string).length !== 0) {
      throw { status: 400, message: 'Maximum price must be numeric' };
    }

    if (minPrice) filters.price = { gte: parseFloat(minPrice as string) };

    if (maxPrice) {
      filters.price = {
        ...(filters.price || {}),
        lte: parseFloat(maxPrice as string)
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

// Create new product and insert to database
export const createProduct = async (req: Request, res: Response, next: any) => {
  const { supplierId, name, quantity, price } = req.body;

  try {
    if (name.trim().length === 0) throw { status: 400, message: 'Name is empty' };

    if (Number.isNaN(Number(supplierId))) throw { status: 400, message: 'Supplier ID must be numeric' };

    if (Number.isNaN(Number(quantity))) throw { status: 400, message: 'Quantity must be numeric' };

    if (Number.isNaN(Number(price))) throw { status: 400, message: 'Price must be numeric' };

    const product = await prismaClient.product.create({
      data: {
        supplierId: Number(supplierId),
        name: name,
        price: parseFloat(price)
      }
    });

    await prismaClient.stock.create({
      data: { 
        productId: product.id,
        quantity: Number(quantity) 
      }
    });

    const productArray = [product];
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'Product created successfully',
      dataCount: productArray.length,
      data: { products: productArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Update product from database
export const updateProduct = async (req: Request, res: Response, next: any) => {
  const productId = Number(req.params.id);
  const { name, price } = req.body;

  try {
    if (name.trim().length === 0) throw { status: 400, message: 'Name is empty' };

    if (Number.isNaN(Number(price))) throw { status: 400, message: 'Price must be numeric' };

    if (Number.isNaN(productId)) throw { status: 400, message: 'Product id is invalid' };

    const existingProduct = await prismaClient.product.findUnique({
      where: { id: productId }
    });

    if (existingProduct === null) throw { status: 404, message: `Product with id: ${productId} is not exist` };

    const updateDate = new Date(Date.now());
    const updatedProduct = await prismaClient.product.update({
      where: { id: productId },
      data: {
        name: name,
        price: parseFloat(price),
        updatedAt: updateDate
      }
    });
    const productArray = [updatedProduct];
    const status = 200;
    const response = {
      success: true,
      code: status,
      message: 'Product updated successfully',
      dataCount: productArray.length,
      data: {
        products: productArray
      }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete product from database
export const deleteProduct = async (req: Request, res: Response, next: any) => {
  const productId = Number(req.params.id);

  try {
    if (Number.isNaN(productId)) throw { status: 400, message: 'Product ID must be numeric' };

    const existingProduct = await prismaClient.product.findUnique({
      where: { id: productId }
    });

    if (existingProduct === null) throw { status: 404, message: `Product with ID: ${productId} is not exist` };

    const deleteProductAndStock = await prismaClient.$transaction([
      prismaClient.product.delete({
        where: { id: productId }
      }),
      prismaClient.stock.delete({
        where: { productId: productId }
      })
    ]);
    const productArray = [deleteProductAndStock[0]];
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'Product deleted successfully',
      dataCount: productArray.length,
      data: { products: productArray }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};