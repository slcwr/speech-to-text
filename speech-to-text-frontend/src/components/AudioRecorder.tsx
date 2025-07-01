'use client';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export default function AudioRecorder() {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    uploadStatus,
    uploadMessage,
    transcription,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

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
          <div className="mt-4">
            {uploadStatus === 'uploading' && (
              <p className="text-blue-600">アップロード中...</p>
            )}
            {uploadStatus === 'success' && (
              <p className="text-green-600">{uploadMessage}</p>
            )}
            {uploadStatus === 'error' && (
              <p className="text-red-600">{uploadMessage}</p>
            )}
            {uploadStatus === 'idle' && (
              <p className="text-sm text-gray-600">
                録音が完了すると自動的にサーバーに保存されます
              </p>
            )}
          </div>
          {transcription && (
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">文字起こし結果:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}