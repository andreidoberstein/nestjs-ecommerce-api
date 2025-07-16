import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
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

    // Criação de usuário admin
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@example.com', password: 'admin123', role: 'ADMIN' });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    token = login.body.access_token;
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /products - create a product (admin only)', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Notebook Gamer',
        description: 'RTX 3060, 16GB RAM',
        price: 4500.00,
        stock: 10,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Notebook Gamer');
    productId = response.body.id;
  });

  it('GET /products - should list all products', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /products/:id - should return a specific product', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', productId);
    expect(response.body.name).toBe('Notebook Gamer');
  });

  it('PUT /products/:id - update a product', async () => {
    const response = await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Notebook Gamer Atualizado',
        description: 'Atualizado',
        price: 4700.00,
        stock: 15,
      })
      .expect(200);

    expect(response.body.name).toBe('Notebook Gamer Atualizado');
    expect(response.body.stock).toBe(15);
  });

  it('DELETE /products/:id - delete a product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const verify = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(404);
  });
});
