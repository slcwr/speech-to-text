import { router } from './trpc';
import { userRouter } from './routers/user';
import { skillSheetRouter } from './routers/skillSheet';
import { interviewRouter } from './routers/interview';

/**
 * メインtRPCルーター
 * 全てのサブルーターを統合
 */
export const appRouter = router({
  user: userRouter,
  skillSheet: skillSheetRouter,
  interview: interviewRouter,
});

// 型定義をエクスポート
export type AppRouter = typeof appRouter;