import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const admin = {
    email: 'admin@products.com',
    password: 'admin123',
    role: 'ADMIN',
  };

  const user = {
    email: 'user@products.com',
    password: 'user123',
    role: 'USER',
  };

  let adminToken: string;
  let userToken: string;
  let createdProductId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    await prisma.user.deleteMany({
      where: { email: { in: [admin.email, user.email] } },
    });

    // Register admin and user
    await request(app.getHttpServer()).post('/auth/register').send(admin);
    await request(app.getHttpServer()).post('/auth/register').send(user);

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: admin.password });
    adminToken = adminRes.body.access_token;

    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    userToken = userRes.body.access_token;
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

  it('should allow ADMIN to create a product', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test Product');
    createdProductId = res.body.id;
  });

  it('should deny USER to create a product', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Illegal Product',
        price: 9.99,
        stock: 1,
      })
      .expect(403);
  });

  it('should list all products (public)', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a product by ID (public)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${createdProductId}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', createdProductId);
    expect(res.body).toHaveProperty('name');
  });

  it('should return 404 for non-existent product', async () => {
    await request(app.getHttpServer())
      .get(`/products/999999`)
      .expect(404);
  });

  it('should allow ADMIN to update a product', async () => {
    const res = await request(app.getHttpServer())
      .put(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product',
        price: 123.45,
        stock: 5,
      })
      .expect(200);

    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('should deny USER to update a product', async () => {
    await request(app.getHttpServer())
      .put(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Hacked Product',
      })
      .expect(403);
  });

  it('should allow ADMIN to delete a product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should deny USER to delete a product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
