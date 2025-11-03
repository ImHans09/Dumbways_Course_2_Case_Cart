import { Request, Response } from "express";
import { Order, orders } from "../models/order-model.js";
import { Product } from "../models/product-model.js";

// Fetch orders data and convert to JSON for reponse
export const getOrders = (req: Request, res: Response) => {
  res.status(200).json(orders);
};

// Create new order and add to orders array
export const createOrder = (req: Request, res: Response) => {
  const products = JSON.parse(req.body.products);
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const newOrderId = orders.length > 0 ? orders[orders.length - 1]?.id : 1;
  const newOrder: Order = {
    id: (typeof newOrderId === 'number' && orders.length > 0) ? newOrderId + 1 : 1,
    date: `${formattedDay}/${formattedMonth}/${year}`,
    products: products,
    subtotal: products.reduce((accumulator: number, product: Product) => accumulator + product.quantity * product.price, 0)
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
};

// Update order from orders array
export const updateOrder = (req: Request, res: Response) => {
  const products = JSON.parse(req.body.products);
  const orderId = Number(req.params.id);
  const targetUpdateOrder = orders.find(order => order.id === orderId);
  let message = 'Update order failed.';

  if (targetUpdateOrder) {
    targetUpdateOrder.products = products;
    targetUpdateOrder.subtotal = products.reduce((accumulator: number, product: Product) => accumulator + product.quantity * product.price, 0);
    message = `Update order with id: ${orderId} successful.`;
  }

  const response = {
    message: message,
    orders: orders
  };

  res.status(200).json(response);
};

// Delete order from products array
export const deleteOrder = (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const targetDeletionOrderIndex = orders.findIndex(order => order.id === orderId);
  let message = 'Delete order failed.';

  if (targetDeletionOrderIndex !== -1) {
    orders.splice(targetDeletionOrderIndex, 1);
    message = `Delete order with id: ${orderId} successful.`;
  }

  const response = {
    message: message,
    orders: orders
  };

  res.status(200).json(response);
};