import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEvaluationReportTable1754910327109 implements MigrationInterface {
  name = 'CreateEvaluationReportTable1754910327109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create recommendation_grade enum type
    await queryRunner.query(`
      CREATE TYPE "recommendation_grade_enum" AS ENUM('A', 'B', 'C', 'D', 'E')
    `);

    // Create evaluation_reports table
    await queryRunner.query(`
      CREATE TABLE "evaluation_reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "technical_scores" jsonb NOT NULL,
        "soft_skills_scores" jsonb NOT NULL,
        "answer_quality_scores" jsonb NOT NULL,
        "experience_evaluation" jsonb NOT NULL,
        "overall_score" decimal(3,1) NOT NULL,
        "recommendation_grade" "recommendation_grade_enum" NOT NULL,
        "strengths" text array NOT NULL,
        "areas_for_improvement" text array NOT NULL,
        "detailed_feedback" text NOT NULL,
        "recommended_positions" text array NOT NULL,
        "ai_analysis_metadata" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluation_reports" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint to interview_sessions
    await queryRunner.query(`
      ALTER TABLE "evaluation_reports" 
      ADD CONSTRAINT "FK_evaluation_reports_session_id" 
      FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE
    `);

    // Add index on session_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_evaluation_reports_session_id" ON "evaluation_reports" ("session_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_evaluation_reports_session_id"`);
    await queryRunner.query(`DROP TABLE "evaluation_reports"`);
    await queryRunner.query(`DROP TYPE "recommendation_grade_enum"`);
  }
}