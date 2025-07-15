import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';
import { NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
  };

  const mockUser = {
    userId: 1,
  };

  const mockOrder = {
    id: 1,
    userId: 1,
    total: 99.99,
    status: 'PENDING',
  };

  const mockPayment: PaymentEntity = {
    id: 1,
    orderId: 1,
    amount: 99.99,
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePaymentDto = {
      orderId: 1,
    };

    it('should successfully create a payment for a valid order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await paymentsService.create(createDto, mockUser.userId);

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.orderId },
      });
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          orderId: createDto.orderId,
          amount: mockOrder.total,
          status: 'COMPLETED',
        },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if order is not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        paymentsService.create(createDto, mockUser.userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.orderId },
      });
      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if order does not belong to user', async () => {
      const wrongUserOrder = { ...mockOrder, userId: '2' };
      mockPrismaService.order.findUnique.mockResolvedValue(wrongUserOrder);

      await expect(
        paymentsService.create(createDto, mockUser.userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.orderId },
      });
      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
    });
  });
});
