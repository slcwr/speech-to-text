import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as textToSpeech from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisResult {
  technical_skills: string[];
  experience_years: number;
  projects: {
    name: string;
    role: string;
    technologies: string[];
    duration_months: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  problem_solving: {
    approach: string;
    examples: {
      situation: string;
      task: string;
      action: string;
      result: string;
    }[];
    methodologies: string[];
    collaboration_style: string;
  };
  certifications?: string[];
  education?: string;
  languages?: string[];
}

export interface QuestionGenerationResult {
  technical_questions: string[];
  motivation_questions: string[];
}

export interface TTSOptions {
  languageCode?: string;
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private ttsClient: textToSpeech.TextToSpeechClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.0-flash');
    this.model = this.genAI.getGenerativeModel({ model: modelName });

    // Initialize Text-to-Speech client only if credentials exist
    const googleCreds = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (googleCreds) {
      this.ttsClient = new textToSpeech.TextToSpeechClient();
    } else {
      this.logger.warn('Google Cloud credentials not configured. TTS features will be disabled.');
    }
  }

  private async generateContentWithRetry(prompt: string, maxRetries = 3, baseDelay = 1000): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        this.logger.warn(`API call failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Check if it's a rate limit or overload error
        if (error.message?.includes('503') || error.message?.includes('overloaded') || error.message?.includes('429')) {
          // Exponential backoff with jitter
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          this.logger.log(`Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // For other errors, throw immediately
          throw error;
        }
      }
    }
  }

  async analyzeDocument(filePath: string, fileFormat: string): Promise<AnalysisResult> {
    try {
      this.logger.log(`Analyzing document: ${filePath}, format: ${fileFormat}`);
      
      // 1. Read the file
      const fileContent = await this.readFile(filePath, fileFormat);
      
      // 2. Analyze with Gemini
      const prompt = `
以下の日本のスキルシート（CSVフォーマット）を分析して、JSON形式で情報を抽出してください。
このスキルシートには個人情報、保有技術、プロジェクト経験などが含まれています。
情報が見つからない場合は、空の配列または適切なデフォルト値を使用してください。

有効なJSONオブジェクトのみを返してください。以下の構造に従ってください：

{
  "technical_skills": ["スキル1", "スキル2", ...],
  "experience_years": 数値（経験年数、不明な場合は0）,
  "projects": [
    {
      "name": "プロジェクト名",
      "role": "役割",
      "technologies": ["使用技術"],
      "duration_months": 期間（月数）
    }
  ],
  "strengths": ["強み・得意分野"],
  "weaknesses": ["課題・改善点"],
  "problem_solving": {
    "approach": "問題解決アプローチ",
    "examples": [],
    "methodologies": ["開発手法"],
    "collaboration_style": "チーム作業スタイル"
  },
  "certifications": ["保有資格"],
  "education": "学歴",
  "languages": ["日本語", "英語など"]
}

注意：
- 「保有技術」セクションから技術スキルを抽出
- プロジェクト経験が明記されていれば抽出、なければ空配列
- 年齢から概算の経験年数を推定可能
- 情報が不明な場合は適切なデフォルト値を使用

スキルシート内容:
${fileContent}
`;

      const text = await this.generateContentWithRetry(prompt);
      
      this.logger.log('Gemini raw response length: ' + text.length);
      this.logger.log('Gemini raw response (first 500 chars): ' + text.substring(0, 500));
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      this.logger.log('Cleaned response (first 500 chars): ' + cleanedText.substring(0, 500));
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(cleanedText);
      } catch (parseError) {
        this.logger.error('Failed to parse JSON response: ' + parseError.message);
        this.logger.error('Full cleaned text: ' + cleanedText);
        throw new Error('Invalid JSON response from Gemini');
      }
      
      // Ensure required fields have default values
      analysisResult = {
        technical_skills: analysisResult.technical_skills || [],
        experience_years: analysisResult.experience_years || 0,
        projects: analysisResult.projects || [],
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        problem_solving: analysisResult.problem_solving || {
          approach: '',
          examples: [],
          methodologies: [],
          collaboration_style: '',
        },
        certifications: analysisResult.certifications || [],
        education: analysisResult.education || '',
        languages: analysisResult.languages || [],
      };
      
      this.logger.log('Analysis result successfully parsed and validated');
      
      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing document', error);
      throw new Error(`Failed to analyze document: ${error.message}`);
    }
  }

  async generateQuestions(analysis: AnalysisResult): Promise<QuestionGenerationResult> {
    try {
      this.logger.log('Generating interview questions based on analysis');
      
      const prompt = `
以下のスキルシート分析結果に基づいて、面接質問をJSON形式で生成してください。
有効なJSONオブジェクトのみを返してください。以下の構造に従ってください：

{
  "technical_questions": ["質問1", "質問2", ...],
  "motivation_questions": ["質問1", "質問2", ...]
}

以下を生成してください：
- 技術スキルとプロジェクト経験に基づいた技術質問を5-7個
- 志望動機に関する質問を3-4個

スキルシート分析結果:
${JSON.stringify(analysis, null, 2)}
`;

      const text = await this.generateContentWithRetry(prompt);
      
      this.logger.log('Question generation raw response length: ' + text.length);
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let questions;
      try {
        questions = JSON.parse(cleanedText);
      } catch (parseError) {
        this.logger.error('Failed to parse questions JSON: ' + parseError.message);
        this.logger.error('Full cleaned text: ' + cleanedText);
        throw new Error('Invalid JSON response from Gemini for questions');
      }
      
      // Ensure required fields have default values
      questions = {
        technical_questions: questions.technical_questions || [],
        motivation_questions: questions.motivation_questions || [],
      };
      
      this.logger.log(`Generated ${questions.technical_questions.length} technical and ${questions.motivation_questions.length} motivation questions`);
      
      return questions;
    } catch (error) {
      this.logger.error('Error generating questions', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  async answerReverseQuestion(userQuestion: string, analysis: AnalysisResult): Promise<string> {
    try {
      this.logger.log('Answering reverse question from user');
      
      const prompt = `
あなたは面接官として、候補者からの質問に回答してください。
以下の候補者のスキルシート分析結果を参考にして、適切で具体的な回答をしてください。

候補者の質問: ${userQuestion}

候補者のスキルシート分析:
${JSON.stringify(analysis, null, 2)}

面接官として、この候補者に適した内容で質問に回答してください。
`;

      const text = await this.generateContentWithRetry(prompt);
      
      this.logger.log('Reverse question answered');
      
      return text.trim();
    } catch (error) {
      this.logger.error('Error answering reverse question', error);
      throw new Error(`Failed to answer reverse question: ${error.message}`);
    }
  }

  private async readFile(filePath: string, _fileFormat: string): Promise<string> {
    try {
      // Ensure absolute path - handle relative paths from uploads directory
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(process.cwd(), filePath);
      
      this.logger.log(`Reading file from: ${absolutePath}`);
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const fileExtension = path.extname(absolutePath).toLowerCase();
      
      // Handle different file formats
      if (fileExtension === '.csv') {
        // Read and format CSV for better readability
        const csvContent = fs.readFileSync(absolutePath, 'utf-8');
        return this.formatCsvForGemini(csvContent);
      } else if (fileExtension === '.txt') {
        return fs.readFileSync(absolutePath, 'utf-8');
      } else if (fileExtension === '.pdf') {
        // TODO: Implement PDF parsing with pdf-parse or similar
        throw new Error('PDF parsing not yet implemented. Please convert to CSV/TXT format.');
      } else if (fileExtension === '.docx') {
        // TODO: Implement DOCX parsing with mammoth or similar
        throw new Error('DOCX parsing not yet implemented. Please convert to CSV/TXT format.');
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error) {
      this.logger.error(`Error reading file: ${filePath}`, error);
      throw error;
    }
  }

  private formatCsvForGemini(csvContent: string): string {
    try {
      // 複雑なCSV構造をそのまま渡す（日本のスキルシート形式は特殊なため）
      // Geminiに直接解析を任せる
      this.logger.log('CSV content length: ' + csvContent.length);
      this.logger.log('CSV first 500 chars: ' + csvContent.substring(0, 500));
      
      return csvContent;
    } catch (error) {
      // If parsing fails, return original content
      this.logger.warn('Failed to format CSV, using raw content', error);
      return csvContent;
    }
  }

  async generateQuestionAudio(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
      if (!this.ttsClient) {
        throw new Error('Text-to-Speech is not configured. Please set GOOGLE_APPLICATION_CREDENTIALS.');
      }
      
      this.logger.log(`Generating audio for text: ${text.substring(0, 50)}...`);

      const request = {
        input: { text },
        voice: {
          languageCode: options?.languageCode || 'ja-JP',
          name: options?.voiceName || 'ja-JP-Neural2-B',
        },
        audioConfig: {
          audioEncoding: options?.audioEncoding || 'MP3',
          speakingRate: options?.speakingRate || 1.0,
          pitch: options?.pitch || 0.0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content received from TTS');
      }

      this.logger.log('Audio generation completed');
      
      // Return audio content as Buffer
      return Buffer.from(response.audioContent as Uint8Array);
    } catch (error) {
      this.logger.error('Error generating audio', error);
      throw new Error(`Failed to generate audio: ${error.message}`);
    }
  }

  /**
   * 音声データをテキストに転写する（Gemini APIを使用）
   * @param audioBuffer WAV形式の音声データ
   * @returns 転写されたテキスト
   */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      this.logger.log(`Transcribing audio buffer of size: ${audioBuffer.length} bytes`);

      // Gemini APIで音声転写
      // Note: Geminiの音声認識機能を使用する場合の実装
      // 実際のAPIに合わせて調整が必要
      const base64Audio = audioBuffer.toString('base64');
      
      const prompt = `
音声データを文字起こしして、自然な日本語テキストとして返してください。
以下の音声データを分析してください：
`;

      // 音声データ付きのリクエスト（実際のGemini音声API仕様に合わせる必要があります）
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
        { text: prompt },
      ]);

      const response = await result.response;
      const transcription = response.text().trim();
      
      this.logger.log(`Transcription completed: ${transcription.substring(0, 100)}...`);
      
      return transcription;
    } catch (error) {
      this.logger.error('Error transcribing audio', error);
      throw new Error(`音声転写に失敗しました: ${error.message}`);
    }
  }

  /**
   * General content generation method for evaluation reports
   */
  async generateContent(prompt: string): Promise<string> {
    return this.generateContentWithRetry(prompt);
  }
}