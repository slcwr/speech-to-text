'use client';

import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export default function AudioRecorder() {
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadWavFile,
    uploadWavFile,
  } = useAudioRecorder();

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const result = await uploadWavFile();
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ error: 'アップロードに失敗しました' });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">音声録音</h2>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-mono text-blue-600 mb-2">
          {formatTime(recordingTime)}
        </div>
        <div className="text-sm text-gray-600">
          {isRecording ? (isPaused ? '一時停止中' : '録音中...') : '待機中'}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            録音開始
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                一時停止
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                再開
              </button>
            )}
            <button
              onClick={stopRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              停止
            </button>
          </>
        )}
      </div>

      {audioBlob && (
        <div className="text-center space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">録音完了</h3>
            <audio controls className="w-full">
              <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
              お使いのブラウザは音声再生をサポートしていません。
            </audio>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => downloadWavFile()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              WAVファイルとしてダウンロード
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              {isUploading ? 'アップロード中...' : 'サーバーにアップロード'}
            </button>
          </div>
          
          {uploadResult && (
            <div className="mt-4 p-4 rounded-lg bg-gray-100">
              {uploadResult.error ? (
                <p className="text-red-600">{uploadResult.error}</p>
              ) : (
                <div>
                  <p className="text-green-600 font-semibold">アップロード成功！</p>
                  <p className="text-sm text-gray-600">
                    ファイル名: {uploadResult.filename}
                  </p>
                  <p className="text-sm text-gray-600">
                    サイズ: {(uploadResult.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}