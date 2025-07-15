import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/products.entity';

export interface IProductsService {
  create(dto: CreateProductDto, user: any): Promise<ProductEntity>;
  findAll(): Promise<ProductEntity[]>;
  findOne(id: number): Promise<ProductEntity>;
  update(id: number, dto: UpdateProductDto, user: any): Promise<ProductEntity>;
  remove(id: number, user: any): Promise<void>;
}