/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { join } from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import { GeminiService } from '../gemini/gemini.service';

// ffmpegのパスを設定
(ffmpeg as any).setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class AudioService {
  constructor(private readonly geminiService: GeminiService) {}
  async convertWebmToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      (ffmpeg as any)(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioFrequency(44100)
        .audioChannels(2)
        .on('end', () => {
          console.log('変換完了:', outputPath);
          resolve();
        })
        .on('error', (err: Error) => {
          console.error('変換エラー:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async processAudioUpload(file: Express.Multer.File): Promise<{
    originalFile: string;
    wavFile: string;
    message: string;
    transcription: string;
  }> {
    const webmPath = file.path;
    const wavFileName = file.filename.replace(/\.[^/.]+$/, '.wav');
    const wavPath = join('./uploads', wavFileName);

    try {
      // WebMからWAVに変換
      await this.convertWebmToWav(webmPath, wavPath);

      // Geminiで音声をテキスト化
      const transcription = await this.geminiService.transcribeAudio(wavPath);

      // 元のWebMファイルを削除（オプション）
      // await fs.unlink(webmPath);

      return {
        originalFile: file.filename,
        wavFile: wavFileName,
        message: 'Audio file converted to WAV and transcribed successfully',
        transcription,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Audio processing failed: ${errorMessage}`);
    }
  }
}
