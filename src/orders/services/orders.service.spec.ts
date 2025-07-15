import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  };

  const mockUser = {
    userId: 1,
    role: 'ADMIN',
  };

  const mockOrder: OrderEntity = {
    id: 1,
    userId: 1,
    total: 99.99,
    status: 'PENDING',
    items: [{ productId: 1, quantity: 2, price: 49.995 }],
  };

  const mockProduct = {
    id: 1,
    stock: 10,
    price: 49.995,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateOrderDto = {
      items: [{ productId: 1, quantity: 2 }],
    };

    it('should successfully create an order with valid products and stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 10 });
      mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, stock: 8 });
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await ordersService.create(createDto, mockUser.userId);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { decrement: 2 } },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.userId,
          total: 99.99,
          items: {
            create: [
              {
                productId: 1,
                quantity: 2,
                price: mockProduct.price,
              },
            ]
          }
        },
        include: {
          items: true,
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(ordersService.create(createDto, mockUser.userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product stock is insufficient', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 1 });

      await expect(ordersService.create(createDto, mockUser.userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });
  });
});