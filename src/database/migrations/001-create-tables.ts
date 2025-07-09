import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1700000000001 implements MigrationInterface {
  name = 'CreateTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "name" character varying(100) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create skill_sheets table
    await queryRunner.query(`
      CREATE TABLE "skill_sheets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "file_path" character varying(500) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "skill_data" jsonb NOT NULL,
        "analysis_status" character varying(20) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_skill_sheets" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_skill_sheets_analysis_status" CHECK (
          "analysis_status" IN ('pending', 'processing', 'completed', 'failed')
        )
      )
    `);

    // Create interview_sessions table
    await queryRunner.query(`
      CREATE TABLE "interview_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "skill_sheet_id" uuid NOT NULL,
        "session_status" character varying(20) NOT NULL DEFAULT 'pending',
        "started_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_interview_sessions_status" CHECK (
          "session_status" IN ('pending', 'in_progress', 'completed', 'cancelled')
        )
      )
    `);

    // Create interview_questions table
    await queryRunner.query(`
      CREATE TABLE "interview_questions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "session_id" uuid NOT NULL,
        "question_type" character varying(20) NOT NULL,
        "question_order" integer NOT NULL,
        "question_data" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_questions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_interview_questions_type" CHECK (
          "question_type" IN ('self_introduction', 'motivation', 'technical', 'reverse')
        )
      )
    `);

    // Create interview_answers table
    await queryRunner.query(`
      CREATE TABLE "interview_answers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "question_id" uuid NOT NULL,
        "answer_data" jsonb NOT NULL,
        "answer_status" character varying(20) NOT NULL DEFAULT 'in_progress',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_answers" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_interview_answers_status" CHECK (
          "answer_status" IN ('in_progress', 'completed', 'failed')
        )
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "skill_sheets" 
      ADD CONSTRAINT "FK_skill_sheets_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "interview_sessions" 
      ADD CONSTRAINT "FK_interview_sessions_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "interview_sessions" 
      ADD CONSTRAINT "FK_interview_sessions_skill_sheet_id" 
      FOREIGN KEY ("skill_sheet_id") REFERENCES "skill_sheets"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "interview_questions" 
      ADD CONSTRAINT "FK_interview_questions_session_id" 
      FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "interview_answers" 
      ADD CONSTRAINT "FK_interview_answers_question_id" 
      FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE
    `);

    // Create indexes
    // Basic indexes
    await queryRunner.query(`CREATE INDEX "IDX_skill_sheets_user_id" ON "skill_sheets" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_skill_sheets_analysis_status" ON "skill_sheets" ("analysis_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_user_id" ON "interview_sessions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_skill_sheet_id" ON "interview_sessions" ("skill_sheet_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_status" ON "interview_sessions" ("session_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_questions_session_id" ON "interview_questions" ("session_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_questions_type" ON "interview_questions" ("question_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_questions_order" ON "interview_questions" ("session_id", "question_order")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_answers_question_id" ON "interview_answers" ("question_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_interview_answers_status" ON "interview_answers" ("answer_status")`);

    // JSONB GIN indexes
    await queryRunner.query(`CREATE INDEX "IDX_skill_data_gin" ON "skill_sheets" USING GIN ("skill_data")`);
    await queryRunner.query(`CREATE INDEX "IDX_technical_skills_gin" ON "skill_sheets" USING GIN (("skill_data"->'technical_skills'))`);
    await queryRunner.query(`CREATE INDEX "IDX_problem_solving_gin" ON "skill_sheets" USING GIN (("skill_data"->'problem_solving'))`);
    await queryRunner.query(`CREATE INDEX "IDX_answer_data_gin" ON "interview_answers" USING GIN ("answer_data")`);

    // B-tree indexes for specific JSONB fields
    await queryRunner.query(`CREATE INDEX "IDX_experience_years_btree" ON "skill_sheets" ((("skill_data"->>'experience_years')::int))`);

    // Partial indexes for performance optimization
    await queryRunner.query(`
      CREATE INDEX "IDX_completed_sessions" ON "interview_sessions" ("user_id") 
      WHERE "session_status" = 'completed'
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_senior_engineers" ON "skill_sheets" ("user_id") 
      WHERE (("skill_data"->>'experience_years')::int) >= 5
    `);

    // Create trigger function for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON "users" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_skill_sheets_updated_at 
      BEFORE UPDATE ON "skill_sheets" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_interview_sessions_updated_at 
      BEFORE UPDATE ON "interview_sessions" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_interview_answers_updated_at 
      BEFORE UPDATE ON "interview_answers" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Custom constraint for reverse question limit (max 3 per session)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION check_reverse_question_limit()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.question_type = 'reverse' THEN
              IF (SELECT COUNT(*) FROM interview_questions 
                  WHERE session_id = NEW.session_id 
                  AND question_type = 'reverse') >= 3 THEN
                  RAISE EXCEPTION 'Maximum 3 reverse questions allowed per session';
              END IF;
          END IF;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER check_reverse_question_limit_trigger
      BEFORE INSERT ON "interview_questions"
      FOR EACH ROW EXECUTE FUNCTION check_reverse_question_limit();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_reverse_question_limit_trigger ON "interview_questions"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_interview_answers_updated_at ON "interview_answers"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON "interview_sessions"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_skill_sheets_updated_at ON "skill_sheets"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users"`);

    // Drop trigger functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS check_reverse_question_limit()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_senior_engineers"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_completed_sessions"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_experience_years_btree"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_answer_data_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_problem_solving_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_technical_skills_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_skill_data_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_answers_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_answers_question_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_questions_session_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_sessions_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_sessions_skill_sheet_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_sessions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_skill_sheets_analysis_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_skill_sheets_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "interview_answers" DROP CONSTRAINT IF EXISTS "FK_interview_answers_question_id"`);
    await queryRunner.query(`ALTER TABLE "interview_questions" DROP CONSTRAINT IF EXISTS "FK_interview_questions_session_id"`);
    await queryRunner.query(`ALTER TABLE "interview_sessions" DROP CONSTRAINT IF EXISTS "FK_interview_sessions_skill_sheet_id"`);
    await queryRunner.query(`ALTER TABLE "interview_sessions" DROP CONSTRAINT IF EXISTS "FK_interview_sessions_user_id"`);
    await queryRunner.query(`ALTER TABLE "skill_sheets" DROP CONSTRAINT IF EXISTS "FK_skill_sheets_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_answers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_questions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "skill_sheets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}