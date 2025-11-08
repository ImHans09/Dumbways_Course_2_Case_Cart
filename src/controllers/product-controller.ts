import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";
import { response } from "../utils/response.js";
import { UserRole } from "@prisma/client";

// Create new product data and insert into database
export const createProduct = async (req: Request, res: Response, next: any) => {
  const { name, price, stock } = req.body;
  const role = (req as any).user.role;
  const supplierId = (req as any).user.id;

  try {
    if (Number.isNaN(Number(supplierId))) {
      throw { status: 400, message: "Supplier ID must be numeric" };
    }

    if ((role as UserRole) !== UserRole.SUPPLIER) {
      throw { status: 400, message: "Unauthorized Supplier. Can't see the products" };
    }

    if (name.trim().length < 3) {
      throw { status: 400, message: "Product name must be greater than 3 characters" };
    }

    if (Number.isNaN(Number(price))) {
      throw { status: 400, message: "Product price must be numeric" };
    }

    if (Number.isNaN(Number(stock))) {
      throw { status: 400, message: "Product stock must be numeric" };
    }

    if (Number(price) < 500) {
      throw { status: 400, message: "Product price must be greater than Rp 500,00" };
    }

    if (Number(stock) <= 0) {
      throw { status: 400, message: "Product stock must be greater than 0" };
    }

    const product = await prismaClient.product.create({
      data: {
        supplierId: Number(supplierId),
        name: name,
        price: parseFloat(price),
        stock: Number(stock)
      }
    });

    res.status(201).json(response(true, 201, 'New product added successfully', [product].length, { product: product }));
  } catch (error) {
    next(error);
  }
};

// Update product from database
export const updateProduct = async (req: Request, res: Response, next: any) => {
  const productId = Number(req.params.id);
  const role = (req as any).user.role;
  const supplierId = (req as any).user.id;
  const { name, price, stock } = req.body;

  try {
    if (Number.isNaN(productId)) {
      throw { status: 400, message: 'Product ID is invalid' };
    }

    if (Number.isNaN(Number(supplierId))) {
      throw { status: 400, message: "Supplier ID must be numeric" };
    }

    if ((role as UserRole) !== UserRole.SUPPLIER) {
      throw { status: 400, message: "Unauthorized Supplier. Can't see the products" };
    }

    if (name.trim().length < 3) {
      throw { status: 400, message: 'Product name must be greater than 3 characters' };
    }

    if (Number.isNaN(Number(price))) {
      throw { status: 400, message: "Product price must be numeric" };
    }

    if (Number.isNaN(Number(stock))) {
      throw { status: 400, message: "Product stock must be numeric" };
    }

    if (Number(price) < 500) {
      throw { status: 400, message: "Product price must be greater than Rp 500,00" };
    }

    if (Number(stock) <= 0) {
      throw { status: 400, message: "Product stock must be greater than 0" };
    }

    const existingProduct = await prismaClient.product.findUnique({
      select: { stock: true },
      where: { 
        id: productId,
        supplierId: Number(supplierId)
      }
    });

    if (existingProduct === null) {
      throw { status: 404, message: `Product with ID: ${productId} from this supplier is not found` };
    }

    const updateDate = new Date(Date.now());
    const updatedProduct = await prismaClient.product.update({
      where: { id: productId },
      data: {
        name: name,
        price: parseFloat(price),
        stock: existingProduct.stock + Number(stock),
        updatedAt: updateDate
      }
    });

    res.status(200).json(response(true, 200, 'Product updated successfully', [updatedProduct].length, { product: updatedProduct }));
  } catch (error) {
    next(error);
  }
};