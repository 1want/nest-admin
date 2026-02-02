import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Application, ApprovalRecord, ApplicationType, ApplicationStatus } from './entities/application.entity'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApproveApplicationDto, UpdateApplicationDto } from './dto/update-application.dto'
import { User } from '../users/entities/user.entity'

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(ApprovalRecord)
    private approvalRecordRepository: Repository<ApprovalRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // 创建申请（支持多级审批配置）
  async create(createDto: CreateApplicationDto) {
    const { applicantId, totalLevels = 1, approvers = [], ...data } = createDto

    const application = this.applicationRepository.create({
      ...data,
      totalLevels,
      currentLevel: 1,
      status: totalLevels > 1 ? ApplicationStatus.IN_PROGRESS : ApplicationStatus.PENDING
    })

    // 关联申请人
    if (applicantId) {
      const applicant = await this.userRepository.findOneBy({ id: applicantId })
      if (applicant) {
        application.applicant = applicant
      }
    }

    // 保存申请单
    const savedApplication = await this.applicationRepository.save(application)

    // 创建审批记录（多级审批）
    if (approvers.length > 0) {
      const records: ApprovalRecord[] = []
      for (const approverConfig of approvers) {
        const record = this.approvalRecordRepository.create({
          application: savedApplication,
          level: approverConfig.level,
          status: ApplicationStatus.PENDING
        })

        // 关联审批人
        const approver = await this.userRepository.findOneBy({
          id: approverConfig.approverId
        })
        if (approver) {
          record.approver = approver
        }

        records.push(record)
      }
      await this.approvalRecordRepository.save(records)
    } else {
      // 如果没有指定审批人，创建默认的审批记录
      for (let level = 1; level <= totalLevels; level++) {
        const record = this.approvalRecordRepository.create({
          application: savedApplication,
          level,
          status: ApplicationStatus.PENDING
        })
        await this.approvalRecordRepository.save(record)
      }
    }

    return this.findOne(savedApplication.id)
  }

  // 分页查询（支持按类型、状态筛选）
  async findAll(query: {
    pageNum?: number
    pageSize?: number
    type?: ApplicationType
    status?: ApplicationStatus
    title?: string
  }) {
    const { pageNum = 1, pageSize = 10, type, status, title } = query
    const skip = (pageNum - 1) * pageSize

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (title) where.title = Like(`%${title}%`)

    const [list, total] = await this.applicationRepository.findAndCount({
      where,
      skip,
      take: +pageSize,
      order: { createTime: 'DESC' },
      relations: ['applicant', 'approvalRecords', 'approvalRecords.approver']
    })

    // 格式化返回数据
    const formattedList = list.map(item => this.formatApplication(item))

    return { data: formattedList, total, pageNum: +pageNum, pageSize: +pageSize }
  }

  // 获取待审批列表（当前用户可审批的）
  async findPending(query: { pageNum?: number; pageSize?: number; approverId?: number }) {
    const { pageNum = 1, pageSize = 10, approverId } = query
    const skip = (pageNum - 1) * pageSize

    // 查询所有待审批或审批中的申请
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.approvalRecords', 'records')
      .leftJoinAndSelect('records.approver', 'approver')
      .where('application.status IN (:...statuses)', {
        statuses: [ApplicationStatus.PENDING, ApplicationStatus.IN_PROGRESS]
      })

    // 如果指定了审批人，只查询该审批人需要审批的（当前层级）
    if (approverId) {
      queryBuilder
        .andWhere('records.level = application.currentLevel')
        .andWhere('records.status = :recordStatus', {
          recordStatus: ApplicationStatus.PENDING
        })
        .andWhere('records.approver.id = :approverId', { approverId })
    }

    const [list, total] = await queryBuilder
      .orderBy('application.createTime', 'DESC')
      .skip(skip)
      .take(+pageSize)
      .getManyAndCount()

    const formattedList = list.map(item => this.formatApplication(item))

    return { data: formattedList, total, pageNum: +pageNum, pageSize: +pageSize }
  }

  // 获取单个申请详情
  async findOne(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['applicant', 'approvalRecords', 'approvalRecords.approver']
    })
    if (!application) {
      throw new NotFoundException(`Application #${id} not found`)
    }
    return this.formatApplication(application)
  }

  // 审批申请（支持多级审批）
  async approve(id: number, approveDto: ApproveApplicationDto) {
    const { status, remark, approverId } = approveDto

    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['approvalRecords', 'approvalRecords.approver']
    })

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`)
    }

    if (application.status !== ApplicationStatus.PENDING && application.status !== ApplicationStatus.IN_PROGRESS) {
      throw new BadRequestException('该申请已审批完成，无法再次审批')
    }

    // 找到当前层级的审批记录
    const currentRecord = application.approvalRecords.find(r => r.level === application.currentLevel)

    if (!currentRecord) {
      throw new BadRequestException('未找到当前层级的审批记录')
    }

    // 更新当前层级的审批记录
    currentRecord.status = status
    currentRecord.remark = remark || ''
    currentRecord.approvalTime = new Date()

    if (approverId) {
      const approver = await this.userRepository.findOneBy({ id: approverId })
      if (approver) {
        currentRecord.approver = approver
      }
    }

    await this.approvalRecordRepository.save(currentRecord)

    // 处理审批结果
    if (status === ApplicationStatus.REJECTED) {
      // 驳回：直接更新申请状态为已驳回
      application.status = ApplicationStatus.REJECTED
    } else if (status === ApplicationStatus.APPROVED) {
      // 通过：检查是否还有下一级审批
      if (application.currentLevel < application.totalLevels) {
        // 还有下一级，更新当前层级
        application.currentLevel += 1
        application.status = ApplicationStatus.IN_PROGRESS
      } else {
        // 已是最后一级，审批完成
        application.status = ApplicationStatus.APPROVED
      }
    }

    await this.applicationRepository.save(application)

    return this.findOne(id)
  }

  // 更新申请（仅允许修改待审批状态的申请）
  async update(id: number, updateDto: UpdateApplicationDto) {
    const application = await this.applicationRepository.findOne({
      where: { id }
    })

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`)
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('只能修改待审批状态的申请')
    }

    this.applicationRepository.merge(application, updateDto)
    await this.applicationRepository.save(application)

    return this.findOne(id)
  }

  // 删除申请
  async remove(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['approvalRecords']
    })

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`)
    }

    // 先删除审批记录
    if (application.approvalRecords?.length) {
      await this.approvalRecordRepository.remove(application.approvalRecords)
    }

    return this.applicationRepository.remove(application)
  }

  // 撤回申请
  async withdraw(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['approvalRecords']
    })

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`)
    }

    if (application.status === ApplicationStatus.APPROVED || application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('已完成的申请无法撤回')
    }

    // 重置状态
    application.status = ApplicationStatus.PENDING
    application.currentLevel = 1

    // 重置所有审批记录
    for (const record of application.approvalRecords) {
      record.status = ApplicationStatus.PENDING
      record.remark = ''
      record.approvalTime = undefined as any
    }

    await this.approvalRecordRepository.save(application.approvalRecords)
    await this.applicationRepository.save(application)

    return this.findOne(id)
  }

  // 格式化申请数据
  private formatApplication(application: Application) {
    const { applicant, approvalRecords, ...rest } = application

    return {
      ...rest,
      applicantId: applicant?.id,
      applicantName: applicant?.nickName,
      approvalRecords: approvalRecords
        ?.sort((a, b) => a.level - b.level)
        .map(record => ({
          id: record.id,
          level: record.level,
          status: record.status,
          remark: record.remark,
          approvalTime: record.approvalTime,
          approverId: record.approver?.id,
          approverName: record.approver?.nickName
        }))
    }
  }
}
