import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderEntity } from '../entities/order.entity';

export interface IOrdersService {
  create(dto: CreateOrderDto, userId: number): Promise<OrderEntity>;
  findAll(userId: number, role: string): Promise<OrderEntity[]>;
  findOne(id: number, userId: number, role: string): Promise<OrderEntity>;
}