import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class GenerateEvaluationReportInput {
  @Field(() => ID, { description: 'Session ID for which to generate the evaluation report' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  sessionId: string;
}