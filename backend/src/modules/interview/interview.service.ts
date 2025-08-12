import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  User,
  AnswerStatus,
  SessionStatus,
  SkillSheet,
} from '../../database/entities';
import { AnswerData } from '../../database/entities/interview-answer.entity';
import { EvaluationReport, RecommendationGrade } from '../../database/entities/evaluation-report.entity';
import { StartInterviewResponse } from './dto/start-interview.response';
import { CompleteAnswerResponse } from './dto/complete-answer.response';
import { EvaluationReportResponse } from './dto/evaluation-report.response';
import { PdfReportResponse } from './dto/pdf-report.response';
import { GeminiService } from '../gemini/gemini.service';
import { PdfService } from './pdf.service';


@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewQuestion)
    private questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(InterviewAnswer)
    private answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(EvaluationReport)
    private evaluationReportRepository: Repository<EvaluationReport>,
    @InjectRepository(SkillSheet)
    private skillSheetRepository: Repository<SkillSheet>,
    private geminiService: GeminiService,
    private pdfService: PdfService,
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

  /**
   * 面接完了の判定を行い、進捗情報を返却する
   */
  async checkInterviewCompletion(sessionId: string, currentQuestionId: string): Promise<{
    isComplete: boolean;
    progress: {
      completed: number;
      total: number;
      remaining: number;
    };
    nextQuestion?: InterviewQuestion;
  }> {
    // セッション内の全質問を取得（順序付き）
    const allQuestions = await this.questionRepository.find({
      where: { sessionId },
      order: { question_order: 'ASC' }
    });
    
    if (allQuestions.length === 0) {
      throw new NotFoundException('No questions found for this session');
    }
    
    // 現在の質問のインデックスを取得
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestionId);
    
    if (currentIndex === -1) {
      throw new NotFoundException('Current question not found in session');
    }
    
    // 次の質問があるかチェック
    const nextQuestion = allQuestions[currentIndex + 1] || null;
    const isComplete = !nextQuestion;
    
    // 完了した回答数をカウント（現在の質問までの回答をチェック）
    const questionsUpToCurrent = allQuestions.slice(0, currentIndex + 1);
    const questionIds = questionsUpToCurrent.map(q => q.id);
    
    const completedCount = await this.answerRepository.count({
      where: {
        question_id: In(questionIds),
        answer_status: AnswerStatus.COMPLETED
      }
    });
    
    console.log('面接完了判定:', {
      currentQuestionId,
      currentIndex,
      totalQuestions: allQuestions.length,
      completedCount,
      nextQuestionExists: !!nextQuestion,
      isComplete
    });
    
    return {
      isComplete,
      progress: {
        completed: completedCount,
        total: allQuestions.length,
        remaining: allQuestions.length - completedCount
      },
      nextQuestion
    };
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

    // 新しい面接完了判定ロジックを使用
    const completionResult = await this.checkInterviewCompletion(sessionId, questionId);
    const { isComplete: isInterviewComplete, nextQuestion } = completionResult;

    if (isInterviewComplete) {
      // セッションの状態を完了に更新
      await this.sessionRepository.update(
        { id: sessionId },
        { 
          session_status: SessionStatus.COMPLETED,
          completed_at: new Date(),
        },
      );

      // 評価レポートを自動生成（バックグラウンドで実行）
      this.generateEvaluationReportAsync(sessionId).catch(error => {
        console.error('❌ Background evaluation report generation failed:', error);
      });
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
      progress: completionResult.progress,
    };

    console.log('面接完了処理結果:', result);
    return result;
  }

  /**
   * GeminiのJSON応答を安全にパースする
   */
  private parseGeminiJsonResponse(response: string): any {
    try {
      // Markdownコードブロックを除去
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/^```/g, '');
      cleanedResponse = cleanedResponse.replace(/```$/g, '');
      cleanedResponse = cleanedResponse.trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse Gemini JSON response:', error.message);
      console.error('Original response:', response.substring(0, 500));
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * 評価レポートを非同期で生成（面接完了時にバックグラウンド実行）
   */
  private async generateEvaluationReportAsync(sessionId: string): Promise<void> {
    try {
      console.log('🚀 Starting background evaluation report generation for session:', sessionId);
      
      // 少し待機してから生成（データベースの整合性確保）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.generateEvaluationReport(sessionId);
      console.log('✅ Background evaluation report generation completed for session:', sessionId);
    } catch (error) {
      console.error('❌ Background evaluation report generation failed for session:', sessionId, error);
    }
  }

  async generateEvaluationReport(sessionId: string): Promise<EvaluationReportResponse> {
    console.log('🔍 Starting evaluation report generation for session:', sessionId);

    // Step 1: セッション情報を取得
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['skillSheet', 'questions', 'questions.answer'],
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.session_status !== SessionStatus.COMPLETED) {
      throw new BadRequestException('Cannot generate report for incomplete interview');
    }

    // Step 2: 全ての回答データを取得
    const questions = await this.questionRepository.find({
      where: { sessionId },
      relations: ['answer'],
      order: { question_order: 'ASC' },
    });

    const answers = questions
      .map(q => q.answer)
      .filter(a => a && a.answer_status === AnswerStatus.COMPLETED);

    console.log('📊 Found data:', {
      totalQuestions: questions.length,
      completedAnswers: answers.length,
      skillSheetId: session.skillSheet?.id,
    });

    // Step 3: AI評価分析を実行
    const evaluationData = await this.performAIEvaluation(session, questions, answers);

    // Step 4: 評価レポートを保存
    const report = await this.saveEvaluationReport(sessionId, evaluationData);

    // Step 5: レスポンス形式に変換
    return this.mapToResponse(report);
  }

  private async performAIEvaluation(
    session: InterviewSession,
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
  ) {
    console.log('🤖 Starting AI evaluation analysis...');

    // 回答内容をテキストとして結合
    const answerTexts = answers.map(answer => ({
      questionText: questions.find(q => q.id === answer.question_id)?.question_data?.text || '',
      answerText: answer.answer_data?.text || '',
      confidence: answer.answer_data?.confidence_score || 0,
    }));

    const skillSheetData = JSON.stringify(session.skillSheet?.skill_data) || '';

    // Gemini AIを使用して技術評価
    const technicalEvaluation = await this.evaluateTechnicalSkills(answerTexts, skillSheetData);
    
    // Gemini AIを使用してソフトスキル評価
    const softSkillsEvaluation = await this.evaluateSoftSkills(answerTexts);
    
    // 回答品質評価
    const qualityEvaluation = await this.evaluateAnswerQuality(answerTexts);
    
    // 経験評価
    const experienceEvaluation = await this.evaluateExperience(answerTexts, skillSheetData);

    // 総合評価を計算
    const overallScore = this.calculateOverallScore({
      technical: technicalEvaluation,
      softSkills: softSkillsEvaluation,
      quality: qualityEvaluation,
      experience: experienceEvaluation,
    });

    // 推奨グレードを決定
    const recommendationGrade = this.determineRecommendationGrade(overallScore);

    // 強みと改善点を抽出
    const insights = await this.generateInsights(answerTexts, {
      technical: technicalEvaluation,
      softSkills: softSkillsEvaluation,
      quality: qualityEvaluation,
      experience: experienceEvaluation,
    });

    return {
      technicalScores: technicalEvaluation,
      softSkillsScores: softSkillsEvaluation,
      answerQualityScores: qualityEvaluation,
      experienceEvaluation,
      overallScore,
      recommendationGrade,
      ...insights,
    };
  }

  private async evaluateTechnicalSkills(answerTexts: any[], skillSheetData: string) {
    const prompt = `
技術面接の回答内容とスキルシートを分析し、以下の技術分野について0-100のスコアで評価してください。

【スキルシート情報】
${skillSheetData}

【面接での質問と回答】
${answerTexts.map((item, index) => `
Q${index + 1}: ${item.questionText}
A${index + 1}: ${item.answerText}
（信頼度: ${item.confidence}）
`).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "frontend": <スコア>,
  "backend": <スコア>, 
  "database": <スコア>,
  "infrastructure": <スコア>,
  "architecture": <スコア>,
  "analysis": "<評価根拠>"
}

評価基準：
- Frontend: React, Vue, Angular, HTML/CSS, JavaScript/TypeScriptの知識
- Backend: サーバーサイド言語、API設計、セキュリティ
- Database: SQL/NoSQL、設計、最適化
- Infrastructure: AWS/GCP/Azure、Docker、CI/CD
- Architecture: 設計パターン、マイクロサービス、スケーラビリティ

各分野について:
90-100: エキスパートレベル
80-89: 上級レベル  
70-79: 中級レベル
60-69: 初級レベル
50-59: 基礎レベル
50未満: 要学習
`;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const evaluation = this.parseGeminiJsonResponse(result);
      
      // バリデーションとデフォルト値
      return {
        frontend: Math.max(0, Math.min(100, evaluation.frontend || 70)),
        backend: Math.max(0, Math.min(100, evaluation.backend || 70)),
        database: Math.max(0, Math.min(100, evaluation.database || 70)),
        infrastructure: Math.max(0, Math.min(100, evaluation.infrastructure || 70)),
        architecture: Math.max(0, Math.min(100, evaluation.architecture || 70)),
      };
    } catch (error) {
      console.error('Gemini API error in technical evaluation:', error);
      // フォールバック: 基本的なキーワード分析
      return this.fallbackTechnicalEvaluation(answerTexts, skillSheetData);
    }
  }

  private async evaluateSoftSkills(answerTexts: any[]) {
    const prompt = `
面接の回答内容を分析し、ソフトスキルについて0-100のスコアで評価してください。

【面接での質問と回答】
${answerTexts.map((item, index) => `
Q${index + 1}: ${item.questionText}
A${index + 1}: ${item.answerText}
`).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "communication": <スコア>,
  "problemSolving": <スコア>,
  "teamwork": <スコア>,
  "leadership": <スコア>,
  "learning": <スコア>,
  "analysis": "<評価根拠>"
}

評価基準：
- Communication: 明確な説明力、論理的構成、相手への配慮
- Problem Solving: 問題分析力、解決策提案、思考プロセス
- Teamwork: 協調性、他者との連携、チームでの貢献
- Leadership: 主体性、責任感、他者への影響力
- Learning: 学習意欲、新技術への適応性、成長志向

スコア基準:
90-100: 卓越したレベル
80-89: 優秀なレベル
70-79: 良好なレベル  
60-69: 標準的なレベル
50-59: 改善が必要
50未満: 大きな改善が必要
`;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const evaluation = this.parseGeminiJsonResponse(result);
      
      return {
        communication: Math.max(0, Math.min(100, evaluation.communication || 75)),
        problemSolving: Math.max(0, Math.min(100, evaluation.problemSolving || 75)),
        teamwork: Math.max(0, Math.min(100, evaluation.teamwork || 75)),
        leadership: Math.max(0, Math.min(100, evaluation.leadership || 70)),
        learning: Math.max(0, Math.min(100, evaluation.learning || 75)),
      };
    } catch (error) {
      console.error('Gemini API error in soft skills evaluation:', error);
      return this.fallbackSoftSkillsEvaluation(answerTexts);
    }
  }

  private async evaluateAnswerQuality(answerTexts: any[]) {
    const prompt = `
面接回答の品質を分析し、以下の観点から0-100のスコアで評価してください。

【面接での質問と回答】
${answerTexts.map((item, index) => `
Q${index + 1}: ${item.questionText}
A${index + 1}: ${item.answerText}
（音声認識信頼度: ${item.confidence}）
`).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "accuracy": <スコア>,
  "detail": <スコア>,
  "clarity": <スコア>,
  "structure": <スコア>,
  "analysis": "<評価根拠>"
}

評価基準：
- Accuracy: 技術的正確性、事実の正しさ、専門知識の適切性
- Detail: 回答の詳細度、具体例の提示、深い理解の表現
- Clarity: 説明の明確さ、分かりやすさ、用語の適切な使用
- Structure: 論理的構成、回答の組み立て、結論の明確性

各観点について:
90-100: 非常に優秀
80-89: 優秀
70-79: 良好
60-69: 普通
50-59: やや不足
50未満: 改善が必要
`;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const evaluation = this.parseGeminiJsonResponse(result);
      
      return {
        accuracy: Math.max(0, Math.min(100, evaluation.accuracy || 75)),
        detail: Math.max(0, Math.min(100, evaluation.detail || 75)),
        clarity: Math.max(0, Math.min(100, evaluation.clarity || 75)),
        structure: Math.max(0, Math.min(100, evaluation.structure || 75)),
      };
    } catch (error) {
      console.error('Gemini API error in answer quality evaluation:', error);
      return this.fallbackAnswerQualityEvaluation(answerTexts);
    }
  }

  private async evaluateExperience(answerTexts: any[], skillSheetData: string) {
    const prompt = `
スキルシートと面接回答から、候補者の経験・実績を分析し評価してください。

【スキルシート情報】
${skillSheetData}

【面接での質問と回答】
${answerTexts.map((item, index) => `
Q${index + 1}: ${item.questionText}
A${index + 1}: ${item.answerText}
`).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "projectScale": <スコア>,
  "responsibility": <スコア>,
  "achievements": <スコア>,
  "relevance": <スコア>,
  "analysis": "<評価根拠>"
}

評価基準：
- Project Scale: プロジェクトの規模、複雑性、影響範囲
- Responsibility: 担当した役割の責任範囲、リーダーシップ経験
- Achievements: 具体的な成果、問題解決実績、改善効果
- Relevance: 募集ポジションとの関連性、経験の適用可能性

スコア基準:
90-100: 非常に優れた経験・実績
80-89: 優れた経験・実績
70-79: 良好な経験・実績
60-69: 標準的な経験・実績
50-59: やや不足している経験・実績
50未満: 大幅に不足している経験・実績
`;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const evaluation = this.parseGeminiJsonResponse(result);
      
      return {
        projectScale: Math.max(0, Math.min(100, evaluation.projectScale || 70)),
        responsibility: Math.max(0, Math.min(100, evaluation.responsibility || 70)),
        achievements: Math.max(0, Math.min(100, evaluation.achievements || 70)),
        relevance: Math.max(0, Math.min(100, evaluation.relevance || 75)),
      };
    } catch (error) {
      console.error('Gemini API error in experience evaluation:', error);
      return this.fallbackExperienceEvaluation(answerTexts, skillSheetData);
    }
  }

  private calculateOverallScore(evaluations: any): number {
    // 各カテゴリの平均を計算
    const techAvg = (Object.values(evaluations.technical) as number[]).reduce((sum: number, val: number) => sum + val, 0) / 5;
    const softAvg = (Object.values(evaluations.softSkills) as number[]).reduce((sum: number, val: number) => sum + val, 0) / 5;
    const qualityAvg = (Object.values(evaluations.quality) as number[]).reduce((sum: number, val: number) => sum + val, 0) / 4;
    const expAvg = (Object.values(evaluations.experience) as number[]).reduce((sum: number, val: number) => sum + val, 0) / 4;

    // 重み付け平均（技術40%, ソフト25%, 品質25%, 経験10%）
    return Math.round((techAvg * 0.4 + softAvg * 0.25 + qualityAvg * 0.25 + expAvg * 0.1) * 10) / 10;
  }

  private determineRecommendationGrade(overallScore: number): RecommendationGrade {
    if (overallScore >= 90) return RecommendationGrade.A;
    if (overallScore >= 80) return RecommendationGrade.B;
    if (overallScore >= 70) return RecommendationGrade.C;
    if (overallScore >= 60) return RecommendationGrade.D;
    return RecommendationGrade.E;
  }

  private async generateInsights(answerTexts: any[], evaluations: any) {
    const prompt = `
面接回答と評価結果を総合的に分析し、候補者の強み・改善点・推奨ポジションを提案してください。

【評価結果】
技術スキル: ${JSON.stringify(evaluations.technical)}
ソフトスキル: ${JSON.stringify(evaluations.softSkills)}
回答品質: ${JSON.stringify(evaluations.quality)}
経験・実績: ${JSON.stringify(evaluations.experience)}

【面接での回答概要】
${answerTexts.map((item, index) => `Q${index + 1}: ${item.questionText.substring(0, 100)}...`).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "strengths": ["強み1", "強み2", "強み3"],
  "areasForImprovement": ["改善点1", "改善点2"],
  "detailedFeedback": "<詳細フィードバック(200-300文字)>",
  "recommendedPositions": ["推奨ポジション1", "推奨ポジション2"]
}

分析指針：
- 強みは具体的で評価根拠が明確なものを3つ選択
- 改善点は建設的で成長につながる内容を2つ選択
- 詳細フィードバックは全体的な印象と具体的なアドバイス
- 推奨ポジションは評価結果に基づく適切な提案

推奨ポジション例：
- Senior/Junior Frontend Developer
- Senior/Junior Backend Developer  
- Full Stack Developer
- DevOps Engineer
- Tech Lead
- Engineering Manager
- Data Engineer
- Mobile Developer
`;

    try {
      const result = await this.geminiService.generateContent(prompt);
      const insights = JSON.parse(result);
      
      return {
        strengths: insights.strengths?.slice(0, 3) || ['技術的基礎が確立されている', 'コミュニケーション能力が良好', '学習意欲が高い'],
        areasForImprovement: insights.areasForImprovement?.slice(0, 2) || ['より具体的な事例の提示', '最新技術トレンドの理解'],
        detailedFeedback: insights.detailedFeedback || 'Overall good candidate with solid technical foundation.',
        recommendedPositions: insights.recommendedPositions?.slice(0, 2) || ['Software Developer', 'Frontend Developer'],
      };
    } catch (error) {
      console.error('Gemini API error in insights generation:', error);
      return this.fallbackInsightsGeneration(evaluations);
    }
  }

  private async saveEvaluationReport(sessionId: string, evaluationData: any): Promise<EvaluationReport> {
    const report = this.evaluationReportRepository.create({
      session_id: sessionId,
      technicalScores: evaluationData.technicalScores,
      softSkillsScores: evaluationData.softSkillsScores,
      answerQualityScores: evaluationData.answerQualityScores,
      experienceEvaluation: evaluationData.experienceEvaluation,
      overallScore: evaluationData.overallScore,
      recommendationGrade: evaluationData.recommendationGrade,
      strengths: evaluationData.strengths,
      areasForImprovement: evaluationData.areasForImprovement,
      detailedFeedback: evaluationData.detailedFeedback,
      recommendedPositions: evaluationData.recommendedPositions,
      aiAnalysisMetadata: {
        modelUsed: 'gemini-2.0-flash',
        analysisTimestamp: new Date(),
        confidenceScores: { overall: 0.85 },
      },
    });

    return await this.evaluationReportRepository.save(report);
  }

  private mapToResponse(report: EvaluationReport): EvaluationReportResponse {
    return {
      id: report.id,
      sessionId: report.session_id,
      technicalScores: report.technicalScores,
      softSkillsScores: report.softSkillsScores,
      answerQualityScores: report.answerQualityScores,
      experienceEvaluation: report.experienceEvaluation,
      overallScore: Number(report.overallScore),
      recommendationGrade: report.recommendationGrade,
      strengths: report.strengths,
      areasForImprovement: report.areasForImprovement,
      detailedFeedback: report.detailedFeedback,
      recommendedPositions: report.recommendedPositions,
      aiAnalysisMetadata: {
        modelUsed: report.aiAnalysisMetadata.modelUsed,
        analysisTimestamp: typeof report.aiAnalysisMetadata.analysisTimestamp === 'string' 
          ? report.aiAnalysisMetadata.analysisTimestamp 
          : report.aiAnalysisMetadata.analysisTimestamp.toISOString(),
        confidenceScores: JSON.stringify(report.aiAnalysisMetadata.confidenceScores),
      },
      createdAt: report.createdAt.toISOString(),
    };
  }

  // フォールバック評価メソッド群
  private fallbackTechnicalEvaluation(answerTexts: any[], skillSheetData: string) {
    // 基本的なキーワード分析
    const combinedText = answerTexts.map(a => a.answerText).join(' ') + ' ' + skillSheetData;
    
    const frontendKeywords = ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'];
    const backendKeywords = ['Node.js', 'Python', 'Java', 'API', 'REST', 'GraphQL', 'SQL'];
    const databaseKeywords = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'データベース'];
    const infraKeywords = ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'クラウド'];
    const archKeywords = ['設計', 'アーキテクチャ', 'マイクロサービス', 'スケール'];
    
    return {
      frontend: this.calculateKeywordScore(combinedText, frontendKeywords),
      backend: this.calculateKeywordScore(combinedText, backendKeywords),
      database: this.calculateKeywordScore(combinedText, databaseKeywords),
      infrastructure: this.calculateKeywordScore(combinedText, infraKeywords),
      architecture: this.calculateKeywordScore(combinedText, archKeywords),
    };
  }

  private fallbackSoftSkillsEvaluation(answerTexts: any[]) {
    const totalLength = answerTexts.reduce((sum, item) => sum + item.answerText.length, 0);
    const avgConfidence = answerTexts.reduce((sum, item) => sum + item.confidence, 0) / answerTexts.length;
    
    // 文章の長さと信頼度からソフトスキルを推定
    const baseScore = Math.min(85, 60 + (totalLength / 100) + (avgConfidence * 20));
    
    return {
      communication: Math.round(baseScore + Math.random() * 10 - 5),
      problemSolving: Math.round(baseScore + Math.random() * 10 - 5),
      teamwork: Math.round(baseScore + Math.random() * 10 - 5),
      leadership: Math.round(Math.max(50, baseScore - 10 + Math.random() * 10)),
      learning: Math.round(baseScore + Math.random() * 10 - 5),
    };
  }

  private fallbackAnswerQualityEvaluation(answerTexts: any[]) {
    const avgConfidence = answerTexts.reduce((sum, item) => sum + item.confidence, 0) / answerTexts.length;
    const avgLength = answerTexts.reduce((sum, item) => sum + item.answerText.length, 0) / answerTexts.length;
    
    const baseScore = 65 + (avgConfidence * 25) + Math.min(15, avgLength / 50);
    
    return {
      accuracy: Math.round(Math.max(50, baseScore + Math.random() * 10 - 5)),
      detail: Math.round(Math.max(50, baseScore + Math.random() * 10 - 5)),
      clarity: Math.round(Math.max(50, baseScore + Math.random() * 10 - 5)),
      structure: Math.round(Math.max(50, baseScore + Math.random() * 10 - 5)),
    };
  }

  private fallbackExperienceEvaluation(answerTexts: any[], skillSheetData: string) {
    const experienceKeywords = ['年', '経験', 'プロジェクト', '開発', '担当', 'リード', 'マネジメント'];
    const combinedText = answerTexts.map(a => a.answerText).join(' ') + ' ' + skillSheetData;
    
    const baseScore = this.calculateKeywordScore(combinedText, experienceKeywords);
    
    return {
      projectScale: Math.round(baseScore + Math.random() * 15 - 7),
      responsibility: Math.round(baseScore + Math.random() * 15 - 7),
      achievements: Math.round(baseScore + Math.random() * 15 - 7),
      relevance: Math.round(baseScore + 5 + Math.random() * 10 - 5),
    };
  }

  private fallbackInsightsGeneration(evaluations: any) {
    const avgTech = (Object.values(evaluations.technical) as number[]).reduce((a, b) => a + b, 0) / 5;
    const avgSoft = (Object.values(evaluations.softSkills) as number[]).reduce((a, b) => a + b, 0) / 5;
    
    let strengths = ['技術的基礎が確立されている'];
    let positions = ['Software Developer'];
    
    if (avgTech > 80) {
      strengths.push('高い技術スキルを持っている');
      positions.push('Senior Developer');
    }
    if (avgSoft > 80) {
      strengths.push('優れたコミュニケーション能力');
      positions.push('Tech Lead');
    }
    
    strengths.push('学習意欲が感じられる');
    
    return {
      strengths: strengths.slice(0, 3),
      areasForImprovement: ['より具体的な事例の提示', '継続的なスキル向上'],
      detailedFeedback: `全体的に${avgTech > 70 ? '良好な' : '基礎的な'}技術レベルを持つ候補者です。`,
      recommendedPositions: positions.slice(0, 2),
    };
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 60; // ベーススコア
    
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 8;
      }
    });
    
    return Math.min(95, score);
  }

  async generatePdfReport(reportId: string): Promise<PdfReportResponse> {
    console.log('🔍 Generating PDF report for ID:', reportId);

    // レポートを取得
    const report = await this.evaluationReportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Evaluation report not found');
    }

    // レポートデータをレスポンス形式に変換
    const reportResponse = this.mapToResponse(report);

    // HTMLコンテンツを生成
    const htmlContent = this.pdfService.generateReportHTML(reportResponse);
    const metadata = this.pdfService.generateReportMetadata(reportResponse);

    return {
      htmlContent,
      filename: metadata.filename,
      title: metadata.title,
      reportId: reportId,
    };
  }

  async getEvaluationReport(reportId: string): Promise<EvaluationReportResponse> {
    const report = await this.evaluationReportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Evaluation report not found');
    }

    return this.mapToResponse(report);
  }

  async getReportsBySession(sessionId: string): Promise<EvaluationReportResponse[]> {
    const reports = await this.evaluationReportRepository.find({
      where: { session_id: sessionId },
      order: { createdAt: 'DESC' },
    });

    return reports.map(report => this.mapToResponse(report));
  }
}