import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';
import { NotFoundException } from '@nestjs/common';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    create: jest.fn(),
  };

  const mockUser = {
    userId: '1',
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
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    paymentsController = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePaymentDto = {
      orderId: 1,
    };

    it('should successfully process a payment', async () => {
      mockPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await paymentsController.create(createDto, { user: mockUser });

      expect(paymentsService.create).toHaveBeenCalledWith(createDto, mockUser.userId);
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment creation fails', async () => {
      mockPaymentsService.create.mockRejectedValue(new NotFoundException('Order not found'));

      await expect(paymentsController.create(createDto, { user: mockUser })).rejects.toThrow(
        NotFoundException,
      );
      expect(paymentsService.create).toHaveBeenCalledWith(createDto, mockUser.userId);
    });
  });
});