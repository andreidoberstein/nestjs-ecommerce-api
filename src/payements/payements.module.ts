import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payements.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './services/payements.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
