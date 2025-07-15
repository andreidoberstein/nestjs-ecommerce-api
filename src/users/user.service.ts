import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.user.findMany();
  }

  async findOne(id: number, user: any) {
    if (user.userId !== id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.user.findUnique({ where: { id } });
  }
}