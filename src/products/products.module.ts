import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // 导入 TypeOrmModule
import { Product } from './entities/product.entity'; // 导入 Product 实体

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // 在这里导入 forFeature
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
