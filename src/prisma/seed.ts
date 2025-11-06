import { prismaClient } from "./client.js";

async function main() {
  // Truncate old records from table
  await prismaClient.$executeRaw`TRUNCATE TABLE orders RESTART IDENTITY CASCADE`;
  await prismaClient.$executeRaw`TRUNCATE TABLE products RESTART IDENTITY CASCADE`;
  await prismaClient.$executeRaw`TRUNCATE TABLE stocks RESTART IDENTITY CASCADE`;
  await prismaClient.$executeRaw`TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE`;
  await prismaClient.$executeRaw`TRUNCATE TABLE users RESTART IDENTITY CASCADE`;

  // Create users data for seeding
  await prismaClient.user.createMany({
    data: [
      {
        name: "Budi Santoso",
        email: "budi.santoso@example.com",
        password: "budi1234"
      },
      {
        name: "Siti Rahma",
        email: "siti.rahma@example.com",
        password: "rahma2024"
      },
      {
        name: "Andi Wijaya",
        email: "andi.wijaya@example.com",
        password: "andiSecure12"
      },
      {
        name: "Rina Putri",
        email: "rina.putri@example.com",
        password: "rinaPass88"
      },
      {
        name: "Dewi Lestari",
        email: "dewi.lestari@example.com",
        password: "lestari123"
      },
      {
        name: "Agus Prabowo",
        email: "agus.prabowo@example.com",
        password: "agusPassword1"
      }
    ]
  });

  // Create suppliers data for seeding
  await prismaClient.supplier.createMany({
    data: [
      { id: 1, name: "PT ATK Nusantara", stock: 100 },
      { id: 2, name: "CV Sumber Karya", stock: 100 },
      { id: 3, name: "PT Mega Office Supplies", stock: 100 }
    ]
  });

  // Initialize orders data
  const orders = [
    { userId: 1, quantity: 2, subtotal: 11000 },
    { userId: 2, quantity: 3, subtotal: 17000 },
    { userId: 3, quantity: 1, subtotal: 15000 },
    { userId: 4, quantity: 2, subtotal: 14000 },
    { userId: 5, quantity: 3, subtotal: 16000 },
    { userId: 6, quantity: 4, subtotal: 27000 },
    { userId: 1, quantity: 1, subtotal: 3500 },
    { userId: 2, quantity: 2, subtotal: 11000 },
    { userId: 3, quantity: 5, subtotal: 26500 },
    { userId: 4, quantity: 3, subtotal: 20000 },
    { userId: 2, quantity: 1, subtotal: 8000 }
  ];

  // Create orders data asynchronously for seeding
  for (const order of orders) {
    await prismaClient.order.create({ data: order });
  }
  
  // Initialize products data
  const products = [
    { supplierId: 1, name: "Pulpen Gel Hitam", price: 5000, orders: [1, 5, 6, 10] },
    { supplierId: 1, name: "Pensil 2B", price: 3000, orders: [2, 5, 9] },
    { supplierId: 1, name: "Penghapus Pensil", price: 2500, orders: [1, 2, 8] },
    { supplierId: 2, name: "Spidol Permanent", price: 8000, orders: [11] },
    { supplierId: 2, name: "Buku Tulis A5 (40 lembar)", price: 6000, orders: [4, 10] },
    { supplierId: 2, name: "Sticky Notes (100 lembar)", price: 7000, orders: [2, 6] },
    { supplierId: 2, name: "Stapler Mini", price: 15000, orders: [3, 6] },
    { supplierId: 3, name: "Isi Staples No. 10", price: 4000, orders: [6, 10] },
    { supplierId: 3, name: "Penggaris 30 cm", price: 3500, orders: [4, 7] },
    { supplierId: 3, name: "Correction Tape", price: 9000, orders: [5, 8] }
  ];

  // Create products data for seeding
  for (const product of products) {
    await prismaClient.product.create({
      data: {
        supplierId: product.supplierId,
        name: product.name,
        price: product.price,
        orders: { connect: product.orders.map(orderId => ({ id: orderId })) }
      }
    });
  }

  // Create stocks data for seeding
  await prismaClient.stock.createMany({
    data: [
      { id: 1, productId: 1, quantity: 120 },
      { id: 2, productId: 2, quantity: 200 },
      { id: 3, productId: 3, quantity: 150 },
      { id: 4, productId: 4, quantity: 80 },
      { id: 5, productId: 5, quantity: 100 },
      { id: 6, productId: 6, quantity: 90 },
      { id: 7, productId: 7, quantity: 70 },
      { id: 8, productId: 8, quantity: 140 },
      { id: 9, productId: 9, quantity: 110 },
      { id: 10, productId: 10, quantity: 75 }
    ],
  });
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });