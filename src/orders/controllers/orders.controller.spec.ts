import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUser = {
    userId: '1',
    role: 'USER',
  };

  const mockOrder: OrderEntity = {
    id: 1,
    userId: 1,
    total: 99.99,
    status: 'PENDING',
    items: [{id: 1, orderId: 1, productId: 1, quantity: 2, price: 100.45 }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateOrderDto = {
      items: [{ productId: 1, quantity: 2 }],
    };

    it('should successfully create an order', async () => {
      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await ordersController.create(createDto, { user: mockUser });

      expect(ordersService.create).toHaveBeenCalledWith(createDto, mockUser.userId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders for the user', async () => {
      const orders = [mockOrder];
      mockOrdersService.findAll.mockResolvedValue(orders);

      const result = await ordersController.findAll({ user: mockUser });

      expect(ordersService.findAll).toHaveBeenCalledWith(mockUser.userId, mockUser.role);
      expect(result).toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('should return a single order by id', async () => {
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await ordersController.findOne('1', { user: mockUser });

      expect(ordersService.findOne).toHaveBeenCalledWith(1, mockUser.userId, mockUser.role);
      expect(result).toEqual(mockOrder);
    });
  });
});