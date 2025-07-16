import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: number;
  let orderId: number;
  let productId: number;

  const user = {
    email: `user${Date.now()}@test.com`,
    password: 'user1234',
    role: 'USER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Cria usuário
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);

    userId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });

    userToken = loginRes.body.access_token;

    // Cria produto
    const product = await prisma.product.create({
      data: {
        name: 'Produto Teste',
        price: 100,
        stock: 10,
      },
    });

    productId = product.id;

    // Cria pedido
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      });

    orderId = orderRes.body.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { email: user.email } });
    await app.close();
  });

  it('should process payment for a valid order', async () => {
    const res = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('orderId', orderId);
    expect(res.body).toHaveProperty('amount');
    expect(res.body.status).toBe('COMPLETED');
  });

  it('should fail to pay for non-existent order', async () => {
    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: 999999 })
      .expect(404);
  });
});
