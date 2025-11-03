import { Request, Response } from "express";
import { Product, products } from "../models/product-model.js";

// Fetch products data and convert to JSON for reponse
export const getProducts = (req: Request, res: Response) => {
  res.status(200).json(products);
};

// Create new product and add to products array
export const createProduct = (req: Request, res: Response) => {
  const { name, quantity, price } = req.body;
  const newProductId = products.length > 0 ? products[products.length - 1]?.id : 1;
  const newProduct: Product = {
    id: (typeof newProductId === 'number' && products.length > 0) ? newProductId + 1 : 1,
    name: name,
    quantity: quantity,
    price: price
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};

// Update product from products array
export const updateProduct = (req: Request, res: Response) => {
  const { name, quantity, price } = req.body;
  const productId = Number(req.params.id);
  const targetUpdateProduct = products.find(product => product.id === productId);
  let message = 'Update product failed.';

  if (targetUpdateProduct) {
    targetUpdateProduct.name = name;
    targetUpdateProduct.quantity = quantity;
    targetUpdateProduct.price = price;
    message = `Update product with id: ${productId} successful.`;
  }

  const response = {
    message: message,
    products: products
  };

  res.status(200).json(response);
};

// Delete product from products array
export const deleteProduct = (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const targetDeletionProductIndex = products.findIndex(product => product.id === productId);
  let message = 'Delete product failed.';

  if (targetDeletionProductIndex !== -1) {
    products.splice(targetDeletionProductIndex, 1);
    message = `Delete product with id: ${productId} successful.`;
  }

  const response = {
    message: message,
    products: products
  };

  res.status(200).json(response);
};