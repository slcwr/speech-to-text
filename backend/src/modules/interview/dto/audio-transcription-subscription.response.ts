import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AudioTranscriptionSubscriptionResponse {
  @Field(() => String)
  sessionId: string;

  @Field(() => String)
  questionId: string;

  @Field(() => String)
  transcription: string;

  @Field(() => String)
  timestamp: string;

  @Field(() => String)
  userId: string;
}