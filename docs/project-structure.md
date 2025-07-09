# プロジェクト構造

## ディレクトリ構成

```
speech-to-text/
├── docs/                          # ドキュメント
│   ├── trpc-setup.md             # tRPC設定ガイド
│   └── project-structure.md      # このファイル
├── src/
│   ├── shared/                   # 共通型定義・スキーマ
│   │   ├── types.ts             # TypeScript型定義
│   │   └── schemas.ts           # Zodバリデーションスキーマ
│   ├── database/                # データベース関連
│   │   ├── data-source.ts       # TypeORM設定
│   │   ├── entities/            # エンティティ定義
│   │   │   ├── user.entity.ts
│   │   │   ├── skill-sheet.entity.ts
│   │   │   ├── interview-session.entity.ts
│   │   │   ├── interview-question.entity.ts
│   │   │   └── interview-answer.entity.ts
│   │   └── migrations/          # データベースマイグレーション
│   │       └── 001-create-tables.ts
│   ├── trpc/                    # tRPC関連
│   │   ├── context.ts           # tRPCコンテキスト
│   │   ├── trpc.ts             # tRPCインスタンス
│   │   ├── router.ts           # メインルーター
│   │   └── routers/            # 機能別ルーター
│   │       ├── user.ts         # ユーザー管理
│   │       ├── skillSheet.ts   # スキルシート管理
│   │       └── interview.ts    # 面接管理
│   ├── pages/                  # Next.jsページ
│   │   ├── _app.tsx           # アプリケーション設定
│   │   ├── index.tsx          # ホームページ
│   │   └── api/               # API Routes
│   │       └── trpc/
│   │           └── [trpc].ts  # tRPC APIハンドラー
│   └── utils/                 # ユーティリティ
│       └── trpc.ts           # tRPCクライアント設定
├── .env                       # 環境変数
├── package.json              # 依存関係
├── tsconfig.json             # TypeScript設定
├── next.config.js            # Next.js設定
├── sequence.puml             # シーケンス図
├── er_diagram.puml           # ER図
└── setup-postgres.sh         # PostgreSQL設定スクリプト
```

## 各ディレクトリの役割

### `/src/shared/`
- **用途**: フロントエンドとバックエンドで共有する型定義
- **ファイル**:
  - `types.ts`: TypeScript型定義
  - `schemas.ts`: Zodバリデーションスキーマ

### `/src/database/`
- **用途**: データベース関連の設定とエンティティ
- **ファイル**:
  - `data-source.ts`: TypeORM設定
  - `entities/`: データベースエンティティ
  - `migrations/`: データベースマイグレーション

### `/src/trpc/`
- **用途**: tRPC関連の設定とルーター
- **ファイル**:
  - `context.ts`: リクエストコンテキスト
  - `trpc.ts`: tRPCインスタンス
  - `router.ts`: メインルーター
  - `routers/`: 機能別ルーター

### `/src/pages/`
- **用途**: Next.jsのページとAPIルート
- **ファイル**:
  - `_app.tsx`: アプリケーション設定
  - `index.tsx`: ホームページ
  - `api/trpc/[trpc].ts`: tRPC APIハンドラー

### `/src/utils/`
- **用途**: ユーティリティ関数とクライアント設定
- **ファイル**:
  - `trpc.ts`: tRPCクライアント設定

## 技術スタック

### フロントエンド
- **Next.js**: Reactフレームワーク
- **TypeScript**: 型安全性
- **tRPC**: 型安全なAPI通信
- **React Query**: データフェッチング・キャッシュ

### バックエンド
- **tRPC**: 型安全なAPIサーバー
- **TypeORM**: データベースORM
- **PostgreSQL**: データベース
- **Zod**: スキーマバリデーション

### 開発ツール
- **TypeScript**: 型チェック
- **ESLint**: コード品質
- **Prettier**: コードフォーマット

## データフロー

```
1. User Input (Frontend)
   ↓
2. tRPC Client (src/utils/trpc.ts)
   ↓
3. tRPC Router (src/trpc/routers/)
   ↓
4. Database Entity (src/database/entities/)
   ↓
5. PostgreSQL Database
```

## 面接システムの主要機能

### 1. ユーザー管理
- **ルーター**: `src/trpc/routers/user.ts`
- **エンティティ**: `src/database/entities/user.entity.ts`
- **機能**: ユーザー作成、取得、更新

### 2. スキルシート管理
- **ルーター**: `src/trpc/routers/skillSheet.ts`
- **エンティティ**: `src/database/entities/skill-sheet.entity.ts`
- **機能**: ファイルアップロード、GenerativeModel解析、課題解決データ保存

### 3. 面接管理
- **ルーター**: `src/trpc/routers/interview.ts`
- **エンティティ**: 
  - `src/database/entities/interview-session.entity.ts`
  - `src/database/entities/interview-question.entity.ts`
  - `src/database/entities/interview-answer.entity.ts`
- **機能**: セッション管理、質問生成、回答録音・文字化

## 開発ワークフロー

### 1. 新機能追加の流れ

```
1. 型定義追加 (src/shared/types.ts)
   ↓
2. Zodスキーマ追加 (src/shared/schemas.ts)
   ↓
3. エンティティ更新 (src/database/entities/)
   ↓
4. マイグレーション作成
   ↓
5. tRPCルーター実装 (src/trpc/routers/)
   ↓
6. フロントエンド実装 (src/pages/)
```

### 2. データベース変更の流れ

```
1. エンティティ変更
   ↓
2. マイグレーション生成
   ↓
3. マイグレーション実行
   ↓
4. 型定義更新
   ↓
5. tRPCルーター更新
```

## 設定ファイル

### TypeScript設定 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "strictPropertyInitialization": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Next.js設定 (`next.config.js`)
```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Pages routerを使用
  },
};
```

### 環境変数 (`.env`)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=interview_system

# Google AI
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 今後の拡張計画

### 1. リアルタイム音声処理
- WebSocketサポート
- ストリーミング音声処理

### 2. 認証システム
- JWT認証
- セッション管理

### 3. ファイルアップロード
- マルチパートファイル処理
- ファイルバリデーション

### 4. 面接結果分析
- 回答分析機能
- レポート生成

## 運用・監視

### 1. ログ管理
- tRPCエラーログ
- データベースクエリログ

### 2. パフォーマンス監視
- API応答時間
- データベース性能

### 3. セキュリティ
- 入力値検証
- SQLインジェクション対策

---

この構造により、型安全でスケーラブルな面接システムが構築されています。