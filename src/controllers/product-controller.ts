import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { createProduct, getAllProducts, updateProductImage } from "../services/product-service.js";

export const handleAllProductsSelected = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await getAllProducts(next);
    const status = 200;
    const response = {
      success: true,
      status: status,
      message: 'Products retrieved successfully',
      dataCount: products?.length,
      data: { products: products }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleProductCreation = async (req: Request, res: Response, next: NextFunction) => {
  const supplierId: number = (req as any).user.id;
  const schema = Joi.object({
    supplierId: Joi.number().integer().required().error(new Error('Supplier ID is invalid')),
    name: Joi.string().min(4).max(40).required().error(new Error('Name must be greater than 4 characters')),
    price: Joi.number().min(500).precision(2).required().error(new Error('Price must be numeric and greater than Rp 500')),
    stock: Joi.number().integer().min(10).required().error(new Error('Stock must be numeric and greater than 10'))
  });
  const { error } = schema.validate({
    supplierId: supplierId,
    name: req.body.name,
    price: parseFloat(req.body.price),
    stock: Number(req.body.stock)
  });

  try {
    if (error) throw { status: 400, message: error.message };

    const { name, price, stock } = req.body;
    const product = await createProduct(supplierId, name, parseFloat(price), Number(stock), next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'Products created successfully',
      dataCount: [product].length,
      data: { product: product }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export const handleProductImageUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const productId = Number(req.params.id);
  const supplierId: number = (req as any).user.id;
  const imageFile = req.file;
  const schema = Joi.object({
    id: Joi.number().integer().required().error(new Error('Product ID is invalid')),
    supplierId: Joi.number().integer().required().error(new Error('Supplier ID is invalid')),
    imageName: Joi.string().required().error(new Error('Image name is invalid'))
  });
  const { error } = schema.validate({
    id: productId,
    supplierId: supplierId,
    imageName: imageFile?.filename
  });

  try {
    if (!imageFile) throw { status: 404, message: 'Product image is not uploaded' };

    if (error) throw { status: 400, message: error.message };

    const product = await updateProductImage(productId, supplierId, imageFile.filename, next);
    const status = 201;
    const response = {
      success: true,
      status: status,
      message: 'Products image uploaded successfully',
      dataCount: [product].length,
      data: { product: product }
    };

    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};