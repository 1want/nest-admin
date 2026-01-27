import { IsString, IsOptional, MaxLength } from 'class-validator'

export class CreateSoftwareDto {
  @IsString()
  @MaxLength(255)
  name: string

  @IsString()
  @MaxLength(50)
  version: string

  @IsString()
  @IsOptional()
  features?: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  testDevice?: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  testSystem?: string
}
