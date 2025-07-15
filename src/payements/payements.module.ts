import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './services/payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
