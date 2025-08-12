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
import { AnswerData } from '../../database/entities/interview-answer.entity';
import { StartInterviewResponse } from './dto/start-interview.response';
import { CompleteAnswerResponse } from './dto/complete-answer.response';


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
      where: { sessionId: sessionId },
      order: { question_order: 'ASC', created_at: 'ASC' },
    });

    if (!questions || questions.length === 0) {
      throw new BadRequestException('No questions found for this session');
    }

    // 最初の質問を取得
    const currentQuestion = questions[0];

    // 最初の質問の回答レコードを作成（既に存在しない場合のみ）
    const existingAnswer = await this.answerRepository.findOne({
      where: { question_id: currentQuestion.id },
    });

    if (!existingAnswer) {
      const answer = this.answerRepository.create({
        question_id: currentQuestion.id,
        answer_data: {
          text: '',
          confidence_score: 0,
          transcription_segments: [],
          audio_metadata: {
            duration_seconds: 0,
            sample_rate: 0,
            channels: 0,
          },
          analysis: {
            key_points: [],
            sentiment: 'neutral',
            fluency_score: 0,
            problem_solving_indicators: [],
          },
        },
        answer_status: AnswerStatus.IN_PROGRESS,
      });
      await this.answerRepository.save(answer);
    }

    return {
      sessionId: session.id,
      status: session.session_status,
      currentQuestion: {
        id: currentQuestion.id,
        sessionId: currentQuestion.sessionId,
        question: currentQuestion.question_data.text,
        orderNumber: currentQuestion.question_order,
        metadata: currentQuestion.question_data.metadata,
        createdAt: currentQuestion.created_at,
        updatedAt: currentQuestion.created_at,
      },
      allQuestions: questions.map(q => ({
        id: q.id,
        sessionId: q.sessionId,
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

  async completeAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
  ): Promise<CompleteAnswerResponse> {
    console.log('completeAnswer called with:', { userId, sessionId, questionId });

    if (!sessionId || !questionId) {
      throw new BadRequestException('sessionId and questionId are required');
    }

    // 現在の質問を取得
    const currentQuestion = await this.questionRepository.findOne({
      where: { id: questionId, sessionId: sessionId },
    });

    if (!currentQuestion) {
      throw new NotFoundException('Question not found');
    }

    console.log('現在の質問:', {
      id: currentQuestion.id,
      order: currentQuestion.question_order,
      text: currentQuestion.question_data.text
    });

    // 回答を完了状態に更新
    const answer = await this.answerRepository.findOne({
      where: { question_id: questionId },
    });

    if (answer) {
      answer.answer_status = AnswerStatus.COMPLETED;
      answer.completed_at = new Date();
      await this.answerRepository.save(answer);
    }

    // 次の質問を取得（現在のセッションで作成日時が最も早いもの）
    const nextQuestion = await this.questionRepository.findOne({
      where: {
        sessionId: sessionId,
        question_order: currentQuestion.question_order + 1,
      },
      order: { created_at: 'ASC' }, // 同じorder番号の中で最も古く作成されたものを選択
    });

    // デバッグ: セッション内のすべての質問を確認
    const allQuestions = await this.questionRepository.find({
      where: { sessionId: sessionId },
      order: { question_order: 'ASC' }
    });
    
    console.log('DB検索条件:', {
      sessionId: sessionId,
      currentQuestionOrder: currentQuestion.question_order,
      nextQuestionOrder: currentQuestion.question_order + 1
    });
    
    console.log('セッション内のすべての質問:', allQuestions.map(q => ({
      id: q.id,
      order: q.question_order,
      text: q.question_data.text.substring(0, 50) + '...'
    })));

    console.log('次の質問検索:', {
      sessionId,
      searchingForOrder: currentQuestion.question_order + 1,
      currentQuestionId: currentQuestion.id
    });
    console.log("次の質問:", nextQuestion);

    // インタビューの完了判定
    const isInterviewComplete = !nextQuestion;

    if (isInterviewComplete) {
      // セッションの状態を完了に更新
      await this.sessionRepository.update(
        { id: sessionId },
        { 
          session_status: SessionStatus.COMPLETED,
          completed_at: new Date(),
        },
      );
    } else {
      // 次の質問の回答レコードが既に存在するか確認
      const existingAnswer = await this.answerRepository.findOne({
        where: { question_id: nextQuestion.id },
      });

      if (!existingAnswer) {
        // 存在しない場合のみ新規作成
        const nextAnswer = this.answerRepository.create({
          question_id: nextQuestion.id,
          answer_data: {
            text: '',
            confidence_score: 0,
            transcription_segments: [],
            audio_metadata: {
              duration_seconds: 0,
              sample_rate: 0,
              channels: 0,
            },
            analysis: {
              key_points: [],
              sentiment: 'neutral',
              fluency_score: 0,
              problem_solving_indicators: [],
            },
          },
          answer_status: AnswerStatus.IN_PROGRESS,
        });
        await this.answerRepository.save(nextAnswer);
      } else {
        // 既存のレコードをIN_PROGRESSに更新
        existingAnswer.answer_status = AnswerStatus.IN_PROGRESS;
        await this.answerRepository.save(existingAnswer);
      }
    }

    const result = {
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        sessionId: nextQuestion.sessionId,
        question: nextQuestion.question_data.text,
        orderNumber: nextQuestion.question_order,
        metadata: nextQuestion.question_data.metadata,
        createdAt: nextQuestion.created_at,
        updatedAt: nextQuestion.created_at,
      } : undefined,
      isInterviewComplete,
      message: isInterviewComplete 
        ? 'Interview completed successfully'
        : 'Answer completed, next question ready',
    };

    console.log('質問2の後確認:', result);
    return result;
  }
}