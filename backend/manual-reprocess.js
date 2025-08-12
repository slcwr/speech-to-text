require('dotenv').config({ path: '.env' });
const { DataSource } = require('typeorm');
const path = require('path');

async function manualReprocess() {
  try {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'interview_db',
      entities: [
        path.join(__dirname, 'dist/database/entities/*.entity.js')
      ],
      synchronize: false,
      logging: true,
    });

    await dataSource.initialize();
    console.log('Database connected');

    // Get the skill sheet and session
    const skillSheetId = 'b7ad7171-6044-4782-b393-47c6ffee42ac';
    
    const skillSheet = await dataSource.query(
      `SELECT * FROM skill_sheets WHERE id = $1`,
      [skillSheetId]
    );
    console.log('Skill sheet:', skillSheet[0]);

    const session = await dataSource.query(
      `SELECT * FROM interview_sessions WHERE skill_sheet_id = $1`,
      [skillSheetId]
    );
    console.log('Session:', session[0]);

    if (session[0]) {
      // Trigger processing by importing and calling the service
      const { SkillSheetService } = require('./dist/modules/skill-sheet/skill-sheet.service');
      const { GeminiService } = require('./dist/modules/gemini/gemini.service');
      const { ConfigService } = require('@nestjs/config');
      
      const configService = new ConfigService({
        GEMINI_API_KEY: 'AIzaSyBFuSPeWegFBmro_rhKml3BjNMNtiQZPdw',
        GEMINI_MODEL: 'gemini-2.0-flash',
      });

      const geminiService = new GeminiService(configService);
      
      const skillSheetRepo = dataSource.getRepository('skill_sheets');
      const sessionRepo = dataSource.getRepository('interview_sessions');
      const questionRepo = dataSource.getRepository('interview_questions');
      
      const service = new SkillSheetService(
        skillSheetRepo,
        sessionRepo,
        questionRepo,
        geminiService
      );

      console.log('Starting reprocessing...');
      await service.processSkillSheet(skillSheetId, session[0].id);
      
      console.log('Processing triggered successfully');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

manualReprocess();