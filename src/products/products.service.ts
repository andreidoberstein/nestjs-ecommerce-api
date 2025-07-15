import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; price: number; stock: number }, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.product.create({ data });
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; description?: string; price?: number; stock?: number }, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number, user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.product.delete({ where: { id } });
  }
}