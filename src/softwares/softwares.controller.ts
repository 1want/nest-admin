import { Controller, Get, Post, Body, Put, Param, Delete, Query } from "@nestjs/common";
import { SoftwaresService } from "./softwares.service";
import { CreateSoftwareDto } from "./dto/create-software.dto";
import { UpdateSoftwareDto } from "./dto/update-software.dto";

@Controller("softwares")
export class SoftwaresController {
  constructor(private readonly softwaresService: SoftwaresService) {}

  @Post()
  create(@Body() createSoftwareDto: CreateSoftwareDto) {
    return this.softwaresService.create(createSoftwareDto);
  }

  @Get()
  findAll(@Query() query: any) {
    // 简单的搜索支持，根据实际前端参数调整
    // 前端通常传 pageNum, pageSize, name 等
    return this.softwaresService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.softwaresService.findOne(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateSoftwareDto: UpdateSoftwareDto) {
    return this.softwaresService.update(+id, updateSoftwareDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    // 支持批量删除，如果前端传的是 1,2,3
    if (id.includes(",")) {
      const ids = id.split(",").map((item) => +item);
      return this.softwaresService.removeMany(ids);
    }
    return this.softwaresService.remove(+id);
  }
}
