import { Request, Response } from "express";
import prismaClient from "../connection/client.js";

// Get products data from database and convert to JSON for reponse
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prismaClient.product.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Products retrieved successfully.',
      dataCount: products.length,
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
    const { name, quantity, price } = req.body;

    if (name.trim().length === 0) {
      throw 'Name is empty';
    }

    if (Number.isNaN(Number(quantity))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(price))) {
      throw 'Price must be numeric';
    }

    const product = await prismaClient.product.create({
      data: {
        name: name,
        quantity: Number(quantity),
        price: parseFloat(price)
      }
    });
    const productArray = [product];
    const statusCode = 201;
    const response = {
      success: true,
      code: statusCode,
      message: 'Products created successfully.',
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
    const { name, quantity, price } = req.body;

    if (name.trim().length === 0) {
      throw 'Name is empty';
    }

    if (Number.isNaN(Number(quantity))) {
      throw 'Quantity must be numeric';
    }

    if (Number.isNaN(Number(price))) {
      throw 'Price must be numeric';
    }

    const existingProduct = await prismaClient.product.findUnique({
      where: {
        id: productId
      }
    });

    if (existingProduct === null) {
      throw `Product with id: ${productId} is not exist`;
    }

    const updatedProduct = await prismaClient.product.update({
      where: {
        id: productId
      },
      data: {
        name: name,
        quantity: Number(quantity),
        price: parseFloat(price)
      }
    });
    const productArray = [updatedProduct];
    const statusCode = 200;
    const response = {
      success: true,
      code: statusCode,
      message: 'Products updated successfully.',
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
      message: 'Products deleted successfully.',
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