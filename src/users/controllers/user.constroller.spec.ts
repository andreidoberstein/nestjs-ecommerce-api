
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../services/user.service';
import { UserEntity } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './user.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
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
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users for admin user', async () => {
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await usersController.findAll({ user: mockAdminUser });

      expect(usersService.findAll).toHaveBeenCalledWith(mockAdminUser);
      expect(result).toEqual(mockUsers);
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      mockUsersService.findAll.mockRejectedValue(new ForbiddenException('Access denied'));

      await expect(usersController.findAll({ user: mockRegularUser })).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersService.findAll).toHaveBeenCalledWith(mockRegularUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID for valid request', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await usersController.findOne('1', { user: mockRegularUser });

      expect(usersService.findOne).toHaveBeenCalledWith(1, mockRegularUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('User not found'));

      await expect(usersController.findOne('1', { user: mockRegularUser })).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(1, mockRegularUser);
    });
  });
});
