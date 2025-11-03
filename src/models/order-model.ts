import { Product } from "./product-model.js";

// Create Order model
export interface Order {
  id: number,
  date: string,
  products: Product[],
  subtotal: number
}

// Initialize orders dummy data
export const orders: Order[] = [];