import { prismaClient } from "./client.js";

async function main() {
  // Truncate old records from table
  await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "products" RESTART IDENTITY CASCADE`);
  await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "orders" RESTART IDENTITY CASCADE`);
  await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
  await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE "_products_in_orders" RESTART IDENTITY CASCADE`);

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

  // Create orders data for seeding
  await Promise.all(orders.map(order => prismaClient.order.create({ data: order })));

  // Initialize products data
  const products = [
    { name: "Pulpen Gel Hitam", stock: 120, price: 5000, orders: [1, 5, 6, 10] },
    { name: "Pensil 2B", stock: 200, price: 3000, orders: [2, 5, 9] },
    { name: "Penghapus Pensil", stock: 150, price: 2500, orders: [1, 2, 8] },
    { name: "Spidol Permanent", stock: 80, price: 8000, orders: [11] },
    { name: "Buku Tulis A5 (40 lembar)", stock: 100, price: 6000, orders: [4, 10] },
    { name: "Sticky Notes (100 lembar)", stock: 90, price: 7000, orders: [2, 6] },
    { name: "Stapler Mini", stock: 70, price: 15000, orders: [3, 6] },
    { name: "Isi Staples No. 10", stock: 140, price: 4000, orders: [6, 10] },
    { name: "Penggaris 30 cm", stock: 110, price: 3500, orders: [4, 7] },
    { name: "Correction Tape", stock: 75, price: 9000, orders: [5, 8] }
  ];

  // Create products data for seeding
  for (const product of products) {
    await prismaClient.product.create({
      data: {
        name: product.name,
        stock: product.stock,
        price: product.price,
        orders: {
          connect: product.orders.map(orderId => ({ id: orderId }))
        }
      }
    });
  }
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