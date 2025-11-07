import { Request, Response } from "express";
import { prismaClient } from "../prisma/client.js";

// Update stock and quantity from product stock and supplier
export const updateStockAndQuantity = async (req: Request, res: Response, next: any) => {
  const { amount, supplierId, productId } = req.body;

  try {
    if (Number.isNaN(Number(amount))) throw { status: 400, message: 'Amount must be numeric' };

    if (Number(amount) <= 0) throw { status: 400, message: 'Amount must be greater than 0' };

    if (Number.isNaN(Number(supplierId))) throw { status: 400, message: 'Supplier ID must be numeric' };

    if (Number.isNaN(Number(productId))) throw { status: 400, message: 'Product ID must be numeric' };

    const [existingSupplier, existingProduct, existingStock] = await Promise.all([
      prismaClient.supplier.findUnique({
        where: { id: Number(supplierId) }
      }),
      prismaClient.product.findUnique({
        where: { id: Number(productId) }
      }),
      prismaClient.stock.findUnique({
        where: { productId: Number(productId) }
      })
    ]);

    if (existingSupplier === null) throw { status: 404, message: `Supplier with ID: ${supplierId} is not found` };

    if (existingProduct === null) throw { status: 404, message: `Product with ID: ${productId} is not found` };

    if (existingStock === null) throw { status: 404, message: `Stock with ID: ${productId} is not found` };

    if (existingSupplier.stock < Number(amount)) throw { status: 400, message: `Supplier stock is not sufficient` };

    const supplierAndProductStock = await prismaClient.$transaction([
      prismaClient.supplier.update({
        where: { id: Number(supplierId) },
        data: {
          stock: { decrement: Number(amount) }
        }
      }),
      prismaClient.stock.update({
        where: { productId: Number(productId) },
        data: {
          quantity: { increment: Number(amount) }
        }
      })
    ]);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: `${existingProduct.name} stock has been updated`,
      dataCount: supplierAndProductStock.length,
      data: { 
        supplier: supplierAndProductStock[0],
        stock: supplierAndProductStock[1]
      }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
}