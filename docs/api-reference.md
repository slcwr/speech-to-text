# API Reference

## 概要

このドキュメントでは、面接システムのtRPC APIの使用方法を説明します。

## 基本的な使用方法

```typescript
import { trpc } from '../utils/trpc';

// クエリ（データ取得）
const result = trpc.namespace.methodName.useQuery(input);

// ミューテーション（データ変更）
const mutation = trpc.namespace.methodName.useMutation();
```

## ユーザー管理 API (`trpc.user`)

### `user.create`
新しいユーザーを作成します。

```typescript
const createUser = trpc.user.create.useMutation();

// 使用例
const user = await createUser.mutateAsync({
  email: 'user@example.com',
  name: 'Test User'
});
```

**Input:**
```typescript
{
  email: string;    // メールアドレス（必須）
  name: string;     // ユーザー名（必須、1-100文字）
}
```

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
```

### `user.getById`
IDでユーザーを取得します。

```typescript
const user = trpc.user.getById.useQuery({
  user_id: '123e4567-e89b-12d3-a456-426614174000'
});
```

### `user.getByEmail`
メールアドレスでユーザーを取得します。

```typescript
const user = trpc.user.getByEmail.useQuery({
  email: 'user@example.com'
});
```

## スキルシート管理 API (`trpc.skillSheet`)

### `skillSheet.upload`
スキルシートファイルをアップロードします。

```typescript
const uploadSkillSheet = trpc.skillSheet.upload.useMutation();

const skillSheet = await uploadSkillSheet.mutateAsync({
  user_id: 'user-uuid',
  file_path: '/uploads/skillsheet.pdf',
  file_name: 'skillsheet.pdf'
});
```

**Input:**
```typescript
{
  user_id: string;      // ユーザーID（UUID）
  file_path: string;    // ファイルパス
  file_name: string;    // ファイル名
}
```

### `skillSheet.analyze`
スキルシートを解析して結果を保存します。

```typescript
const analyzeSkillSheet = trpc.skillSheet.analyze.useMutation();

const result = await analyzeSkillSheet.mutateAsync({
  skill_sheet_id: 'skillsheet-uuid',
  analyzed_data: {
    technical_skills: ['React', 'TypeScript', 'Node.js'],
    experience_years: 3,
    projects: [{
      name: 'ECサイト構築',
      role: 'フロントエンドエンジニア',
      technologies: ['React', 'Redux'],
      duration_months: 6
    }],
    strengths: ['UI/UX設計', 'チームワーク'],
    weaknesses: ['インフラ知識', 'テスト設計'],
    problem_solving: {
      approach: '論理的思考を重視し、問題を細分化',
      examples: [{
        situation: 'レガシーシステムの性能問題',
        task: 'ページ読み込み時間を50%短縮',
        action: 'コード分析→ボトルネック特定→最適化',
        result: '3秒→1.5秒に改善、UX向上'
      }],
      methodologies: ['PDCA', '5W1H', 'ロジックツリー'],
      collaboration_style: 'チームでのブレインストーミング'
    }
  }
});
```

### `skillSheet.getById`
IDでスキルシートを取得します。

```typescript
const skillSheet = trpc.skillSheet.getById.useQuery({
  skill_sheet_id: 'skillsheet-uuid'
});
```

### `skillSheet.getByUserId`
ユーザーIDでスキルシートを取得します。

```typescript
const skillSheets = trpc.skillSheet.getByUserId.useQuery({
  user_id: 'user-uuid'
});
```

## 面接管理 API (`trpc.interview`)

### セッション管理

#### `interview.createSession`
面接セッションを作成します。

```typescript
const createSession = trpc.interview.createSession.useMutation();

const session = await createSession.mutateAsync({
  user_id: 'user-uuid',
  skill_sheet_id: 'skillsheet-uuid'
});
```

#### `interview.getSession`
面接セッションを取得します。

```typescript
const session = trpc.interview.getSession.useQuery({
  session_id: 'session-uuid'
});
```

#### `interview.startSession`
面接セッションを開始します。

```typescript
const startSession = trpc.interview.startSession.useMutation();

const session = await startSession.mutateAsync({
  session_id: 'session-uuid'
});
```

#### `interview.completeSession`
面接セッションを完了します。

```typescript
const completeSession = trpc.interview.completeSession.useMutation();

const session = await completeSession.mutateAsync({
  session_id: 'session-uuid'
});
```

### 質問管理

#### `interview.createQuestion`
面接質問を作成します。

```typescript
const createQuestion = trpc.interview.createQuestion.useMutation();

const question = await createQuestion.mutateAsync({
  session_id: 'session-uuid',
  question_type: 'technical',
  question_order: 1,
  question_data: {
    text: 'あなたの得意な技術について教えてください。',
    duration_seconds: 30,
    metadata: {
      difficulty: 'medium',
      category: 'technical_skills',
      based_on_skills: ['React', 'TypeScript']
    }
  }
});
```

#### `interview.getQuestions`
セッションの質問を取得します。

```typescript
const questions = trpc.interview.getQuestions.useQuery({
  session_id: 'session-uuid'
});
```

#### `interview.getQuestionsByType`
質問タイプ別に質問を取得します。

```typescript
const questions = trpc.interview.getQuestionsByType.useQuery({
  session_id: 'session-uuid',
  question_type: 'technical'
});
```

### 回答管理

#### `interview.createAnswer`
面接回答を作成します。

```typescript
const createAnswer = trpc.interview.createAnswer.useMutation();

const answer = await createAnswer.mutateAsync({
  question_id: 'question-uuid',
  answer_data: {
    text: '私の得意な技術はReactです。3年間の開発経験があり...',
    confidence_score: 0.95,
    transcription_segments: [{
      start_time: 0.0,
      end_time: 2.5,
      text: '私の得意な技術はReactです',
      confidence: 0.98
    }],
    audio_metadata: {
      duration_seconds: 120,
      sample_rate: 44100,
      channels: 1
    },
    analysis: {
      key_points: ['React経験3年', 'フロントエンド開発'],
      sentiment: 'positive',
      fluency_score: 0.85,
      problem_solving_indicators: ['論理的思考', '具体的事例']
    }
  }
});
```

#### `interview.updateAnswer`
面接回答を更新します。

```typescript
const updateAnswer = trpc.interview.updateAnswer.useMutation();

const answer = await updateAnswer.mutateAsync({
  answer_id: 'answer-uuid',
  answer_data: {
    text: '更新されたテキスト'
  },
  answer_status: 'completed'
});
```

#### `interview.getAnswerByQuestionId`
質問IDで回答を取得します。

```typescript
const answer = trpc.interview.getAnswerByQuestionId.useQuery({
  question_id: 'question-uuid'
});
```

#### `interview.getAnswersBySessionId`
セッションIDで回答を取得します。

```typescript
const answers = trpc.interview.getAnswersBySessionId.useQuery({
  session_id: 'session-uuid'
});
```

## エラーハンドリング

### エラーコード

- `NOT_FOUND`: リソースが見つからない
- `CONFLICT`: データの競合（例：重複するメールアドレス）
- `BAD_REQUEST`: 不正なリクエスト
- `INTERNAL_SERVER_ERROR`: サーバーエラー

### エラーハンドリング例

```typescript
const createUser = trpc.user.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'CONFLICT') {
      alert('このメールアドレスは既に使用されています');
    } else {
      alert('エラーが発生しました: ' + error.message);
    }
  },
  onSuccess: (user) => {
    console.log('ユーザー作成成功:', user);
  }
});
```

## 面接フロー実装例

```typescript
const InterviewFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string>();

  // セッション作成
  const createSession = trpc.interview.createSession.useMutation({
    onSuccess: (session) => {
      setSessionId(session.id);
      setCurrentStep(1);
    }
  });

  // 質問取得
  const questions = trpc.interview.getQuestions.useQuery(
    { session_id: sessionId! },
    { enabled: !!sessionId }
  );

  // 回答作成
  const createAnswer = trpc.interview.createAnswer.useMutation({
    onSuccess: () => {
      setCurrentStep(currentStep + 1);
    }
  });

  const handleStartInterview = () => {
    createSession.mutateAsync({
      user_id: 'user-uuid',
      skill_sheet_id: 'skillsheet-uuid'
    });
  };

  const handleAnswer = (answerData: any) => {
    createAnswer.mutateAsync({
      question_id: questions.data?.[currentStep - 1]?.id!,
      answer_data: answerData
    });
  };

  return (
    <div>
      {currentStep === 0 && (
        <button onClick={handleStartInterview}>
          面接を開始
        </button>
      )}
      
      {currentStep > 0 && questions.data && (
        <div>
          <h3>質問 {currentStep}</h3>
          <p>{questions.data[currentStep - 1]?.question_data.text}</p>
          {/* 音声録音コンポーネント */}
          <AudioRecorder onAnswer={handleAnswer} />
        </div>
      )}
    </div>
  );
};
```

## 型定義の活用

```typescript
import { RouterOutputs } from '../utils/trpc';

// 型を抽出して使用
type User = RouterOutputs['user']['getById'];
type SkillSheet = RouterOutputs['skillSheet']['getById'];
type InterviewSession = RouterOutputs['interview']['getSession'];

// コンポーネントで使用
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

---

この API Reference により、面接システムの全機能を型安全に利用できます。