import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let orderId: number;

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
      .send({ email: 'payuser@example.com', password: 'password123' });

    // Login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'payuser@example.com', password: 'password123' });

    token = login.body.access_token;

    // Cria produto
    const product = await prisma.product.create({
      data: {
        name: 'Teclado Mecânico',
        price: 350.0,
        stock: 50,
      },
    });

    // Cria pedido
    const order = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 1 }],
      });

    orderId = order.body.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /payments - should process a payment for an order', async () => {
    const response = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.orderId).toBe(orderId);
    expect(response.body.status).toBe('COMPLETED'); 
  });
});
