import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../trpc/router';
import { createContext } from '../../../trpc/context';

// Next.js API routeハンドラー
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}:`,
            error,
          );
        }
      : undefined,
});

// WebSocketでの接続は必要に応じて追加
// import { applyWSSHandler } from '@trpc/server/adapters/ws';
// import { createServer } from 'http';
// import { parse } from 'url';
// import next from 'next';
// import ws from 'ws';