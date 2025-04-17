import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // 导入主模块
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products/entities/product.entity'; // 导入 Product 实体
import { faker } from '@faker-js/faker'; // 导入 faker

async function bootstrap() {
  // 创建一个独立的 NestJS 应用上下文，不会启动 HTTP 服务器
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // 获取 Product Repository
  const productRepository = appContext.get<Repository<Product>>(
    getRepositoryToken(Product),
  );

  console.log('Starting seeding process...');

  const productsToSeed: Partial<Product>[] = []; // 使用 Partial<Product> 或直接创建对象
  const numberOfProducts = 100; // 要创建的商品数量

  for (let i = 0; i < numberOfProducts; i++) {
    const product = {
      name: faker.commerce.productName(),
      image: faker.image.urlLoremFlickr({ category: 'technics' }), // 生成一个图片 URL
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })), // 生成价格
      stock: faker.number.int({ min: 0, max: 500 }), // 生成库存
      description: faker.commerce.productDescription(),
    };
    productsToSeed.push(product);
  }

  try {
    // 使用 insert 批量插入数据，通常比循环 save 更高效
    await productRepository.insert(productsToSeed);
    console.log(`Successfully seeded ${numberOfProducts} products.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // 关闭应用上下文
    await appContext.close();
    console.log('Seeding process finished.');
  }
}

bootstrap();
