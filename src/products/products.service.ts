import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // 导入 InjectRepository
import { Repository } from 'typeorm'; // 导入 Repository
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity'; // 导入 Product 实体

@Injectable()
export class ProductsService {
  // 在构造函数中注入 Product Repository
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 创建一个新的 Product 实例
    const newProduct = this.productsRepository.create(createProductDto);
    // 保存到数据库
    return this.productsRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    // 查询数据库中的所有 Product 记录
    return this.productsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
