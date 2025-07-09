declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    toFormat(format: string): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    audioFrequency(frequency: number): FfmpegCommand;
    audioChannels(channels: number): FfmpegCommand;
    on(event: 'end', callback: () => void): FfmpegCommand;
    on(event: 'error', callback: (err: Error) => void): FfmpegCommand;
    save(filename: string): void;
  }

  function ffmpeg(input: string): FfmpegCommand;

  namespace ffmpeg {
    export function setFfmpegPath(path: string): void;
  }

  export = ffmpeg;
}
