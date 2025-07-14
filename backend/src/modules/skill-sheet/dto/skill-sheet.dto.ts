import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AnalysisStatus } from '../../../database/entities/skill-sheet.entity';

@InputType()
export class UploadSkillSheetInput {
  @Field()
  @IsString()
  fileName: string;

  @Field()
  @IsString()
  filePath: string;
}

@ObjectType()
export class SkillSheetResponse {
  @Field()
  id: string;

  @Field()
  fileName: string;

  @Field()
  filePath: string;

  @Field(() => String)
  analysisStatus: AnalysisStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}