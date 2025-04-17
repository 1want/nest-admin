import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity'; // 导入 Product 实体

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // 数据库类型
      host: 'localhost', // 数据库主机名，如果是本地就是 localhost 或 127.0.0.1
      port: 5432,
      username: 'admin', // 你的数据库用户名
      password: '123456', // 你的数据库密码
      database: 'postgres', // 你要连接的数据库名称
      entities: [Product], // 列出所有需要 TypeORM 管理的实体类
      synchronize: true, // 开发环境下可以设为 true，它会自动根据实体创建数据库表（生产环境建议设为 false）
      // 其他 TypeORM 配置选项...
      // 例如，如果你想使用连接池:
      // extra: {
      //   connectionLimit: 10,
      // },
      // logging: true, // 可以在控制台打印 SQL 查询语句
    }),
    ProductsModule, // 确保 ProductsModule 也被导入
  ],
})
export class AppModule {}
