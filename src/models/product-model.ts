// Create Product model
export interface Product {
  id: number,
  name: string,
  quantity: number,
  price: number
}

// Initialize products dummy data
export const products: Product[] = [
  {id: 1, name: 'Buku', quantity: 10, price: 15000},
  {id: 2, name: 'Pulpen', quantity: 30, price: 5000},
  {id: 3, name: 'Penghapus', quantity: 7, price: 2000}
];