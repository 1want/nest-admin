import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module"; // 导入主模块
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Software } from "./softwares/entities/software.entity"; // 导入 Software 实体
import { faker } from "@faker-js/faker"; // 导入 faker

async function bootstrap() {
  // 创建一个独立的 NestJS 应用上下文，不会启动 HTTP 服务器
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // 获取 Software Repository
  const softwareRepository = appContext.get<Repository<Software>>(getRepositoryToken(Software));

  console.log("Starting seeding process...");

  const softwaresToSeed: Partial<Software>[] = []; // 使用 Partial<Software> 或直接创建对象
  const numberOfSoftwares = 20; // 要创建的软件数量

  for (let i = 0; i < numberOfSoftwares; i++) {
    const software = {
      name: faker.commerce.productName(),
      version: faker.system.semver(),
      features: faker.lorem.sentences(2),
      testDevice: faker.helpers.arrayElement([
        "iPhone 13",
        "iPhone 14 Pro",
        "Samsung Galaxy S22",
        "Pixel 7",
        "Xiaomi 13",
      ]),
      testSystem: faker.helpers.arrayElement([
        "iOS 16.0",
        "iOS 15.5",
        "Android 13",
        "Android 12",
        "MIUI 14",
      ]),
    };
    softwaresToSeed.push(software);
  }

  try {
    // 使用 insert 批量插入数据
    await softwareRepository.insert(softwaresToSeed);
    console.log(`Successfully seeded ${numberOfSoftwares} softwares.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // 关闭应用上下文
    await appContext.close();
    console.log("Seeding process finished.");
  }
}

bootstrap();
