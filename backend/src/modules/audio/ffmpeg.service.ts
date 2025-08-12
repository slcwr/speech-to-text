import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';

/**
 * FFmpegを使用した音声変換サービス
 */
@Injectable()
export class FFmpegService {
  /**
   * 音声データをWAV形式に変換する
   * @param inputBuffer 入力音声データ
   * @param inputMimeType 入力音声のMIMEタイプ
   * @returns WAV形式の音声データ
   */
  async convertToWav(
    inputBuffer: Buffer,
    inputMimeType: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // 入力ストリームを作成
      const inputStream = new Readable();
      inputStream.push(inputBuffer);
      inputStream.push(null);

      // 出力ストリームを作成
      const outputChunks: Buffer[] = [];
      const outputStream = new PassThrough();

      outputStream.on('data', (chunk) => {
        outputChunks.push(chunk);
      });

      outputStream.on('end', () => {
        const outputBuffer = Buffer.concat(outputChunks);
        resolve(outputBuffer);
      });

      outputStream.on('error', (error) => {
        reject(error);
      });

      // FFmpegで変換実行
      const command = ffmpeg()
        .input(inputStream)
        .inputFormat(this.getFFmpegFormat(inputMimeType))
        .audioCodec('pcm_s16le') // PCM 16-bit signed little-endian
        .audioChannels(1) // モノラル
        .audioFrequency(16000) // 16kHz（Gemini API推奨）
        .format('wav')
        .on('error', (error) => {
          console.error('FFmpeg conversion error:', error);
          reject(new Error(`Audio conversion failed: ${error.message}`));
        })
        .on('end', () => {
          console.log('Audio conversion completed successfully');
        });

      // 出力ストリームに接続
      command.pipe(outputStream);
    });
  }

  /**
   * MIMEタイプからFFmpegの入力形式を決定する
   * @param mimeType MIMEタイプ
   * @returns FFmpegの形式名
   */
  private getFFmpegFormat(mimeType: string): string {
    const formatMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/ogg': 'ogg',
      'audio/ogg;codecs=opus': 'ogg',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
    };

    const format = formatMap[mimeType.toLowerCase()];
    if (!format) {
      console.warn(`Unknown mime type: ${mimeType}, defaulting to webm`);
      return 'webm';
    }

    return format;
  }

  /**
   * 音声ファイルの情報を取得する
   * @param buffer 音声データ
   * @returns 音声情報
   */
  async getAudioInfo(buffer: Buffer): Promise<{
    duration: number;
    bitrate: string;
    format: string;
    channels: number;
    sampleRate: number;
  }> {
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null);

      ffmpeg()
        .input(inputStream)
        .ffprobe((error, metadata) => {
          if (error) {
            reject(new Error(`Failed to get audio info: ${error.message}`));
            return;
          }

          const audioStream = metadata.streams.find(
            (stream) => stream.codec_type === 'audio',
          );

          if (!audioStream) {
            reject(new Error('No audio stream found'));
            return;
          }

          resolve({
            duration: metadata.format.duration || 0,
            bitrate: String(metadata.format.bit_rate || '0'),
            format: metadata.format.format_name || 'unknown',
            channels: audioStream.channels || 1,
            sampleRate: parseInt(String(audioStream.sample_rate)) || 0,
          });
        });
    });
  }

  /**
   * 音声の音量レベルを分析する
   * @param buffer 音声データ
   * @returns 音量情報
   */
  async analyzeVolume(buffer: Buffer): Promise<{
    meanVolume: number;
    maxVolume: number;
    isSilent: boolean;
  }> {
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null);

      let volumeOutput = '';

      const command = ffmpeg()
        .input(inputStream)
        .audioFilters('volumedetect')
        .format('null')
        .on('error', (error) => {
          reject(new Error(`Volume analysis failed: ${error.message}`));
        })
        .on('stderr', (stderrLine) => {
          volumeOutput += stderrLine + '\n';
        })
        .on('end', () => {
          try {
            // ボリューム検出結果を解析
            const meanMatch = volumeOutput.match(/mean_volume: ([-\d.]+) dB/);
            const maxMatch = volumeOutput.match(/max_volume: ([-\d.]+) dB/);

            const meanVolume = meanMatch ? parseFloat(meanMatch[1]) : -Infinity;
            const maxVolume = maxMatch ? parseFloat(maxMatch[1]) : -Infinity;

            // 無音判定（平均音量が-50dB以下）
            const isSilent = meanVolume < -50;

            resolve({
              meanVolume,
              maxVolume,
              isSilent,
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse volume data: ${parseError.message}`));
          }
        });

      // null出力（実際の音声ファイルは生成しない）
      command.output('-').run();
    });
  }
}