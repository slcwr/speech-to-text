import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';

ffmpeg.setFfmpegPath(ffmpegPath.path);

@Injectable()
export class AudioService {
  async convertWebmToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioFrequency(44100)
        .audioChannels(2)
        .on('end', () => {
          console.log('変換完了:', outputPath);
          resolve();
        })
        .on('error', (err) => {
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
  }> {
    const webmPath = file.path;
    const wavFileName = file.filename.replace(/\.[^/.]+$/, '.wav');
    const wavPath = join('./uploads', wavFileName);

    try {
      // WebMからWAVに変換
      await this.convertWebmToWav(webmPath, wavPath);

      // 元のWebMファイルを削除（オプション）
      // await fs.unlink(webmPath);

      return {
        originalFile: file.filename,
        wavFile: wavFileName,
        message: 'Audio file converted to WAV successfully',
      };
    } catch (error) {
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }
}