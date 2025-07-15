import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/products.entity';
import { ForbiddenException } from '@nestjs/common';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 1,
    role: 'ADMIN',
  };

  const mockProduct: ProductEntity = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    stock: 54
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Test Product',
      price: 99.99,
      description: 'Test Description',
      stock: 34
    };

    it('should successfully create a product for admin user', async () => {
      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await productsController.create(createDto, { user: mockUser });

      expect(productsService.create).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockProduct);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      mockProductsService.create.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(productsController.create(createDto, { user: { ...mockUser, role: 'USER' } }))
        .rejects.toThrow(ForbiddenException);
      expect(productsService.create).toHaveBeenCalledWith(createDto, { ...mockUser, role: 'USER' });
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await productsController.findAll();

      expect(productsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await productsController.findOne('1');

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should successfully update a product for admin user', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await productsController.update('1', updateDto, { user: mockUser });

      expect(productsService.update).toHaveBeenCalledWith(1, updateDto, mockUser);
      expect(result).toEqual(updatedProduct);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      mockProductsService.update.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(productsController.update('1', updateDto, { user: { ...mockUser, role: 'USER' } }))
        .rejects.toThrow(ForbiddenException);
      expect(productsService.update).toHaveBeenCalledWith(1, updateDto, { ...mockUser, role: 'USER' });
    });
  });

  describe('remove', () => {
    it('should successfully delete a product for admin user', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await productsController.remove('1', { user: mockUser });

      expect(productsService.remove).toHaveBeenCalledWith(1, mockUser);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      mockProductsService.remove.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(productsController.remove('1', { user: { ...mockUser, role: 'USER' } }))
        .rejects.toThrow(ForbiddenException);
      expect(productsService.remove).toHaveBeenCalledWith(1, { ...mockUser, role: 'USER' });
    });
  });
});