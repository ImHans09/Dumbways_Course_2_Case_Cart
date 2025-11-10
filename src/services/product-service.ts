import { NextFunction } from "express";
import { prismaClient } from "../prisma/client.js";

export const getAllProducts = async (next: NextFunction) => {
  try {
    const products = await prismaClient.product.findMany({});
    
    return Promise.resolve(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (supplierId: number, name: string, price: number, stock: number, next: NextFunction) => {
  try {
    const product = await prismaClient.product.create({
      data: {
        supplierId: supplierId,
        name: name,
        price: price,
        stock: stock
      }
    });

    return Promise.resolve(product);
  } catch (error) {
    next(error);
  }
};

export const updateProductImage = async (id: number, supplierId: number, imageName: string, next: NextFunction) => {
  try {
    const existingProduct = await prismaClient.product.findUnique({
      select: { id: true },
      where: {
        id: id,
        supplierId: supplierId
      }
    });
    console.log(existingProduct);
    
    if (existingProduct === null) throw { status: 404, message: 'This product is not found' };

    const updateDate = new Date(Date.now());
    const updatedProduct = await prismaClient.product.update({
      where: { id: id },
      data: {
        imageName: imageName,
        updatedAt: updateDate
      }
    });

    return Promise.resolve(updatedProduct);
  } catch (error) {
    next(error);
  }
};