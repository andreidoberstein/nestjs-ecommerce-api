# 🛒 E-commerce API

API REST completa para gerenciamento de um sistema de e-commerce, desenvolvida com **NestJS**, **Prisma**, **Docker** e autenticação **JWT**. A aplicação oferece funcionalidades de **cadastro e login de usuários**, **gerenciamento de produtos**, **realização de pedidos** e **pagamentos integrados**, com segurança, escalabilidade e documentação automática via **Swagger**.

---

## 🚀 Tecnologias Utilizadas

- **NestJS** – Framework escalável para Node.js
- **Prisma** – ORM moderno e eficiente
- **PostgreSQL** – Banco de dados relacional
- **Docker & Docker Compose** – Containerização e orquestração
- **JWT** – Autenticação com JSON Web Token
- **Swagger** – Documentação automática e interativa

---

## 📦 Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

---

## ⚙️ Como rodar o projeto

### 1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd ecommerce-api
```

### 2. Crie o arquivo `.env` com base no `.env.example`:
```bash
cp .env.example .env
```

Preencha o conteúdo com suas variáveis:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
JWT_SECRET="sua-chave-secreta"
PORT=3000
```

### 3. Suba os containers com Docker:
```bash
docker-compose up --build
```

### 4. Rode as migrations do Prisma:
```bash
docker-compose exec app npx prisma migrate dev
```

### 5. Acesse a documentação Swagger:
Acesse em seu navegador:
```
http://localhost:3000/api
```

---

## 🔐 Autenticação

Utilize o endpoint `/auth/login` para gerar um token JWT. Depois disso, inclua o token no header de requisições autenticadas:

```
Authorization: Bearer <token>
```

---

## 📌 Endpoints principais

### 🔑 Autenticação
- `POST /auth/register` – Registrar novo usuário
- `POST /auth/login` – Login e obtenção do token JWT

### 👤 Usuários
- `GET /users` – Listar usuários (admin)
- `GET /users/:id` – Detalhar usuário (próprio perfil ou admin)

### 📦 Produtos
- `POST /products` – Criar produto (admin)
- `GET /products` – Listar produtos
- `GET /products/:id` – Detalhar produto
- `PUT /products/:id` – Atualizar produto (admin)
- `DELETE /products/:id` – Deletar produto (admin)

### 📦 Pedidos
- `POST /orders` – Criar pedido (autenticado)
- `GET /orders` – Listar pedidos do usuário (ou admin)
- `GET /orders/:id` – Detalhar pedido

### 💳 Pagamentos
- `POST /payments` – Processar pagamento (autenticado)

---

## 🗂️ Estrutura do projeto

```
ecommerce-api/
├── src/
│   ├── auth/
│   ├── products/
│   ├── orders/
│   ├── payments/
│   ├── users/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── test/
│   └── (testes e2e organizados por módulo)
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## ✅ Testes End-to-End

Os testes estão localizados na pasta `test/` e cobrem os principais fluxos da aplicação:

```bash
npm run test:e2e
```

Utiliza Jest + Supertest para validação real da API em ambiente isolado.

---

## 💡 Autor

Desenvolvido com 💻 por **Andrei Doberstein**

---