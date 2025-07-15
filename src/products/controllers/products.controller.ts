import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (admin only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @Post()
  async create(@Body() dto: CreateProductDto, @Request() req) {
    return this.productsService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Request() req) {
    return this.productsService.update(parseInt(id), dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.productsService.remove(parseInt(id), req.user);
  }
}