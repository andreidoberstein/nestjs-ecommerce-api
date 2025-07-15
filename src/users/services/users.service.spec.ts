import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './user.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockAdminUser = {
    userId: 1,
    role: 'ADMIN',
  };

  const mockRegularUser = {
    userId: 2,
    role: 'USER',
  };

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    role: 'USER',
  };

  const mockUsers: UserEntity[] = [
    { id: 1, email: 'test1@example.com', role: 'USER' },
    { id: 2, email: 'test2@example.com', role: 'ADMIN' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users for admin user', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await usersService.findAll(mockAdminUser);

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      await expect(usersService.findAll(mockRegularUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user for admin user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne(1, mockAdminUser);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return a user if userId matches', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne(2, mockRegularUser);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException for non-matching userId and non-admin', async () => {
      await expect(usersService.findOne(1, mockRegularUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findOne(1, mockAdminUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
