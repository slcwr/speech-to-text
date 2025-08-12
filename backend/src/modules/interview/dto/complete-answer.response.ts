import { ObjectType, Field } from '@nestjs/graphql';
import { InterviewQuestionResponse } from './interview-question.response';

@ObjectType()
export class CompleteAnswerResponse {
  @Field(() => InterviewQuestionResponse, { nullable: true })
  nextQuestion?: InterviewQuestionResponse;

  @Field(() => Boolean)
  isInterviewComplete: boolean;

  @Field(() => String)
  message: string;
}