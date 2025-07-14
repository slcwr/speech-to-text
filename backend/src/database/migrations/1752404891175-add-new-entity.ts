import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntity1752404891175 implements MigrationInterface {
    name = 'AddNewEntity1752404891175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "interview_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "answer_data" jsonb NOT NULL, "answer_status" character varying(20) NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_0d741e704f77dee5309bf554f9" UNIQUE ("question_id"), CONSTRAINT "PK_b29d79de5cfb62e8ca9376d96a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_answer_data_gin" ON "interview_answers" ("answer_data") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_answers_status" ON "interview_answers" ("answer_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_answers_question_id" ON "interview_answers" ("question_id") `);
        await queryRunner.query(`CREATE TABLE "interview_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "question_type" character varying(20) NOT NULL, "question_order" integer NOT NULL, "question_data" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ef2c099d8bc521e9b89e986b3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_order" ON "interview_questions" ("session_id", "question_order") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_type" ON "interview_questions" ("question_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_questions_session_id" ON "interview_questions" ("session_id") `);
        await queryRunner.query(`CREATE TABLE "interview_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "skill_sheet_id" uuid NOT NULL, "session_status" character varying(20) NOT NULL DEFAULT 'pending', "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8289f4ee665d0b5e283345db49a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_completed_sessions" ON "interview_sessions" ("user_id") WHERE session_status = 'completed'`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_status" ON "interview_sessions" ("session_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_skill_sheet_id" ON "interview_sessions" ("skill_sheet_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_sessions_user_id" ON "interview_sessions" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "skill_sheets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "file_path" character varying(500) NOT NULL, "file_name" character varying(255) NOT NULL, "skill_data" jsonb NOT NULL, "analysis_status" character varying(20) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_67f3e0dee14925cfcd2059de3f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_senior_engineers" ON "skill_sheets" ("user_id") WHERE ((skill_data->>'experience_years')::int) >= 5`);
        await queryRunner.query(`CREATE INDEX "IDX_experience_years_btree" ON "skill_sheets" ("skill_data") `);
        await queryRunner.query(`CREATE INDEX "IDX_problem_solving_gin" ON "skill_sheets" ("skill_data") `);
        await queryRunner.query(`CREATE INDEX "IDX_technical_skills_gin" ON "skill_sheets" ("skill_data") `);
        await queryRunner.query(`CREATE INDEX "IDX_skill_data_gin" ON "skill_sheets" ("skill_data") `);
        await queryRunner.query(`CREATE INDEX "IDX_skill_sheets_analysis_status" ON "skill_sheets" ("analysis_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_skill_sheets_user_id" ON "skill_sheets" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "role" character varying(20) NOT NULL DEFAULT 'user', "lastLoginAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "interview_answers" ADD CONSTRAINT "FK_0d741e704f77dee5309bf554f9d" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview_questions" ADD CONSTRAINT "FK_b0a3ea46612c6e0edd495a231d4" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview_sessions" ADD CONSTRAINT "FK_256af682c73f96827ea2927f99d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview_sessions" ADD CONSTRAINT "FK_d3745cea15d32550ae855829695" FOREIGN KEY ("skill_sheet_id") REFERENCES "skill_sheets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skill_sheets" ADD CONSTRAINT "FK_bfe8c4e5ad68e057546860e7f13" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "skill_sheets" DROP CONSTRAINT "FK_bfe8c4e5ad68e057546860e7f13"`);
        await queryRunner.query(`ALTER TABLE "interview_sessions" DROP CONSTRAINT "FK_d3745cea15d32550ae855829695"`);
        await queryRunner.query(`ALTER TABLE "interview_sessions" DROP CONSTRAINT "FK_256af682c73f96827ea2927f99d"`);
        await queryRunner.query(`ALTER TABLE "interview_questions" DROP CONSTRAINT "FK_b0a3ea46612c6e0edd495a231d4"`);
        await queryRunner.query(`ALTER TABLE "interview_answers" DROP CONSTRAINT "FK_0d741e704f77dee5309bf554f9d"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_skill_sheets_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_skill_sheets_analysis_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_skill_data_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_technical_skills_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_problem_solving_gin"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_experience_years_btree"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_senior_engineers"`);
        await queryRunner.query(`DROP TABLE "skill_sheets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_sessions_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_sessions_skill_sheet_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_sessions_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_completed_sessions"`);
        await queryRunner.query(`DROP TABLE "interview_sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_questions_session_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_questions_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_questions_order"`);
        await queryRunner.query(`DROP TABLE "interview_questions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_answers_question_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_answers_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_answer_data_gin"`);
        await queryRunner.query(`DROP TABLE "interview_answers"`);
    }

}
