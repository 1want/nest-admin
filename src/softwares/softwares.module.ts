import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SoftwaresService } from "./softwares.service";
import { SoftwaresController } from "./softwares.controller";
import { Software } from "./entities/software.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Software])],
  controllers: [SoftwaresController],
  providers: [SoftwaresService],
})
export class SoftwaresModule {}
