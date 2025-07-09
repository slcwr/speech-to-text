# tRPC導入・設定ガイド

## 概要

このドキュメントでは、面接システムにtRPCを導入する際の設定手順を説明します。

tRPCを使用することで、TypeScriptでフルスタックの型安全なAPIを構築できます。

## 1. パッケージインストール

### 必要なパッケージ

```bash
npm install @trpc/server @trpc/client @trpc/next @trpc/react-query @tanstack/react-query zod superjson
```

### 各パッケージの役割

- `@trpc/server` - サーバーサイドのtRPCルーター
- `@trpc/client` - クライアントサイドのtRPCクライアント
- `@trpc/next` - Next.js統合
- `@trpc/react-query` - React Queryとの統合
- `@tanstack/react-query` - データフェッチング・キャッシュ
- `zod` - スキーマバリデーション
- `superjson` - 日付などのシリアライゼーション

## 2. プロジェクト構造

```
src/
├── shared/
│   ├── types.ts           # 共通型定義
│   └── schemas.ts         # Zodスキーマ
├── trpc/
│   ├── context.ts         # tRPCコンテキスト
│   ├── trpc.ts           # tRPCインスタンス
│   ├── router.ts         # メインルーター
│   └── routers/
│       ├── user.ts       # ユーザー管理
│       ├── skillSheet.ts # スキルシート
│       └── interview.ts  # 面接管理
├── pages/
│   ├── _app.tsx          # Next.jsアプリ設定
│   ├── index.tsx         # サンプルページ
│   └── api/
│       └── trpc/
│           └── [trpc].ts # tRPC APIルート
└── utils/
    └── trpc.ts           # クライアント設定
```

## 3. 設定ファイル

### 3.1 共通型定義 (`src/shared/types.ts`)

```typescript
// 面接システムで使用する共通型を定義
export interface SkillData {
  technical_skills: string[];
  experience_years: number;
  problem_solving: {
    approach: string;
    examples: ProblemSolvingExample[];
    methodologies: string[];
    collaboration_style: string;
  };
  // ... その他の型
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
```

### 3.2 Zodスキーマ (`src/shared/schemas.ts`)

```typescript
import { z } from 'zod';

// バリデーション用のスキーマ定義
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const skillDataSchema = z.object({
  technical_skills: z.array(z.string()),
  experience_years: z.number().min(0).max(50),
  problem_solving: z.object({
    approach: z.string(),
    examples: z.array(z.object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string(),
    })),
    methodologies: z.array(z.string()),
    collaboration_style: z.string(),
  }),
});
```

### 3.3 tRPCコンテキスト (`src/trpc/context.ts`)

```typescript
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { AppDataSource } from '../database/data-source';

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // データベース接続の初期化
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return {
    req,
    res,
    db: AppDataSource,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
```

### 3.4 tRPCインスタンス (`src/trpc/trpc.ts`)

```typescript
import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
```

### 3.5 ルーター例 (`src/trpc/routers/user.ts`)

```typescript
import { router, procedure } from '../trpc';
import { createUserSchema, userResponseSchema } from '../../shared/schemas';
import { User } from '../../database/entities/user.entity';

export const userRouter = router({
  create: procedure
    .input(createUserSchema)
    .output(userResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const userRepository = ctx.db.getRepository(User);
      const user = userRepository.create(input);
      return await userRepository.save(user);
    }),

  getById: procedure
    .input(z.object({ user_id: z.string().uuid() }))
    .output(userResponseSchema)
    .query(async ({ input, ctx }) => {
      const userRepository = ctx.db.getRepository(User);
      return await userRepository.findOne({
        where: { id: input.user_id }
      });
    }),
});
```

### 3.6 メインルーター (`src/trpc/router.ts`)

```typescript
import { router } from './trpc';
import { userRouter } from './routers/user';
import { skillSheetRouter } from './routers/skillSheet';
import { interviewRouter } from './routers/interview';

export const appRouter = router({
  user: userRouter,
  skillSheet: skillSheetRouter,
  interview: interviewRouter,
});

export type AppRouter = typeof appRouter;
```

### 3.7 Next.js APIルート (`src/pages/api/trpc/[trpc].ts`)

```typescript
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../trpc/router';
import { createContext } from '../../../trpc/context';

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path}:`, error);
        }
      : undefined,
});
```

### 3.8 クライアント設定 (`src/utils/trpc.ts`)

```typescript
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../trpc/router';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});
```

### 3.9 Next.jsアプリ設定 (`src/pages/_app.tsx`)

```typescript
import { AppType } from 'next/app';
import { trpc } from '../utils/trpc';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);
```

## 4. 使用方法

### 4.1 基本的な使用方法

```typescript
import { trpc } from '../utils/trpc';

// コンポーネント内での使用
const MyComponent = () => {
  // クエリ（データ取得）
  const user = trpc.user.getById.useQuery({ user_id: '123' });
  
  // ミューテーション（データ変更）
  const createUser = trpc.user.create.useMutation();
  
  const handleCreateUser = async () => {
    try {
      const newUser = await createUser.mutateAsync({
        email: 'test@example.com',
        name: 'Test User'
      });
      console.log('User created:', newUser);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {user.data ? (
        <p>User: {user.data.name}</p>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
};
```

### 4.2 面接システムでの使用例

```typescript
// スキルシート解析
const analyzeSkillSheet = trpc.skillSheet.analyze.useMutation({
  onSuccess: (result) => {
    console.log('Analysis complete:', result.skill_data.problem_solving);
  }
});

// 面接セッション開始
const startInterview = trpc.interview.startSession.useMutation({
  onSuccess: (session) => {
    console.log('Interview started:', session.id);
  }
});

// 質問取得
const questions = trpc.interview.getQuestions.useQuery({
  session_id: sessionId
});
```

## 5. 開発時の注意点

### 5.1 型安全性の確保

- `input`と`output`のスキーマを必ず定義
- Zodスキーマでバリデーション
- TypeScriptの型推論を活用

### 5.2 エラーハンドリング

```typescript
// カスタムエラーの投げ方
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'User not found',
});
```

### 5.3 パフォーマンス

- `useQuery`の`enabled`オプションを活用
- 適切なキャッシュ設定
- バッチリクエストの活用

## 6. 開発・デプロイ

### 6.1 開発サーバー起動

```bash
npm run dev
```

### 6.2 型チェック

```bash
npm run type-check
```

### 6.3 ビルド

```bash
npm run build
```

## 7. トラブルシューティング

### 7.1 よくある問題

- **型エラー**: スキーマと実際のデータが一致しない
- **接続エラー**: データベース接続の問題
- **バリデーションエラー**: Zodスキーマの設定ミス

### 7.2 デバッグ方法

```typescript
// 開発環境でのログ出力
onError: ({ path, error }) => {
  console.error(`❌ tRPC failed on ${path}:`, error);
}
```

## 8. 今後の拡張

### 8.1 WebSocketサポート

リアルタイム音声処理のためのWebSocket統合

### 8.2 認証の追加

セッション管理とユーザー認証

### 8.3 ファイルアップロード

スキルシートのファイルアップロード機能

---

このドキュメントに従って設定すれば、型安全なtRPCベースのAPIが構築できます。