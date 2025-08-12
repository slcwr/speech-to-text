import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSessionIdColumn1754910327108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename column from session_id to sessionId
        await queryRunner.query(`ALTER TABLE "interview_questions" RENAME COLUMN "session_id" TO "sessionId"`);
        
        // Drop old indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_session_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_order"`);
        
        // Create new indexes with correct column name
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_sessionId" ON "interview_questions" ("sessionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_order" ON "interview_questions" ("sessionId", "question_order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rename column back from sessionId to session_id
        await queryRunner.query(`ALTER TABLE "interview_questions" RENAME COLUMN "sessionId" TO "session_id"`);
        
        // Drop new indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_sessionId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_order"`);
        
        // Recreate old indexes
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_session_id" ON "interview_questions" ("session_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_order" ON "interview_questions" ("session_id", "question_order")`);
    }

}
