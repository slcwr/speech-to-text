import { Resolver, Mutation, Args, Query, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, InterviewSession } from '../../database/entities';
import { StartInterviewInput } from './dto/start-interview.input';
import { StartInterviewResponse } from './dto/start-interview.response';
import { WebSocketSubscriptionsService } from '../audio/websocket-subscriptions.service';
import { CompleteAnswerInput } from './dto/complete-answer.input';
import { CompleteAnswerResponse } from './dto/complete-answer.response';
import { AudioTranscriptionSubscriptionResponse } from './dto/audio-transcription-subscription.response';

@Resolver(() => InterviewSession)
@UseGuards(GqlAuthGuard)
export class InterviewResolver {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly wsSubscriptions: WebSocketSubscriptionsService,
  ) {}

  @Mutation(() => StartInterviewResponse, { name: 'startInterview' })
  async startInterview(
    @Args('input') input: StartInterviewInput,
    @CurrentUser() user: User,
  ): Promise<StartInterviewResponse> {
    return this.interviewService.startSession(input.sessionId, user.id);
  }

  @Query(() => InterviewSession, { name: 'interviewSession' })
  async getInterviewSession(
    @Args('sessionId') sessionId: string,
    @CurrentUser() user: User,
  ): Promise<InterviewSession> {
    return this.interviewService.getSessionStatus(sessionId, user.id);
  }

  @Mutation(() => CompleteAnswerResponse, { name: 'completeAnswer' })
  async completeAnswer(
    @Args('input', { type: () => CompleteAnswerInput }) input: CompleteAnswerInput,
    @CurrentUser() user: User,
  ): Promise<CompleteAnswerResponse> {
    console.log('=== GraphQL completeAnswer resolver called ===');
    console.log('User ID:', user?.id);
    console.log('Args received - raw input:', input);
    console.log('Input is null?', input === null);
    console.log('Input is undefined?', input === undefined);
    console.log('Input type:', typeof input);
    
    // 入力が存在する場合の詳細ログ
    if (input) {
      console.log('Args sessionId:', input.sessionId, '(type:', typeof input.sessionId, ')');
      console.log('Args questionId:', input.questionId, '(type:', typeof input.questionId, ')');
      console.log('Input object stringified:', JSON.stringify(input, null, 2));
      console.log('Input object keys:', Object.keys(input));
      console.log('Input object values:', Object.values(input));
      console.log('Input constructor:', input.constructor?.name);
      
      // プロパティの存在確認
      console.log('Has sessionId property?', 'sessionId' in input);
      console.log('Has questionId property?', 'questionId' in input);
      console.log('sessionId value check:', input.sessionId || 'UNDEFINED OR EMPTY');
      console.log('questionId value check:', input.questionId || 'UNDEFINED OR EMPTY');
    } else {
      console.log('INPUT IS NULL OR UNDEFINED!');
    }
    console.log('==================================================');
    
    // 値を直接取り出して渡す
    const sessionId = input?.sessionId;
    const questionId = input?.questionId;
    
    console.log('Passing to service - sessionId:', sessionId);
    console.log('Passing to service - questionId:', questionId);
    
    return this.interviewService.completeAnswer(
      user.id,
      sessionId,
      questionId,
    );
  }

  @Subscription(() => AudioTranscriptionSubscriptionResponse, {
    name: 'audioTranscription',
    description: 'リアルタイム音声転写結果を受信する',
  })
  audioTranscription(
    @Args('sessionId') sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.wsSubscriptions.createAudioTranscriptionSubscription(sessionId);
  }
}