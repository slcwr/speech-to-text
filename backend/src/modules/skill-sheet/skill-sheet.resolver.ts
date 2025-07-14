import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { SkillSheetService } from './skill-sheet.service';
import { SkillSheet } from '../../database/entities/skill-sheet.entity';
import { InterviewSession } from '../../database/entities/interview-session.entity';

@Resolver()
export class SkillSheetResolver {
  constructor(private skillSheetService: SkillSheetService) {}

  @Query(() => [SkillSheet])
  @UseGuards(GqlAuthGuard)
  async getMySkillSheets(@Context() context): Promise<SkillSheet[]> {
    const userId = context.req.user.id;
    return this.skillSheetService.getSkillSheetsByUserId(userId);
  }

  @Query(() => SkillSheet, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async getSkillSheet(@Args('id') id: string): Promise<SkillSheet> {
    return this.skillSheetService.getSkillSheetById(id);
  }

  @Query(() => InterviewSession, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async getLatestSession(@Context() context): Promise<InterviewSession | null> {
    const userId = context.req.user.id;
    return this.skillSheetService.getLatestSessionByUserId(userId);
  }
}