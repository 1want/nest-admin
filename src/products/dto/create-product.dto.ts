import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // 图片 URL 可以是可选的
  image?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0) // 价格不能为负数
  price: number;

  @IsNumber()
  @Min(0) // 库存不能为负数
  stock: number;

  @IsString()
  @IsOptional() // 简介可以是可选的
  description?: string;
}
