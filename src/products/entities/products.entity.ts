export class ProductEntity {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}