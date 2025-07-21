import { ObjectType, Field, ID } from '@nestjs/graphql';
import { InterviewQuestionResponse } from './interview-question.response';

@ObjectType()
export class StartInterviewResponse {
  @Field(() => ID)
  sessionId: string;

  @Field()
  status: string;

  @Field(() => InterviewQuestionResponse)
  currentQuestion: InterviewQuestionResponse;

  @Field(() => [InterviewQuestionResponse])
  allQuestions: InterviewQuestionResponse[];

  @Field()
  startedAt: Date;
}