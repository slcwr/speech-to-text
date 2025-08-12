import { ObjectType, Field, Int } from '@nestjs/graphql';
import { InterviewQuestionResponse } from './interview-question.response';

@ObjectType()
export class InterviewProgress {
  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  remaining: number;
}

@ObjectType()
export class CompleteAnswerResponse {
  @Field(() => InterviewQuestionResponse, { nullable: true })
  nextQuestion?: InterviewQuestionResponse;

  @Field(() => Boolean)
  isInterviewComplete: boolean;

  @Field(() => String)
  message: string;

  @Field(() => InterviewProgress)
  progress: InterviewProgress;
}