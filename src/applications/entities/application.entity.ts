import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

// 申请类型枚举
export enum ApplicationType {
  EXPENSE = 'expense', // 费用申请
  LEAVE = 'leave', // 请假申请
  OVERTIME = 'overtime' // 加班申请
}

// 审批状态枚举
export enum ApplicationStatus {
  PENDING = 'pending', // 待审批
  IN_PROGRESS = 'in_progress', // 审批中（多级审批时使用）
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected' // 已驳回
}

@Entity('biz_application')
export class Application {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 20,
    comment: '申请类型'
  })
  type: ApplicationType

  @Column({ length: 200, comment: '申请标题' })
  title: string

  @Column({ type: 'text', nullable: true, comment: '申请原因/说明' })
  reason: string

  // 费用相关字段
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '金额'
  })
  amount: number

  // 请假/加班相关字段
  @Column({ type: 'timestamp', nullable: true, comment: '开始时间' })
  startTime: Date

  @Column({ type: 'timestamp', nullable: true, comment: '结束时间' })
  endTime: Date

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
    comment: '时长(小时)'
  })
  duration: number

  // 多级审批相关
  @Column({ default: 1, comment: '总审批层级数' })
  totalLevels: number

  @Column({ default: 0, comment: '当前审批层级' })
  currentLevel: number

  // 审批状态
  @Column({
    type: 'varchar',
    length: 20,
    default: ApplicationStatus.PENDING,
    comment: '审批状态'
  })
  status: ApplicationStatus

  // 申请人
  @ManyToOne(() => User, { eager: true })
  applicant: User

  // 审批记录（多级审批）
  @OneToMany(() => ApprovalRecord, record => record.application, {
    cascade: true,
    eager: true
  })
  approvalRecords: ApprovalRecord[]

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date
}

// 审批记录实体（用于多级审批）- 放在 Application 后面定义
@Entity('biz_approval_record')
export class ApprovalRecord {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Application, application => application.approvalRecords)
  application: Application

  @Column({ comment: '审批层级，从1开始' })
  level: number

  @Column({
    type: 'varchar',
    length: 20,
    default: ApplicationStatus.PENDING,
    comment: '审批状态'
  })
  status: ApplicationStatus

  @Column({ type: 'text', nullable: true, comment: '审批意见' })
  remark: string

  @ManyToOne(() => User, { nullable: true, eager: true })
  approver: User

  @Column({ type: 'timestamp', nullable: true, comment: '审批时间' })
  approvalTime: Date

  @CreateDateColumn()
  createTime: Date
}
