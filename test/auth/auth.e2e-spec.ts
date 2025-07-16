import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany(); // Limpa usuários antes de cada teste
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        role: 'ADMIN',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).not.toHaveProperty('password'); // Segurança
    });

    it('should fail if email is invalid', async () => {
      const user = {
        email: 'invalid-email',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(400);
    });
  });

  beforeEach(async () => {
    await prisma.user.deleteMany(); // Limpa usuários antes de cada teste
  });

  describe('/auth/login (POST)', () => {
    it('should login with correct credentials and return token', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: user.email,
          password: user.password,
          role: 'USER',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(user)
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
    });

    it('should fail with wrong credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
