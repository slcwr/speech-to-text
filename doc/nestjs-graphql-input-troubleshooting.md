# NestJS GraphQL Input Type プロパティが空になる問題の解決ガイド

## 問題の概要

NestJS GraphQLで`@InputType()`を使用したDTOクラスのプロパティが、リゾルバーで正しく受信されない問題が発生しました。

### 症状
```typescript
// フロントエンドから正常に送信
Variables: {
  "input": {
    "sessionId": "82b5c997-5561-4535-9f18-72a0ad8483dd",
    "questionId": "b12d8997-ad24-4b39-93ca-55c6324bef5d"
  }
}

// バックエンドで空のオブジェクトとして受信される
Args received - raw input: CompleteAnswerInput {}
Input object keys: []
Has sessionId property? false
Has questionId property? false
```

## 根本原因

### 1. GraphQLスキーマ生成時の型情報不足
NestJSのGraphQLモジュールが、TypeScriptの型メタデータから正しくGraphQLスキーマを生成できていなかった。

### 2. class-transformerの型変換失敗
ValidationPipeによる型変換プロセスで、プロパティの型情報が正しく解釈されていなかった。

### 3. リゾルバー引数の型推論の曖昧さ
`@Args()`デコレータで明示的な型指定が不足していた。

## 解決方法

### 1. DTOクラスの強化

**修正前:**
```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CompleteAnswerInput {
  @Field({ nullable: false })
  sessionId: string;

  @Field({ nullable: false })
  questionId: string;
}
```

**修正後:**
```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CompleteAnswerInput {
  @Field(() => String, { nullable: false, description: 'Session ID' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @Field(() => String, { nullable: false, description: 'Question ID' })
  @IsNotEmpty()
  @IsString()
  questionId: string;
}
```

**変更点:**
- `@Field(() => String)` - 明示的な型ファクトリー関数を追加
- `@IsNotEmpty()`, `@IsString()` - バリデーションデコレータを追加
- `description` - フィールドの説明を追加（オプション）

### 2. リゾルバーの引数型指定

**修正前:**
```typescript
@Mutation(() => CompleteAnswerResponse, { name: 'completeAnswer' })
async completeAnswer(
  @Args('input') input: CompleteAnswerInput,
  @CurrentUser() user: User,
): Promise<CompleteAnswerResponse>
```

**修正後:**
```typescript
@Mutation(() => CompleteAnswerResponse, { name: 'completeAnswer' })
async completeAnswer(
  @Args('input', { type: () => CompleteAnswerInput }) input: CompleteAnswerInput,
  @CurrentUser() user: User,
): Promise<CompleteAnswerResponse>
```

**変更点:**
- `{ type: () => CompleteAnswerInput }` - 明示的な型ファクトリー関数を追加

### 3. ValidationPipeの確認

`main.ts`で以下の設定が有効になっていることを確認：

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,  // 重要: プレーンオブジェクトをクラスインスタンスに変換
}));
```

## 技術的背景

### TypeScriptメタデータの制限

TypeScriptのデコレータメタデータには以下の制限があります：

1. **型消去**: コンパイル時に型情報が失われる場合がある
2. **プリミティブ型の曖昧性**: `string`型が`String`コンストラクタとして反映される
3. **実行時推論の限界**: 複雑な型の推論が失敗する可能性

### NestJS GraphQLの型推論メカニズム

```typescript
// NestJSの内部処理（簡略化）
class GraphQLSchemaBuilder {
  buildFieldType(metadata) {
    // 型関数が提供されていない場合
    if (!metadata.typeFunc) {
      // Reflectメタデータから推論を試みる
      const type = Reflect.getMetadata('design:type', target, propertyKey);
      // この推論が失敗すると、フィールドが正しく生成されない
    }
    
    // 型関数が提供されている場合（推奨）
    if (metadata.typeFunc) {
      // 明示的な型情報を使用
      return metadata.typeFunc();
    }
  }
}
```

## デバッグ手法

### 1. GraphQL スキーマの確認
生成された`schema.gql`ファイルで、Inputタイプが正しく定義されているかを確認：

```graphql
input CompleteAnswerInput {
  """Question ID"""
  questionId: String!

  """Session ID"""
  sessionId: String!
}
```

### 2. リクエストログの追加
GraphQLモジュールにデバッグ用プラグインを追加：

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  // ...
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse(requestContext) {
            if (requestContext.request.operationName === 'CompleteAnswer') {
              console.log('=== GraphQL Request Debug ===');
              console.log('Variables:', JSON.stringify(requestContext.request.variables, null, 2));
              console.log('Query:', requestContext.request.query);
              console.log('=============================');
            }
          },
        };
      },
    },
  ],
}),
```

### 3. リゾルバーでの詳細ログ
```typescript
async completeAnswer(
  @Args('input', { type: () => CompleteAnswerInput }) input: CompleteAnswerInput,
  @CurrentUser() user: User,
): Promise<CompleteAnswerResponse> {
  console.log('Input received:', input);
  console.log('Input keys:', Object.keys(input || {}));
  console.log('sessionId:', input?.sessionId);
  console.log('questionId:', input?.questionId);
  
  // 処理続行...
}
```

## 予防策

### 1. 明示的な型指定の徹底
```typescript
// ✅ 推奨: 明示的な型ファクトリー
@Field(() => String)
property: string;

// ❌ 避ける: 型推論に依存
@Field()
property: string;
```

### 2. バリデーションの追加
```typescript
@Field(() => String)
@IsNotEmpty({ message: 'sessionId is required' })
@IsString({ message: 'sessionId must be a string' })
sessionId: string;
```

### 3. テストケースの作成
```typescript
describe('CompleteAnswerInput', () => {
  it('should validate input correctly', async () => {
    const input = new CompleteAnswerInput();
    input.sessionId = 'test-session';
    input.questionId = 'test-question';
    
    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });
});
```

## 関連する既知の問題

1. **NestJS v8/v9の互換性**: 一部のバージョンで型推論の動作が異なる場合がある
2. **TypeScript strictモード**: `strict: true`の場合、より厳密な型チェックが必要
3. **GraphQL Code Firstアプローチ**: Schema Firstと比べて型情報の伝達が複雑

## 参考資料

- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [TypeScript Decorator Metadata](https://www.typescriptlang.org/docs/handbook/decorators.html)

## 更新履歴

- 2025-08-12: 初版作成
- 問題発生プロジェクト: interview-system-frontend/backend
- 解決者: Claude Code Assistant