import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const admin = {
    email: 'admin@orders.com',
    password: 'admin123',
    role: 'ADMIN',
  };

  const user = {
    email: 'user@orders.com',
    password: 'user123',
    role: 'USER',
  };

  let adminToken: string;
  let userToken: string;
  let userId: number;
  let orderId: number;
  let productId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Limpar dados
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: [admin.email, user.email] } },
    });

    // Criar admin e user
    await request(app.getHttpServer()).post('/auth/register').send(admin);
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: admin.password });
    adminToken = adminLogin.body.access_token;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);
    userId = userRegister.body.id;

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    userToken = userLogin.body.access_token;

    // Criar produto com estoque
    const productRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Pizza',
        price: 30,
        stock: 10,
      });
    productId = productRes.body.id;
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: [admin.email, user.email] } },
    });
    await app.close();
  });

  it('should create an order for user', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.items)).toBe(true);

    orderId = res.body.id;
  });

  it('should fail to create order with insufficient stock', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          {
            productId,
            quantity: 999, // estoque insuficiente
          },
        ],
      })
      .expect(404);
  });

  it('should list user orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('userId', userId);
  });

  it('should allow ADMIN to list all orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow user to get their own order by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', orderId);
  });

  it('should forbid user from accessing others orders', async () => {
    // Criar novo usuário que não tem o pedido
    const outsider = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'outsider@orders.com',
        password: 'outsider123',
        role: 'USER',
      });

    const outsiderLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'outsider@orders.com', password: 'outsider123' });

    const outsiderToken = outsiderLogin.body.access_token;

    await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .expect(404); // Deve retornar not found
  });
});
