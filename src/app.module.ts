import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/user.module';
import { PaymentsModule } from './payements/payements.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [AuthModule,UsersModule,ProductsModule,OrdersModule,PaymentsModule],
  providers: [PrismaService],
})
export class AppModule {}
