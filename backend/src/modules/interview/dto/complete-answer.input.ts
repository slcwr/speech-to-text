import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CompleteAnswerInput {
  @Field(() => String, { nullable: false, description: 'Session ID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @Field(() => String, { nullable: false, description: 'Question ID' })
  @IsNotEmpty()
  @IsString()
  questionId: string;
}