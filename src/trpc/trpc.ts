import { initTRPC } from '@trpc/server';
import { Context } from './context';
import { ZodError } from 'zod';

/**
 * tRPCインスタンスの初期化
 */
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

/**
 * ルーター、プロシージャ、ミドルウェアのエクスポート
 */
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;