require('dotenv').config({ path: '.env' });
const { DataSource } = require('typeorm');
const path = require('path');

async function testResolverDirectly() {
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
      logging: false,
    });

    await dataSource.initialize();
    console.log('✅ データベース接続成功');

    // Import services
    const { InterviewService } = require('./dist/modules/interview/interview.service');
    const { InterviewResolver } = require('./dist/modules/interview/interview.resolver');

    const interviewSessionRepo = dataSource.getRepository('interview_sessions');
    const interviewQuestionRepo = dataSource.getRepository('interview_questions'); 
    const interviewAnswerRepo = dataSource.getRepository('interview_answers');

    const service = new InterviewService(
      interviewSessionRepo,
      interviewQuestionRepo,
      interviewAnswerRepo
    );

    const resolver = new InterviewResolver(service, null); // null for WebSocketSubscriptionsService

    const sessionId = '8ea6fa92-1386-4396-beaa-97e97e96d9b2';
    const questionId = '51dc066c-801d-406d-8fc3-b016ee33386f';
    const userId = 'aa301635-f1ec-4bc1-a04c-7590c167faef';

    console.log('\n🧪 Testing resolver directly...');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Question ID: ${questionId}`);
    console.log(`User ID: ${userId}`);

    // Create input object that mimics GraphQL input
    const input = {
      sessionId: sessionId,
      questionId: questionId
    };

    // Create user object that mimics the CurrentUser decorator
    const user = {
      id: userId
    };

    console.log('\n📋 Input object:', JSON.stringify(input, null, 2));
    console.log('👤 User object:', JSON.stringify(user, null, 2));

    // Call the resolver method directly
    const response = await resolver.completeAnswer(input, user);
    
    console.log('\n🎉 Success! Response:');
    console.log('📝 Is Interview Complete:', response.isInterviewComplete);
    console.log('💬 Message:', response.message);
    if (response.nextQuestion) {
      console.log('➡️ Next Question Order:', response.nextQuestion.orderNumber);
      console.log('❓ Next Question:', response.nextQuestion.question.substring(0, 50) + '...');
    }

    await dataSource.destroy();
    console.log('\n🏁 テスト完了');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    console.error(error.stack);
  }
}

testResolverDirectly();