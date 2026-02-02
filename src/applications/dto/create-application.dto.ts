import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsString,
  IsArray,
  ValidateNested,
  Min
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApplicationType } from '../entities/application.entity'

// 审批人配置（用于多级审批）
export class ApproverConfig {
  @IsNumber()
  level: number

  @IsNumber()
  approverId: number
}

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  @IsNotEmpty()
  type: ApplicationType

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  reason?: string

  // 费用申请
  @IsNumber()
  @IsOptional()
  amount?: number

  // 请假/加班
  @IsDateString()
  @IsOptional()
  startTime?: string

  @IsDateString()
  @IsOptional()
  endTime?: string

  @IsNumber()
  @IsOptional()
  duration?: number

  // 申请人ID
  @IsNumber()
  @IsOptional()
  applicantId?: number

  // 多级审批配置：审批层级数，默认为1
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalLevels?: number

  // 多级审批配置：各层级审批人
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproverConfig)
  @IsOptional()
  approvers?: ApproverConfig[]
}
