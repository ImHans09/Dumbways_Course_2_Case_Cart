import { Request, Response } from "express";
import { prisma, prismaClient } from "../prisma/client.js";

// Get suppliers data from database
export const getSuppliers = async (req: Request, res: Response, next: any) => {
  const { supplierId, supplierName, sortBy, sort, limit, offset } = req.query;
  const supplierFields = prisma.dmmf.datamodel.models.find((model) => model.name === 'Supplier')?.fields.map((field) => field.name);
  const sortMethods = ['asc', 'desc'];
  const filters: any = {};

  try {
    if (!supplierFields?.includes(sortBy as string) && (sortBy as string).length !== 0) {
      throw { status: 400, message: `Supplier doesn't have ${sortBy} property` };
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

    if (Number.isNaN(Number(supplierId)) && (supplierId as string).length !== 0) {
      throw { status: 400, message: 'Supplier ID must be numeric' };
    }

    if (supplierId) filters.id = Number(supplierId);

    if (supplierName) filters.name = supplierName as string;

    const sortByStr = ((sortBy as string).length === 0) ? 'id' : sortBy as string;
    const suppliers = await prismaClient.supplier.findMany({
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
      message: 'Suppliers retrieved successfully',
      dataCount: suppliers.length,
      data: { suppliers: suppliers }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

// Update stock and quantity from product stock and supplier in database
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
};