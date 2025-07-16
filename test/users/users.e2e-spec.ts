import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    const email = 'admin3@example.com';
    const password = 'password123';

    // Registra um novo usuário admin
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, role: 'ADMIN' })
      .expect(201);

    // Faz login para obter token
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    accessToken = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany(); // Limpa usuários antes de cada teste
  });

  it('should get all users with valid token', async () => {
    const email = 'admin2@example.com';
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, role: 'ADMIN' }) // <-- mantém o role como ADMIN
      .expect(201);

    // Faz login para obter token
    const data = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    accessToken = data.body.access_token;

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('email');
  });

  it('should fail without token', async () => {
    await request(app.getHttpServer()).get('/users').expect(401); // Unauthorized
  });

  beforeEach(async () => {
    await prisma.user.deleteMany(); // Limpa usuários antes de cada teste
  });

  it('should get one user by ID', async () => {
    const email = 'admin2@example.com';
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, role: 'ADMIN' }) // <-- mantém o role como ADMIN
      .expect(201);

    // Faz login para obter token
    const data = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    accessToken = data.body.access_token;
    // Busca todos os usuários
    const allUsers = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
      
    const userId = allUsers.body[0].id;

    // Busca usuário por ID
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email');
  });
});
