import { router, procedure } from '../trpc';
import { 
  uploadSkillSheetSchema, 
  getSkillSheetSchema,
  skillSheetResponseSchema,
  skillDataSchema 
} from '../../shared/schemas';
import { SkillSheet } from '../../database/entities/skill-sheet.entity';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const skillSheetRouter = router({
  upload: procedure
    .input(uploadSkillSheetSchema)
    .output(skillSheetResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const skillSheetRepository = ctx.db.getRepository(SkillSheet);
      
      // 初期データでスキルシートを作成
      const skillSheet = skillSheetRepository.create({
        user_id: input.user_id,
        file_path: input.file_path,
        file_name: input.file_name,
        skill_data: {
          technical_skills: [],
          experience_years: 0,
          projects: [],
          strengths: [],
          weaknesses: [],
          problem_solving: {
            approach: '',
            examples: [],
            methodologies: [],
            collaboration_style: '',
          },
        },
        analysis_status: 'pending',
      });
      
      const savedSkillSheet = await skillSheetRepository.save(skillSheet);
      return savedSkillSheet;
    }),

  analyze: procedure
    .input(z.object({
      skill_sheet_id: z.string().uuid(),
      analyzed_data: skillDataSchema,
    }))
    .output(skillSheetResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const skillSheetRepository = ctx.db.getRepository(SkillSheet);
      
      const skillSheet = await skillSheetRepository.findOne({
        where: { id: input.skill_sheet_id }
      });
      
      if (!skillSheet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Skill sheet not found',
        });
      }
      
      // 解析結果を更新
      skillSheet.skill_data = input.analyzed_data;
      skillSheet.analysis_status = 'completed';
      
      const updatedSkillSheet = await skillSheetRepository.save(skillSheet);
      return updatedSkillSheet;
    }),

  getById: procedure
    .input(getSkillSheetSchema)
    .output(skillSheetResponseSchema)
    .query(async ({ input, ctx }) => {
      const skillSheetRepository = ctx.db.getRepository(SkillSheet);
      
      const skillSheet = await skillSheetRepository.findOne({
        where: { id: input.skill_sheet_id }
      });
      
      if (!skillSheet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Skill sheet not found',
        });
      }
      
      return skillSheet;
    }),

  getByUserId: procedure
    .input(z.object({ user_id: z.string().uuid() }))
    .output(z.array(skillSheetResponseSchema))
    .query(async ({ input, ctx }) => {
      const skillSheetRepository = ctx.db.getRepository(SkillSheet);
      
      const skillSheets = await skillSheetRepository.find({
        where: { user_id: input.user_id },
        order: { created_at: 'DESC' }
      });
      
      return skillSheets;
    }),

  updateAnalysisStatus: procedure
    .input(z.object({
      skill_sheet_id: z.string().uuid(),
      status: z.enum(['pending', 'processing', 'completed', 'failed']),
    }))
    .output(skillSheetResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const skillSheetRepository = ctx.db.getRepository(SkillSheet);
      
      const skillSheet = await skillSheetRepository.findOne({
        where: { id: input.skill_sheet_id }
      });
      
      if (!skillSheet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Skill sheet not found',
        });
      }
      
      skillSheet.analysis_status = input.status;
      const updatedSkillSheet = await skillSheetRepository.save(skillSheet);
      
      return updatedSkillSheet;
    }),
});