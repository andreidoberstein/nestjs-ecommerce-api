import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';

export interface IPaymentsService {
  create(dto: CreatePaymentDto, userId: number): Promise<PaymentEntity>;
}