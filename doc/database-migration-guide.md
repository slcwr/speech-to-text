# データベーススキーマ更新手順

## 1. エンティティの変更・追加

### 新しいエンティティの追加
```typescript
// src/database/entities/new-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('new_entities')
export class NewEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;
}
```

### 既存エンティティの修正
```typescript
// 例: カラムの追加
@Field({ nullable: true })
@Column({ type: 'varchar', length: 255, nullable: true })
description: string;
```

## 2. エンティティのエクスポート更新

```typescript
// src/database/entities/index.ts
export { User } from './user.entity';
export { SkillSheet } from './skill-sheet.entity';
export { NewEntity } from './new-entity.entity'; // 追加
```

## 3. データソースの更新

```typescript
// src/database/data-source.ts
import { User, SkillSheet, NewEntity } from './entities';

export const AppDataSource = new DataSource({
  // ...
  entities: [
    User,
    SkillSheet,
    NewEntity, // 追加
  ],
});
```

## 4. マイグレーションファイルの生成

### 開発環境での手順

```bash
# 1. マイグレーションファイル生成
npm run typeorm migration:generate -- src/database/migrations/003-add-new-entity -d src/database/data-source.ts

# 2. 生成されたファイルの確認・修正
# ファイル名の修正 (数字から始まるクラス名を修正)
```

### 生成されたマイグレーションファイルの修正例

```typescript
// src/database/migrations/1234567890-003-add-new-entity.ts
import { MigrationInterface, QueryRunner } from "typeorm";

// ❌ 間違い: 数字から始まるクラス名
export class 003AddNewEntity1234567890 implements MigrationInterface {

// ✅ 正しい: 英字から始まるクラス名
export class AddNewEntity1234567890 implements MigrationInterface {
    name = 'AddNewEntity1234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "new_entities" ...`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "new_entities"`);
    }
}
```

## 5. マイグレーションの実行

```bash
# 開発環境
npm run migration:run

# 本番環境 (慎重に実行)
NODE_ENV=production npm run migration:run
```

## 6. マイグレーションの確認

```bash
# 実行済みマイグレーションの確認
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "SELECT * FROM migrations ORDER BY id;"

# テーブル構造の確認
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "\dt"
```

## 7. アプリケーションの更新

### モジュールの作成・更新
```typescript
// src/modules/new-entity/new-entity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewEntity } from '../../database/entities/new-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewEntity])],
  // ...
})
export class NewEntityModule {}
```

### AppModuleへの追加
```typescript
// src/app.module.ts
import { NewEntityModule } from './modules/new-entity/new-entity.module';

@Module({
  imports: [
    // ...
    NewEntityModule, // 追加
  ],
})
export class AppModule {}
```

## 8. 開発環境での代替手順 (schema:sync)

**⚠️ 開発環境のみ使用**

```bash
# 1. 既存データのバックアップ (必要に応じて)
PGPASSWORD=postgres pg_dump -U postgres -h localhost interview_db > backup.sql

# 2. スキーマ同期
npm run typeorm schema:sync -- -d src/database/data-source.ts

# 3. 確認
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "\dt"
```

## 9. マイグレーションのロールバック

```bash
# 最新のマイグレーションを取り消し
npm run migration:revert

# 特定のマイグレーションまでロールバック
npm run typeorm migration:revert -- -d src/database/data-source.ts
```

## 10. 本番環境での注意事項

### 事前準備
1. **データベースのバックアップ**
2. **マイグレーションファイルのレビュー**
3. **ステージング環境での動作確認**

### 実行手順
```bash
# 1. アプリケーションの停止
pm2 stop app

# 2. データベースバックアップ
pg_dump -U postgres -h localhost interview_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. マイグレーション実行
NODE_ENV=production npm run migration:run

# 4. 動作確認
npm run typeorm migration:show -- -d src/database/data-source.ts

# 5. アプリケーションの起動
pm2 start app
```

## 11. トラブルシューティング

### マイグレーション失敗時
```bash
# 失敗したマイグレーションの確認
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "SELECT * FROM migrations;"

# 手動でマイグレーションレコードを削除 (注意して実行)
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "DELETE FROM migrations WHERE name = 'FailedMigration';"
```

### データベース接続エラー
```bash
# データベースの確認
PGPASSWORD=postgres psql -U postgres -h localhost -l

# 接続テスト
PGPASSWORD=postgres psql -U postgres -h localhost -d interview_db -c "SELECT version();"
```

## 12. ベストプラクティス

### ✅ 推奨事項
- **本番環境では必ずマイグレーションを使用**
- **マイグレーション前に必ずバックアップ**
- **ステージング環境で事前テスト**
- **マイグレーションファイルはバージョン管理に含める**

### ❌ 避けるべき事項
- **本番環境での `schema:sync` 使用**
- **マイグレーションファイルの直接編集**
- **データ損失の可能性がある変更の無計画実行**

## 13. 環境別設定

### 開発環境
```typescript
// .env.development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=interview_db
NODE_ENV=development
```

### 本番環境
```typescript
// .env.production
DB_HOST=production-db-host
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_NAME=interview_db
NODE_ENV=production
```

この手順に従うことで、安全で確実なデータベーススキーマの更新が可能になります。