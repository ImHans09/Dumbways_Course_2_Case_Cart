import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Get products data from database
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice, minStock, maxStock, orderBy, order, limit, offset } = req.query;
    const productFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Product')?.fields.map((field) => field.name);
    const orderMethods = ['asc', 'desc'];
    const filters: any = {};

    if (!productFields?.includes(orderBy as string) && (orderBy as string).length !== 0) {
      throw `Product doesn't have ${orderBy as string} property`;
    }

    if (!orderMethods.includes(order as string) && (order as string).length !== 0) {
      throw 'Order method is invalid';
    }

    if (Number.isNaN(Number(limit)) && (limit as string).length !== 0) {
      throw 'Limit value must be numeric';
    }

    if (Number.isNaN(Number(offset)) && (offset as string).length !== 0) {
      throw 'Offset value must be numeric';
    }

    if ((Number.isNaN(Number(minPrice)) || !minPrice) && (minPrice as string).length !== 0) {
      throw 'Minimum price must be numeric';
    }

    if ((Number.isNaN(Number(maxPrice)) || !maxPrice) && (maxPrice as string).length !== 0) {
      throw 'Maximum price must be numeric';
    }

    if ((Number.isNaN(Number(minStock)) || !minStock) && (minStock as string).length !== 0) {
      throw 'Minimum stock must be numeric';
    }

    if ((Number.isNaN(Number(maxStock)) || !maxStock) && (maxStock as string).length !== 0) {
      throw 'Maximum stock must be numeric';
    }

    if (minPrice) filters.price = { gte: parseFloat(minPrice as string) };

    if (maxPrice) {
      filters.price = {
        ...(filters.price || {}),
        lte: parseFloat(maxPrice as string)
      };
    }

    if (minStock) filters.stock = { gte: Number(minStock as string) };

    if (maxStock) {
      filters.stock = {
        ...(filters.stock || {}),
        lte: Number(maxStock as string)
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

// Create new product and insert to database
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, stock, price } = req.body;

    if (name.trim().length === 0) {
      throw 'Name is empty';
    }

    if (Number.isNaN(Number(stock))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(price))) {
      throw 'Price must be numeric';
    }

    const product = await prismaClient.product.create({
      data: {
        name: name,
        stock: Number(stock),
        price: parseFloat(price)
      }
    });
    const productArray = [product];
    const statusCode = 201;
    const response = {
      success: true,
      code: statusCode,
      message: 'Product created successfully',
      dataCount: productArray.length,
      data: {
        products: productArray
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

// Update product from database
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const { name, stock, price } = req.body;

    if (name.trim().length === 0) {
      throw 'Name is empty';
    }

    if (Number.isNaN(Number(stock))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(price))) {
      throw 'Price must be numeric';
    }

    if (Number.isNaN(productId)) {
      throw 'Product id is invalid';
    }

    const existingProduct = await prismaClient.product.findUnique({
      where: {
        id: productId
      }
    });

    if (existingProduct === null) {
      throw `Product with id: ${productId} is not exist`;
    }

    const updateDate = new Date(Date.now());
    const updatedProduct = await prismaClient.product.update({
      where: {
        id: productId
      },
      data: {
        name: name,
        stock: Number(stock),
        price: parseFloat(price),
        updatedAt: updateDate
      }
    });
    const productArray = [updatedProduct];
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Product updated successfully',
      dataCount: productArray.length,
      data: {
        products: productArray
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

// Delete product from database
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      throw 'Product id is invalid';
    }

    const existingProduct = await prismaClient.product.findUnique({
      where: {
        id: productId
      }
    });

    if (existingProduct === null) {
      throw `Product with id: ${productId} is not exist`;
    }

    const deletedProduct = await prismaClient.product.delete({
      where: { 
        id: productId
      }
    });
    const productArray = [deletedProduct];
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Product deleted successfully',
      dataCount: productArray.length,
      data: {
        products: productArray
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