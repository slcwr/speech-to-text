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
import { GenerateEvaluationReportInput } from './dto/generate-evaluation-report.input';
import { EvaluationReportResponse } from './dto/evaluation-report.response';
import { GeneratePdfReportInput } from './dto/generate-pdf-report.input';
import { PdfReportResponse } from './dto/pdf-report.response';
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
    return this.interviewService.completeAnswer(
      user.id,
      input.sessionId,
      input.questionId,
    );
  }

  @Mutation(() => EvaluationReportResponse, { name: 'generateEvaluationReport' })
  async generateEvaluationReport(
    @Args('input') input: GenerateEvaluationReportInput,
    @CurrentUser() user: User,
  ): Promise<EvaluationReportResponse> {
    return this.interviewService.generateEvaluationReport(input.sessionId);
  }

  @Query(() => EvaluationReportResponse, { name: 'getEvaluationReport' })
  async getEvaluationReport(
    @Args('reportId') reportId: string,
    @CurrentUser() user: User,
  ): Promise<EvaluationReportResponse> {
    return this.interviewService.getEvaluationReport(reportId);
  }

  @Query(() => [EvaluationReportResponse], { name: 'getReportsBySession' })
  async getReportsBySession(
    @Args('sessionId') sessionId: string,
    @CurrentUser() user: User,
  ): Promise<EvaluationReportResponse[]> {
    return this.interviewService.getReportsBySession(sessionId);
  }

  @Mutation(() => PdfReportResponse, { name: 'generatePdfReport' })
  async generatePdfReport(
    @Args('input') input: GeneratePdfReportInput,
    @CurrentUser() user: User,
  ): Promise<PdfReportResponse> {
    return this.interviewService.generatePdfReport(input.reportId);
  }

  @Subscription(() => AudioTranscriptionSubscriptionResponse, {
    name: 'audioTranscription',
    description: 'リアルタイム音声転写結果を受信する',
  })
  audioTranscription(
    @Args('sessionId') sessionId: string,
  ) {
    return this.wsSubscriptions.createAudioTranscriptionSubscription(sessionId);
  }
}