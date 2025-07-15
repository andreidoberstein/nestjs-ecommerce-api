export class OrderEntity {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  items: OrderItemEntity[];
}

export class OrderItemEntity {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
}