import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { items: { productId: number; quantity: number }[] }, userId: number) {
    let total = 0;
    const items = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new NotFoundException(`Product ${item.productId} not found or insufficient stock`);
        }
        total += product.price * item.quantity;
        return { productId: item.productId, quantity: item.quantity, price: product.price };
      }),
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: { create: items },
      },
    });

    await Promise.all(
      items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    return order;
  }

  async findAll(userId: number, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.order.findMany({ include: { items: true } });
    }
    return this.prisma.order.findMany({ where: { userId }, include: { items: true } });
  }

  async findOne(id: number, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || (order.userId !== userId && role !== 'ADMIN')) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}