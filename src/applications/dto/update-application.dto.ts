import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator'
import { ApplicationStatus } from '../entities/application.entity'

export class ApproveApplicationDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus

  @IsString()
  @IsOptional()
  remark?: string

  // 审批人ID（建议从token中获取）
  @IsNumber()
  @IsOptional()
  approverId?: number
}

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  reason?: string

  @IsNumber()
  @IsOptional()
  amount?: number

  @IsString()
  @IsOptional()
  startTime?: string

  @IsString()
  @IsOptional()
  endTime?: string

  @IsNumber()
  @IsOptional()
  duration?: number
}
