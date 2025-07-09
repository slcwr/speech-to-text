import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { AppDataSource } from '../database/data-source';

/**
 * tRPCコンテキストの作成
 * リクエストごとに実行される
 */
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