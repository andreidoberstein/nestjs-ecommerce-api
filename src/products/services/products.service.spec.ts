import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/products.entity';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
    stock: 23,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await productsService.create(createDto, mockUser);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };

      await expect(productsService.create(createDto, nonAdminUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await productsService.findAll();

      expect(prismaService.product.findMany).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productsService.findOne(1);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
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
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await productsService.update(1, updateDto, mockUser);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };

      await expect(productsService.update(1, updateDto, nonAdminUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete a product for admin user', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(undefined);

      await productsService.remove(1, mockUser);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const nonAdminUser = { ...mockUser, role: 'USER' };

      await expect(productsService.remove(1, nonAdminUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaService.product.findUnique).not.toHaveBeenCalled();
      expect(prismaService.product.delete).not.toHaveBeenCalled();
    });
  });
});