import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class GeneratePdfReportInput {
  @Field(() => ID, { description: 'Report ID for which to generate PDF' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  reportId: string;
}