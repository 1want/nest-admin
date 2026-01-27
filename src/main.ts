import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common' // 导入 ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // 全局启用 ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除 DTO 中未定义的属性
      transform: true // 自动转换传入数据类型 (例如 string -> number)
    })
  )
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
