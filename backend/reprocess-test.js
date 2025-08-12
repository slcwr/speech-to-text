const { SkillSheetService } = require('./dist/modules/skill-sheet/skill-sheet.service');
const { GeminiService } = require('./dist/modules/gemini/gemini.service');
const { ConfigService } = require('@nestjs/config');
const { DataSource } = require('typeorm');

async function reprocessFailedSkillSheet() {
  try {
    // Setup database connection
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'interview_db',
      entities: ['./dist/database/entities/*.entity.js'],
      synchronize: false,
    });

    await dataSource.initialize();
    console.log('Database connected');

    // Setup services
    const configService = new ConfigService({
      GEMINI_API_KEY: 'AIzaSyBFuSPeWegFBmro_rhKml3BjNMNtiQZPdw',
      GEMINI_MODEL: 'gemini-2.0-flash',
    });

    const geminiService = new GeminiService(configService);
    
    const skillSheetRepository = dataSource.getRepository('skill_sheets');
    const sessionRepository = dataSource.getRepository('interview_sessions');
    const questionRepository = dataSource.getRepository('interview_questions');
    
    const skillSheetService = new SkillSheetService(
      skillSheetRepository,
      sessionRepository,
      questionRepository,
      geminiService
    );

    // Find the failed skill sheet
    const skillSheetId = 'b7ad7171-6044-4782-b393-47c6ffee42ac';
    const session = await sessionRepository.findOne({
      where: { skill_sheet_id: skillSheetId },
    });

    if (!session) {
      console.error('No session found for skill sheet');
      return;
    }

    console.log('Found session:', session.id);
    console.log('Starting reprocessing...');

    // Reprocess
    await skillSheetService.processSkillSheet(skillSheetId, session.id);

    console.log('Reprocessing completed!');

    // Check status
    const updatedSkillSheet = await skillSheetRepository.findOne({
      where: { id: skillSheetId },
    });

    console.log('New status:', updatedSkillSheet.analysis_status);

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

reprocessFailedSkillSheet();