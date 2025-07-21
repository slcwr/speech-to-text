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

    // Initialize Text-to-Speech client
    this.ttsClient = new textToSpeech.TextToSpeechClient();
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
以下のスキルシート文書を分析して、JSON形式で情報を抽出してください。
有効なJSONオブジェクトのみを返してください。以下の構造に従ってください：

{
  "technical_skills": ["スキル1", "スキル2", ...],
  "experience_years": 数値,
  "projects": [
    {
      "name": "プロジェクト名",
      "role": "プロジェクトでの役割",
      "technologies": ["技術1", "技術2", ...],
      "duration_months": 数値
    }
  ],
  "strengths": ["強み1", "強み2", ...],
  "weaknesses": ["弱み1", "弱み2", ...],
  "problem_solving": {
    "approach": "問題解決アプローチの説明",
    "examples": [
      {
        "situation": "状況の説明",
        "task": "タスクの説明",
        "action": "取った行動",
        "result": "結果"
      }
    ],
    "methodologies": ["方法論1", "方法論2", ...],
    "collaboration_style": "協働スタイルの説明"
  },
  "certifications": ["資格1", "資格2", ...],
  "education": "学歴",
  "languages": ["言語1", "言語2", ...]
}

スキルシート内容:
${fileContent}
`;

      const text = await this.generateContentWithRetry(prompt);
      
      this.logger.log('Gemini analysis completed');
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysisResult = JSON.parse(cleanedText);
      
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
      
      this.logger.log('Question generation completed');
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const questions = JSON.parse(cleanedText);
      
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
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      
      // Handle different file formats
      if (fileExtension === '.csv') {
        // Read and format CSV for better readability
        const csvContent = fs.readFileSync(filePath, 'utf-8');
        return this.formatCsvForGemini(csvContent);
      } else if (fileExtension === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
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
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length === 0) return csvContent;

      // Parse CSV to create a more readable format
      const rows = lines.map(line => {
        // Simple CSV parsing (handles basic cases)
        const values = line.split(',').map(val => val.trim());
        return values;
      });

      // Format as a structured text
      let formattedContent = 'スキルシート情報:\n\n';
      
      // Assume first row might be headers
      const headers = rows[0];
      const dataRows = rows.slice(1);

      if (dataRows.length > 0) {
        dataRows.forEach((row, index) => {
          formattedContent += `レコード ${index + 1}:\n`;
          row.forEach((value, colIndex) => {
            const header = headers[colIndex] || `項目${colIndex + 1}`;
            if (value && value.trim()) {
              formattedContent += `  ${header}: ${value}\n`;
            }
          });
          formattedContent += '\n';
        });
      } else {
        // If no clear header structure, just format as-is
        formattedContent = csvContent;
      }

      return formattedContent;
    } catch (error) {
      // If parsing fails, return original content
      this.logger.warn('Failed to format CSV, using raw content', error);
      return csvContent;
    }
  }

  async generateQuestionAudio(text: string, options?: TTSOptions): Promise<Buffer> {
    try {
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
}