import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { IUsersService } from '../interfaces/users-service.interface';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService implements IUsersService   {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any): Promise<UserEntity[]> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.user.findMany();
  }

  async findOne(id: number, user: any): Promise<UserEntity> {
    if (user.id !== id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    const userData = await this.prisma.user.findUnique({ where: { id } });
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    return userData;
  }

  async update(id: number, dto: UpdateUserDto, user: any): Promise<UserEntity> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.user.update({ where: { id }, data: dto });
  }
}