import { router, procedure } from '../trpc';
import { createUserSchema, getUserSchema, userResponseSchema } from '../../shared/schemas';
import { User } from '../../database/entities/user.entity';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  create: procedure
    .input(createUserSchema)
    .output(userResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const userRepository = ctx.db.getRepository(User);
      
      // 既存ユーザーチェック
      const existingUser = await userRepository.findOne({
        where: { email: input.email }
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }
      
      // 新規ユーザー作成
      const user = userRepository.create(input);
      const savedUser = await userRepository.save(user);
      
      return savedUser;
    }),

  getById: procedure
    .input(getUserSchema)
    .output(userResponseSchema)
    .query(async ({ input, ctx }) => {
      const userRepository = ctx.db.getRepository(User);
      
      const user = await userRepository.findOne({
        where: { id: input.user_id }
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      return user;
    }),

  getByEmail: procedure
    .input(createUserSchema.pick({ email: true }))
    .output(userResponseSchema)
    .query(async ({ input, ctx }) => {
      const userRepository = ctx.db.getRepository(User);
      
      const user = await userRepository.findOne({
        where: { email: input.email }
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      return user;
    }),
});