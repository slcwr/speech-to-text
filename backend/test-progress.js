const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'interview_system',
  entities: ['dist/database/entities/*.entity.js'],
  synchronize: false,
});

async function testProgress() {
  console.log('🔍 Testing interview progress calculation...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Check existing sessions
    const sessions = await AppDataSource.query(
      'SELECT id, skill_sheet_id, session_status FROM interview_sessions ORDER BY created_at DESC LIMIT 5'
    );
    console.log('📊 Recent sessions:', sessions);

    // Check questions for first session if exists
    if (sessions.length > 0) {
      const sessionId = sessions[0].id;
      console.log(`\n🔍 Checking questions for session: ${sessionId}`);
      
      const questions = await AppDataSource.query(
        'SELECT id, question_order, question_data FROM interview_questions WHERE session_id = $1 ORDER BY question_order',
        [sessionId]
      );
      console.log('📝 Questions:', questions);

      const answers = await AppDataSource.query(
        'SELECT question_id, answer_status FROM interview_answers WHERE question_id = ANY($1::uuid[])',
        [questions.map(q => q.id)]
      );
      console.log('💬 Answers:', answers);

      // Calculate progress
      const totalQuestions = questions.length;
      const completedAnswers = answers.filter(a => a.answer_status === 'COMPLETED').length;
      const remainingQuestions = totalQuestions - completedAnswers;

      console.log('\n📊 Progress calculation:');
      console.log(`  Total questions: ${totalQuestions}`);
      console.log(`  Completed answers: ${completedAnswers}`);
      console.log(`  Remaining questions: ${remainingQuestions}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testProgress();