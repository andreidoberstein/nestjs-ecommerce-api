import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let productId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Cria usuário
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });

    // Login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    token = login.body.access_token;

    // Cria produto
    const product = await prisma.product.create({
      data: { name: 'Notebook Gamer', price: 2500.0, stock: 10 },
    });

    productId = product.id;
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /orders - should create a new order', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      })
      .expect(201);
      
    expect(response.body).toHaveProperty('userId');
    expect(response.body.total).toBe(5000.0);
    expect(response.body.items[0]).toMatchObject({
      productId,
      quantity: 2,
    });
  });

  it('GET /orders - should return a list of user orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /orders/:id - should return order details', async () => {
    const order = await prisma.order.findFirst();
    console.log(order)
    const response = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', order.id);
    expect(response.body.items.length).toBeGreaterThan(0);
  });
});
