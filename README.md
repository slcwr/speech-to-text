# Web Engineer Interview System

TypeScriptとtRPCを使用した面接システムです。スキルシートの解析から音声面接まで、一貫した面接プロセスを提供します。

## 🚀 主な機能

- **スキルシート解析**: GenerativeModel（Gemini）を使用した自動解析
- **課題解決能力評価**: STAR法に基づく問題解決スキルの抽出
- **音声面接**: リアルタイム音声文字化と分析
- **段階的面接**: 自己紹介→志望動機→技術質問→逆質問の流れ
- **型安全API**: tRPCによるEnd-to-End型安全性

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全性
- **tRPC** - 型安全なAPI通信
- **React Query** - データフェッチング・キャッシュ

### バックエンド
- **tRPC** - 型安全なAPIサーバー
- **TypeORM** - データベースORM
- **PostgreSQL** - データベース
- **Zod** - スキーマバリデーション

### AI・音声処理
- **Gemini API** - スキルシート解析
- **Web Speech API** - 音声認識
- **FFmpeg** - 音声フォーマット変換

## 📋 前提条件

- Node.js 18.0.0以上
- PostgreSQL 13以上
- NPM または Yarn

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd speech-to-text
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

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

# Next.js
NODE_ENV=development
```

### 4. PostgreSQLの設定

```bash
# PostgreSQL設定スクリプトを実行
./setup-postgres.sh

# または手動でデータベースを作成
createdb interview_system
```

### 5. マイグレーションの実行

```bash
npm run migration:run
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 📚 ドキュメント

- [tRPC設定ガイド](./docs/trpc-setup.md)
- [プロジェクト構造](./docs/project-structure.md)
- [API Reference](./docs/api-reference.md)

## 🏗️ プロジェクト構造

```
src/
├── shared/           # 共通型定義・スキーマ
├── database/         # データベース関連
├── trpc/            # tRPCルーター
├── pages/           # Next.jsページ
└── utils/           # ユーティリティ
```

## 💻 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 型チェック
npm run type-check

# マイグレーション実行
npm run migration:run

# マイグレーション戻し
npm run migration:revert
```

## 🎯 使用方法

### 1. ユーザー作成

```typescript
const createUser = trpc.user.create.useMutation();

const user = await createUser.mutateAsync({
  email: 'user@example.com',
  name: 'Test User'
});
```

### 2. スキルシート解析

```typescript
const analyzeSkillSheet = trpc.skillSheet.analyze.useMutation();

const result = await analyzeSkillSheet.mutateAsync({
  skill_sheet_id: 'uuid',
  analyzed_data: {
    technical_skills: ['React', 'TypeScript'],
    experience_years: 3,
    problem_solving: {
      approach: '論理的思考による問題解決',
      examples: [/* STAR法での事例 */],
      methodologies: ['PDCA', '5W1H']
    }
  }
});
```

### 3. 面接セッション開始

```typescript
const startInterview = trpc.interview.startSession.useMutation();

const session = await startInterview.mutateAsync({
  user_id: 'user-uuid',
  skill_sheet_id: 'skillsheet-uuid'
});
```

## 📊 データベース設計

### 主要テーブル

- **users**: ユーザー情報
- **skill_sheets**: スキルシート解析結果（課題解決データ含む）
- **interview_sessions**: 面接セッション
- **interview_questions**: 面接質問
- **interview_answers**: 面接回答

### 特徴

- **JSONB型**: 構造化データの柔軟な格納
- **GINインデックス**: 高速なJSONB検索
- **外部キー制約**: データ整合性の確保
- **部分インデックス**: パフォーマンス最適化

## 🔄 面接フロー

1. **スキルシートアップロード**
   - ファイルアップロード
   - GenerativeModelによる解析
   - 課題解決能力の抽出

2. **質問生成**
   - 自己紹介質問
   - 志望動機質問
   - 技術質問（スキルベース）
   - 逆質問（最大3つ）

3. **音声面接**
   - リアルタイム音声認識
   - 段階的な質問進行
   - 回答の自動文字化

4. **結果分析**
   - 回答内容の分析
   - 課題解決指標の抽出
   - 総合評価

## 🧪 テスト

```bash
# テスト実行（実装予定）
npm run test

# E2Eテスト（実装予定）
npm run test:e2e
```

## 🚀 デプロイ

### Vercelデプロイ

```bash
# Vercelにデプロイ
npm run build
vercel --prod
```

### Docker（予定）

```dockerfile
# Dockerfileは今後実装予定
```

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔧 トラブルシューティング

### よくある問題

1. **PostgreSQL接続エラー**
   ```bash
   # PostgreSQLサービスの確認
   sudo service postgresql status
   
   # データベースの作成
   createdb interview_system
   ```

2. **マイグレーションエラー**
   ```bash
   # マイグレーションファイルの確認
   npm run migration:run
   ```

3. **型エラー**
   ```bash
   # 型チェック実行
   npm run type-check
   ```

### サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。

---

**面接システムで効率的な採用プロセスを実現しましょう！** 🎯