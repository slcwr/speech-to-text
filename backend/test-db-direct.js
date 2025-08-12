require('dotenv').config({ path: '.env' });
const { DataSource } = require('typeorm');
const path = require('path');

async function testCompleteAnswersViaService() {
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
    const { ConfigService } = require('@nestjs/config');

    const interviewSessionRepo = dataSource.getRepository('interview_sessions');
    const interviewQuestionRepo = dataSource.getRepository('interview_questions'); 
    const interviewAnswerRepo = dataSource.getRepository('interview_answers');

    const service = new InterviewService(
      interviewSessionRepo,
      interviewQuestionRepo,
      interviewAnswerRepo
    );

    const sessionId = '8ea6fa92-1386-4396-beaa-97e97e96d9b2';
    const userId = 'aa301635-f1ec-4bc1-a04c-7590c167faef';

    // Get all questions for the session
    const questions = await dataSource.query(`
      SELECT id, question_order, (question_data->>'text') as question_text 
      FROM interview_questions 
      WHERE "sessionId" = $1 
      ORDER BY question_order
    `, [sessionId]);

    console.log('🚀 面接質問回答テスト開始');
    console.log(`セッションID: ${sessionId}`);
    console.log(`ユーザーID: ${userId}`);
    console.log(`質問数: ${questions.length}`);
    console.log('='.repeat(60));

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        console.log(`\n📝 質問 ${question.question_order}/12を処理中...`);
        console.log(`質問: ${question.question_text.substring(0, 50)}...`);
        
        const response = await service.completeAnswer(userId, sessionId, question.id);
        
        if (response.isInterviewComplete) {
          console.log('🎉✨ 面接が完了しました！✨🎉');
          console.log(`📝 最終メッセージ: ${response.message}`);
          console.log(`🏆 全 ${question.question_order} 問の質問に回答完了`);
          break;
        } else {
          console.log('✅ 回答完了');
          if (response.nextQuestion) {
            console.log(`➡️  次の質問順序: ${response.nextQuestion.orderNumber}`);
            console.log(`❓ 次の質問: ${response.nextQuestion.question.substring(0, 50)}...`);
          }
          console.log(`💬 メッセージ: ${response.message}`);
        }
        
        // 少し待機
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ エラー - 質問 ${question.question_order}:`);
        console.error(`エラーメッセージ: ${error.message}`);
        console.error(`エラースタック:`, error.stack?.substring(0, 200) + '...');
        continue;
      }
    }

    // 最終セッションステータスを確認
    const finalSession = await dataSource.query(`
      SELECT session_status, completed_at 
      FROM interview_sessions 
      WHERE id = $1
    `, [sessionId]);

    console.log('\n📊 最終セッション状況:');
    console.log(`ステータス: ${finalSession[0]?.session_status}`);
    console.log(`完了日時: ${finalSession[0]?.completed_at}`);

    await dataSource.destroy();
    console.log('\n🏁 テスト完了');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message);
    console.error(error.stack);
  }
}

testCompleteAnswersViaService();