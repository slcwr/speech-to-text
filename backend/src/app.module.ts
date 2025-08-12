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
      context: ({ req }) => ({ req }),
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      // デバッグ用のプラグイン
      plugins: [
        {
          async requestDidStart() {
            return {
              async willSendResponse(requestContext) {
                // completeAnswer mutationのリクエストをログ出力
                if (requestContext.request.operationName === 'CompleteAnswer') {
                  console.log('=== GraphQL Request Debug ===');
                  console.log('Operation:', requestContext.request.operationName);
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

    // Feature modules
    AuthModule,
    UserModule,
    SkillSheetModule,
    InterviewModule,
  ],
})
export class AppModule {}