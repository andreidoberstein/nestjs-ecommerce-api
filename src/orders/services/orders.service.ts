import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrdersService } from '../interfaces/orders-service.interface';
import { CreateOrderDto, OrderItemDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: number): Promise<OrderEntity> {
    let total = 0;
    const items = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({ 
          where: { id: item.productId } 
        });
        if (!product || product.stock < item.quantity) {
          throw new NotFoundException(`Product ${item.productId} not found or insufficient stock`);
        }
        total += product.price * item.quantity;
        // Atualiza o estoque após criar o pedido
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        return { 
          productId: item.productId, 
          quantity: item.quantity, 
          price: product.price };
      }),
    );
    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
    return order;
  }

  async findAll(userId: number, role: string): Promise<OrderEntity[]> {
    if (role === 'ADMIN') {
      return this.prisma.order.findMany({ include: { items: true } });
    }
    return this.prisma.order.findMany({ where: { userId }, include: { items: true } });
  }

  async findOne(id: number, userId: number, role: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || (order.userId !== userId && role !== 'ADMIN')) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}