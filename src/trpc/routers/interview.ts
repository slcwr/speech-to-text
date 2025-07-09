import { router, procedure } from '../trpc';
import { 
  createInterviewSessionSchema,
  getSessionSchema,
  interviewSessionResponseSchema,
  questionResponseSchema,
  answerResponseSchema,
  getQuestionsSchema,
  createQuestionSchema,
  createAnswerSchema,
  updateAnswerSchema
} from '../../shared/schemas';
import { InterviewSession } from '../../database/entities/interview-session.entity';
import { InterviewQuestion } from '../../database/entities/interview-question.entity';
import { InterviewAnswer } from '../../database/entities/interview-answer.entity';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const interviewRouter = router({
  // セッション管理
  createSession: procedure
    .input(createInterviewSessionSchema)
    .output(interviewSessionResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const sessionRepository = ctx.db.getRepository(InterviewSession);
      
      const session = sessionRepository.create({
        user_id: input.user_id,
        skill_sheet_id: input.skill_sheet_id,
        session_status: 'pending',
      });
      
      const savedSession = await sessionRepository.save(session);
      return savedSession;
    }),

  getSession: procedure
    .input(getSessionSchema)
    .output(interviewSessionResponseSchema)
    .query(async ({ input, ctx }) => {
      const sessionRepository = ctx.db.getRepository(InterviewSession);
      
      const session = await sessionRepository.findOne({
        where: { id: input.session_id }
      });
      
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Interview session not found',
        });
      }
      
      return session;
    }),

  startSession: procedure
    .input(getSessionSchema)
    .output(interviewSessionResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const sessionRepository = ctx.db.getRepository(InterviewSession);
      
      const session = await sessionRepository.findOne({
        where: { id: input.session_id }
      });
      
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Interview session not found',
        });
      }
      
      session.session_status = 'in_progress';
      session.started_at = new Date();
      
      const updatedSession = await sessionRepository.save(session);
      return updatedSession;
    }),

  completeSession: procedure
    .input(getSessionSchema)
    .output(interviewSessionResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const sessionRepository = ctx.db.getRepository(InterviewSession);
      
      const session = await sessionRepository.findOne({
        where: { id: input.session_id }
      });
      
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Interview session not found',
        });
      }
      
      session.session_status = 'completed';
      session.completed_at = new Date();
      
      const updatedSession = await sessionRepository.save(session);
      return updatedSession;
    }),

  // 質問管理
  createQuestion: procedure
    .input(createQuestionSchema)
    .output(questionResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const questionRepository = ctx.db.getRepository(InterviewQuestion);
      
      const question = questionRepository.create(input);
      const savedQuestion = await questionRepository.save(question);
      
      return savedQuestion;
    }),

  getQuestions: procedure
    .input(getQuestionsSchema)
    .output(z.array(questionResponseSchema))
    .query(async ({ input, ctx }) => {
      const questionRepository = ctx.db.getRepository(InterviewQuestion);
      
      const questions = await questionRepository.find({
        where: { session_id: input.session_id },
        order: { question_order: 'ASC' }
      });
      
      return questions;
    }),

  getQuestionsByType: procedure
    .input(z.object({
      session_id: z.string().uuid(),
      question_type: z.enum(['self_introduction', 'motivation', 'technical', 'reverse']),
    }))
    .output(z.array(questionResponseSchema))
    .query(async ({ input, ctx }) => {
      const questionRepository = ctx.db.getRepository(InterviewQuestion);
      
      const questions = await questionRepository.find({
        where: { 
          session_id: input.session_id,
          question_type: input.question_type
        },
        order: { question_order: 'ASC' }
      });
      
      return questions;
    }),

  // 回答管理
  createAnswer: procedure
    .input(createAnswerSchema)
    .output(answerResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const answerRepository = ctx.db.getRepository(InterviewAnswer);
      
      const answer = answerRepository.create({
        question_id: input.question_id,
        answer_data: input.answer_data,
        answer_status: 'in_progress',
      });
      
      const savedAnswer = await answerRepository.save(answer);
      return savedAnswer;
    }),

  updateAnswer: procedure
    .input(updateAnswerSchema)
    .output(answerResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const answerRepository = ctx.db.getRepository(InterviewAnswer);
      
      const answer = await answerRepository.findOne({
        where: { id: input.answer_id }
      });
      
      if (!answer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Answer not found',
        });
      }
      
      // 部分更新
      if (input.answer_data) {
        answer.answer_data = { ...answer.answer_data, ...input.answer_data };
      }
      
      if (input.answer_status) {
        answer.answer_status = input.answer_status;
        if (input.answer_status === 'completed') {
          answer.completed_at = new Date();
        }
      }
      
      const updatedAnswer = await answerRepository.save(answer);
      return updatedAnswer;
    }),

  getAnswerByQuestionId: procedure
    .input(z.object({ question_id: z.string().uuid() }))
    .output(answerResponseSchema.nullable())
    .query(async ({ input, ctx }) => {
      const answerRepository = ctx.db.getRepository(InterviewAnswer);
      
      const answer = await answerRepository.findOne({
        where: { question_id: input.question_id }
      });
      
      return answer || null;
    }),

  getAnswersBySessionId: procedure
    .input(z.object({ session_id: z.string().uuid() }))
    .output(z.array(answerResponseSchema))
    .query(async ({ input, ctx }) => {
      const answerRepository = ctx.db.getRepository(InterviewAnswer);
      
      const answers = await answerRepository
        .createQueryBuilder('answer')
        .innerJoin('answer.question', 'question')
        .where('question.session_id = :session_id', { session_id: input.session_id })
        .orderBy('question.question_order', 'ASC')
        .getMany();
      
      return answers;
    }),
});