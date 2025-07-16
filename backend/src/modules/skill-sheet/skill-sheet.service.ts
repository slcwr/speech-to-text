import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillSheet, AnalysisStatus } from '../../database/entities/skill-sheet.entity';
import { InterviewSession, SessionStatus } from '../../database/entities/interview-session.entity';
import { InterviewQuestion, QuestionType } from '../../database/entities/interview-question.entity';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class SkillSheetService {
  private readonly logger = new Logger(SkillSheetService.name);
  
  constructor(
    @InjectRepository(SkillSheet)
    private skillSheetRepository: Repository<SkillSheet>,
    @InjectRepository(InterviewSession)
    private interviewSessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewQuestion)
    private interviewQuestionRepository: Repository<InterviewQuestion>,
    private geminiService: GeminiService,
  ) {}

  async uploadSkillSheet(userId: string, filePath: string, fileName: string): Promise<SkillSheet> {
    // Create skill sheet record
    const skillSheet = this.skillSheetRepository.create({
      user_id: userId,
      file_path: filePath,
      file_name: fileName,
      skill_data: {
        technical_skills: [],
        experience_years: 0,
        projects: [],
        strengths: [],
        weaknesses: [],
        problem_solving: {
          approach: '',
          examples: [],
          methodologies: [],
          collaboration_style: '',
        },
      },
      analysis_status: AnalysisStatus.PENDING,
    });

    const savedSkillSheet = await this.skillSheetRepository.save(skillSheet);

    // Create initial interview session
    const interviewSession = this.interviewSessionRepository.create({
      user_id: userId,
      skill_sheet_id: savedSkillSheet.id,
      session_status: SessionStatus.PENDING,
    });

    const savedSession = await this.interviewSessionRepository.save(interviewSession);

    // Start processing the skill sheet
    // In production, this should be handled by a queue/background job
    this.processSkillSheet(savedSkillSheet.id, savedSession.id).catch(error => {
      console.error('Error processing skill sheet:', error);
    });

    return savedSkillSheet;
  }

  async getSkillSheetsByUserId(userId: string): Promise<SkillSheet[]> {
    return this.skillSheetRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getSkillSheetById(id: string): Promise<SkillSheet> {
    const skillSheet = await this.skillSheetRepository.findOne({
      where: { id },
      relations: ['user', 'interviewSessions'],
    });

    if (!skillSheet) {
      throw new NotFoundException('Skill sheet not found');
    }

    return skillSheet;
  }

  async getLatestSessionByUserId(userId: string): Promise<InterviewSession | null> {
    return this.interviewSessionRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      relations: ['skillSheet'],
    });
  }

  async updateAnalysisStatus(id: string, status: AnalysisStatus): Promise<void> {
    await this.skillSheetRepository.update(id, { analysis_status: status });
  }

  async processSkillSheet(skillSheetId: string, sessionId: string): Promise<void> {
    try {
      // Get the skill sheet record
      const skillSheet = await this.skillSheetRepository.findOne({
        where: { id: skillSheetId },
      });

      if (!skillSheet) {
        throw new NotFoundException('Skill sheet not found');
      }

      // Update status to processing
      await this.skillSheetRepository.update(skillSheetId, {
        analysis_status: AnalysisStatus.PROCESSING,
      });

      // 1. Reading the file and calling GeminiService to analyze it
      const analysisResult = await this.geminiService.analyzeDocument(
        skillSheet.file_path,
        skillSheet.file_name.split('.').pop() || '',
      );

      // 2. Updating the skill_data field
      await this.skillSheetRepository.update(skillSheetId, {
        skill_data: analysisResult,
      });

      // 3. Generating interview questions
      const questions = await this.geminiService.generateQuestions(analysisResult);

      // 4. Save questions to InterviewQuestion entity
      const questionEntities: InterviewQuestion[] = [];
      let questionOrder = 1;

      // Add self introduction question
      questionEntities.push(
        this.interviewQuestionRepository.create({
          session_id: sessionId,
          question_type: QuestionType.SELF_INTRODUCTION,
          question_order: questionOrder++,
          question_data: {
            text: '自己紹介をお願いします。',
            metadata: {
              difficulty: 'easy',
              category: '自己紹介',
            },
          },
        }),
      );

      // Add technical questions
      for (const questionText of questions.technical_questions) {
        questionEntities.push(
          this.interviewQuestionRepository.create({
            session_id: sessionId,
            question_type: QuestionType.TECHNICAL,
            question_order: questionOrder++,
            question_data: {
              text: questionText,
              metadata: {
                difficulty: 'medium',
                category: '技術',
                based_on_skills: analysisResult.technical_skills,
              },
            },
          }),
        );
      }

      // Add motivation questions
      for (const questionText of questions.motivation_questions) {
        questionEntities.push(
          this.interviewQuestionRepository.create({
            session_id: sessionId,
            question_type: QuestionType.MOTIVATION,
            question_order: questionOrder++,
            question_data: {
              text: questionText,
              metadata: {
                difficulty: 'medium',
                category: '志望動機',
              },
            },
          }),
        );
      }

      // Save all questions
      await this.interviewQuestionRepository.save(questionEntities);

      // 5. Updating status to COMPLETED
      await this.skillSheetRepository.update(skillSheetId, {
        analysis_status: AnalysisStatus.COMPLETED,
      });

    } catch (error) {
      // Update status to failed on error
      await this.skillSheetRepository.update(skillSheetId, {
        analysis_status: AnalysisStatus.FAILED,
      });
      
      // Log detailed error for debugging
      this.logger.error(`Failed to process skill sheet ${skillSheetId}: ${error.message}`, error);
      
      // If it's an API overload error, we might want to retry later
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        this.logger.warn('Gemini API is overloaded. Consider implementing a retry queue.');
      }
      
      throw error;
    }
  }
}