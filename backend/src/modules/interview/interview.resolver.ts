import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, InterviewSession } from '../../database/entities';
import { StartInterviewInput } from './dto/start-interview.input';
import { StartInterviewResponse } from './dto/start-interview.response';

@Resolver(() => InterviewSession)
@UseGuards(GqlAuthGuard)
export class InterviewResolver {
  constructor(private readonly interviewService: InterviewService) {}

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
}