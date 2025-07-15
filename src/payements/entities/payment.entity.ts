export class PaymentEntity {
  id?: number;
  orderId: number;
  amount: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}