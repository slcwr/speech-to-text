import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class InterviewQuestionResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  sessionId: string;

  @Field()
  question: string;

  @Field(() => Int)
  orderNumber: number;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}