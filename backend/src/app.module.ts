import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SkillSheetModule } from './modules/skill-sheet/skill-sheet.module';
import { InterviewModule } from './modules/interview/interview.module';
import { AudioModule } from './modules/audio/audio.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'interview_db',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, connection }: any) => {
        if (req) {
          // HTTP リクエスト
          return { req };
        }
        // WebSocket 接続（connectionParams から構築した req を使用）
        return { req: connection?.context?.req };
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            const { connectionParams } = context;
            if (connectionParams?.authToken) {
              // connectionParamsのトークンをreqヘッダーに変換
              context.req = {
                headers: {
                  authorization: `Bearer ${connectionParams.authToken}`,
                },
              };
            }
          },
        },
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => {
            if (connectionParams?.authToken) {
              return {
                req: {
                  headers: {
                    authorization: `Bearer ${connectionParams.authToken}`,
                  },
                },
              };
            }
          },
        },
      },
    }),

    // Feature modules
    AuthModule,
    UserModule,
    SkillSheetModule,
    InterviewModule,
    AudioModule,
  ],
})
export class AppModule {}