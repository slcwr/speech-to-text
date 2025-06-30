import AudioRecorder from "@/components/AudioRecorder";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Speech to Text アプリ</h1>
        <AudioRecorder />
      </div>
    </div>
  );
}
