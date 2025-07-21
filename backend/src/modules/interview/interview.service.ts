import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  User,
  AnswerStatus,
  SessionStatus,
} from '../../database/entities';
import { StartInterviewResponse } from './dto/start-interview.response';


@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
  ) {}

  async startSession(sessionId: string, user_id: string): Promise<StartInterviewResponse> {
    // セッションを取得
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id },
      relations: ['skillSheet'],
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    // ステータスチェック
    if (session.session_status !== SessionStatus.PENDING && session.session_status !== SessionStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot start interview in ${session.session_status} status`);
    }

    // セッションのステータスを更新
    session.session_status = SessionStatus.IN_PROGRESS;
    session.started_at = new Date();
    await this.sessionRepository.save(session);

    // 質問を取得（orderNumber順）
    const questions = await this.questionRepository.find({
      where: { session_id: sessionId },
      order: { question_order: 'ASC' },
    });

    if (!questions || questions.length === 0) {
      throw new BadRequestException('No questions found for this session');
    }

    // 最初の質問を取得
    const currentQuestion = questions[0];

    // 最初の質問の回答レコードを作成
    const answer = this.answerRepository.create({
      question_id: currentQuestion.id,
      answer_status: AnswerStatus.IN_PROGRESS,
    });
    await this.answerRepository.save(answer);

    return {
      sessionId: session.id,
      status: session.session_status,
      currentQuestion: {
        id: currentQuestion.id,
        sessionId: currentQuestion.session_id,
        question: currentQuestion.question_data.text,
        orderNumber: currentQuestion.question_order,
        metadata: currentQuestion.question_data.metadata,
        createdAt: currentQuestion.created_at,
        updatedAt: currentQuestion.created_at,
      },
      allQuestions: questions.map(q => ({
        id: q.id,
        sessionId: q.session_id,
        question: q.question_data.text,
        orderNumber: q.question_order,
        metadata: q.question_data.metadata,
        createdAt: q.created_at,
        updatedAt: q.created_at,
      })),
      startedAt: session.started_at,
    };
  }

  async getSessionStatus(sessionId: string, user_id: string): Promise<InterviewSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id },
      relations: ['skillSheet', 'questions', 'questions.answer'],
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    return session;
  }
}