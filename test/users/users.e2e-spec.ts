import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const admin = {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN',
  };

  const user = {
    email: 'user@test.com',
    password: 'user1234',
    role: 'USER',
  };

  let adminToken: string;
  let userToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Cleanup users if they already exist
    await prisma.user.deleteMany({
      where: { email: { in: [admin.email, user.email] } },
    });

    // Create admin user
    await request(app.getHttpServer()).post('/auth/register').send(admin);
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: admin.password });
    adminToken = adminLogin.body.access_token;

    // Create normal user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    userToken = userLogin.body.access_token;

    // Decodificar JWT para obter o ID (sub)
    const payload = JSON.parse(
      Buffer.from(userToken.split('.')[1], 'base64').toString()
    );

    userId = payload.sub;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [admin.email, user.email] } },
    });
    await app.close();
  });

  it('ADMIN should fetch all users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('USER should be denied access to fetch all users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('USER should fetch own profile by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', user.email);
  });

  it('USER should be denied fetching another user', async () => {
    const adminRes = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    const anotherUserId = adminRes.body.find(
      (u) => u.email !== user.email && u.role === 'ADMIN'
    )?.id;

    if (anotherUserId) {
      await request(app.getHttpServer())
        .get(`/users/${anotherUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    }
  });

  it('Should return 404 for non-existent user', async () => {
    await request(app.getHttpServer())
      .get(`/users/999999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
