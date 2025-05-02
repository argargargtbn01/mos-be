import { IsNotEmpty, IsOptional, IsString, IsInt, IsObject } from 'class-validator';
import { Department } from 'src/department/entities/department.entity';

export class CreateBotDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  condensePrompt?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsObject()
  configurations?: any;

  @IsOptional()
  @IsObject()
  condenseConfigurations?: any;

  @IsOptional()
  @IsObject()
  dataSourceIds?: any;

  @IsOptional()
  @IsString()
  needAssignPrompt?: string;

  @IsOptional()
  @IsString()
  agentAssignMessage?: string;

  @IsOptional()
  @IsString()
  noAgentAvailableMessage?: string;

  @IsOptional()
  @IsString()
  systemTimeoutServiceMessage?: string;

  @IsOptional()
  @IsString()
  ratingMessage?: string;

  @IsOptional()
  @IsString()
  afterHourMessage?: string;

  @IsOptional()
  department?: Department;
}
