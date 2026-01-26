import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";
import { Software } from "./entities/software.entity";
import { CreateSoftwareDto } from "./dto/create-software.dto";
import { UpdateSoftwareDto } from "./dto/update-software.dto";

@Injectable()
export class SoftwaresService {
  constructor(
    @InjectRepository(Software)
    private softwareRepository: Repository<Software>,
  ) {}

  create(createSoftwareDto: CreateSoftwareDto) {
    const software = this.softwareRepository.create(createSoftwareDto);
    return this.softwareRepository.save(software);
  }

  async findAll(query: any) {
    const { pageNum = 1, pageSize = 10, name } = query;
    const skip = (pageNum - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }

    const [list, total] = await this.softwareRepository.findAndCount({
      where,
      skip,
      take: +pageSize,
      order: { id: "DESC" },
    });

    return {
      data: list,
      total,
      pageNum: +pageNum,
      pageSize: +pageSize,
    };
  }

  findOne(id: number) {
    return this.softwareRepository.findOneBy({ id });
  }

  update(id: number, updateSoftwareDto: UpdateSoftwareDto) {
    return this.softwareRepository.update(id, updateSoftwareDto);
  }

  remove(id: number) {
    return this.softwareRepository.delete(id);
  }

  removeMany(ids: number[]) {
    return this.softwareRepository.delete({ id: In(ids) });
  }
}
