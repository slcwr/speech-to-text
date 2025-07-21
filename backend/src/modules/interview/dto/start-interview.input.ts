import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class StartInterviewInput {
  @Field(() => ID)
  @IsUUID()
  sessionId: string;
}