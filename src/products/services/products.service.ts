import { Injectable, ForbiddenException } from '@nestjs/common';
import { IProductsService } from '../interfaces/products-service.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductEntity } from '../entities/products.entity';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, user: any): Promise<ProductEntity> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.product.create({ data: dto });
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<ProductEntity> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateProductDto, user: any): Promise<ProductEntity> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: number, user: any): Promise<void> {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
  }
}