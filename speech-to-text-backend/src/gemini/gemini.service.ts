import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async transcribeAudio(filePath: string): Promise<string> {
    try {
      // Read the audio file
      const audioData = fs.readFileSync(filePath);
      
      // Convert to base64
      const base64Audio = audioData.toString('base64');

      // Create the prompt with audio data
      const prompt = 'この音声ファイルの内容を日本語でテキストに書き起こしてください。';
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Error transcribing audio with Gemini:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
}