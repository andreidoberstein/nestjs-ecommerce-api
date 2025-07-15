import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPaymentsService } from '../interfaces/payments-service.interface';
import { PaymentEntity } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentsService implements IPaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, userId: number): Promise<PaymentEntity> {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: order.total,
        status: 'COMPLETED',
      },
    });
  }
}