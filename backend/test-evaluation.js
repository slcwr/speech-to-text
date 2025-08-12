const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module.js');

async function testEvaluationReport() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const interviewService = app.get('InterviewService');
  
  try {
    console.log('Generating evaluation report for session: 82b5c997-5561-4535-9f18-72a0ad8483dd');
    const report = await interviewService.generateEvaluationReport('82b5c997-5561-4535-9f18-72a0ad8483dd');
    console.log('✅ Evaluation report generated successfully:');
    console.log('Report ID:', report.id);
    console.log('Overall Score:', report.overallScore);
    console.log('Recommendation Grade:', report.recommendationGrade);
    console.log('Technical Scores:', report.technicalScores);
    console.log('Soft Skills Scores:', report.softSkillsScores);
  } catch (error) {
    console.error('❌ Error generating evaluation report:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await app.close();
  }
}

testEvaluationReport();