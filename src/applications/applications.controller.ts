import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApproveApplicationDto, UpdateApplicationDto } from './dto/update-application.dto'
import { ApplicationType } from './entities/application.entity'

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // 创建申请
  @Post()
  create(@Body() createDto: CreateApplicationDto) {
    return this.applicationsService.create(createDto)
  }

  // 获取所有申请（支持分页和筛选）
  @Get()
  findAll(@Query() query: any) {
    return this.applicationsService.findAll(query)
  }

  // 获取费用申请列表
  @Get('expense')
  findExpense(@Query() query: any) {
    return this.applicationsService.findAll({
      ...query,
      type: ApplicationType.EXPENSE
    })
  }

  // 获取请假申请列表
  @Get('leave')
  findLeave(@Query() query: any) {
    return this.applicationsService.findAll({
      ...query,
      type: ApplicationType.LEAVE
    })
  }

  // 获取加班申请列表
  @Get('overtime')
  findOvertime(@Query() query: any) {
    return this.applicationsService.findAll({
      ...query,
      type: ApplicationType.OVERTIME
    })
  }

  // 获取待审批列表
  @Get('pending')
  findPending(@Query() query: any) {
    return this.applicationsService.findPending(query)
  }

  // 获取申请详情
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(+id)
  }

  // 更新申请
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateApplicationDto) {
    return this.applicationsService.update(+id, updateDto)
  }

  // 审批申请
  @Put(':id/approve')
  approve(@Param('id') id: string, @Body() approveDto: ApproveApplicationDto) {
    return this.applicationsService.approve(+id, approveDto)
  }

  // 撤回申请
  @Put(':id/withdraw')
  withdraw(@Param('id') id: string) {
    return this.applicationsService.withdraw(+id)
  }

  // 删除申请
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id)
  }
}
