import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products') // 定义数据库表名为 'products'
export class Product {
  @PrimaryGeneratedColumn() // 定义主键，自动增长
  id: number;

  @Column({ length: 255, comment: '商品名称' }) // 字符串类型，最大长度255
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '商品图片URL',
  }) // 字符串类型，允许为空
  image: string;

  @Column('decimal', { precision: 10, scale: 2, comment: '商品价格' }) // 使用 decimal 存储精确价格
  price: number;

  @Column({ type: 'int', comment: '库存数量' }) // 整数类型
  stock: number;

  @Column('text', { nullable: true, comment: '商品简介' }) // 文本类型，允许为空
  description: string;

  // 你可以根据需要添加其他列，例如创建时间和更新时间
  // @CreateDateColumn()
  // createdAt: Date;

  // @UpdateDateColumn()
  // updatedAt: Date;
}
