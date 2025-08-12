const { GraphQLClient } = require('graphql-request');

// 有効なJWTトークンを直接使用（先ほどのセッションから取得）
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhMzAxNjM1LWYxZWMtNGJjMS1hMDRjLTc1OTBjMTY3ZmFlZiIsImVtYWlsIjoiZW1haWxAZW1haS5jby5qcCIsImlhdCI6MTczNDUxNzM2NywiZXhwIjoxNzM0NTIwOTY3fQ.2I7fIFOz3JJfUHTEfHWTN5qw8_rHCnqdRd9vX_WRYhI'; // 期限切れの可能性あり

const client = new GraphQLClient('http://localhost:3000/graphql', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const COMPLETE_ANSWER_MUTATION = `
  mutation CompleteAnswer($input: CompleteAnswerInput!) {
    completeAnswer(input: $input) {
      nextQuestion {
        id
        sessionId
        question
        orderNumber
        metadata
        createdAt
        updatedAt
      }
      isInterviewComplete
      message
    }
  }
`;

const questions = [
  '51dc066c-801d-406d-8fc3-b016ee33386f',
  '111a313d-60db-460e-8d49-9aa8539f385e', 
  '0fd12507-fd1b-488a-951e-5df226ee7aa6',
  'c42bd83a-26af-46d7-93ba-c581cf4518a3',
  '8a38304e-220d-4976-b442-7f16463ae43a',
  'cda568a8-6ae7-4f52-99c6-d86e1d764c55',
  '13e6b66d-6227-4ef0-a43e-8c9ab6d0c727',
  '60dc0073-2477-4e2d-a604-8aea11c53a24',
  '8122e40e-09cf-469d-b5b7-1f87543abcc0',
  '908820ae-cfcd-46ed-8c93-afed5ea96f0a',
  '727b3d40-1632-4939-aeeb-7257529ae512',
  '530cf29d-8ed5-4c5e-a63f-7efd9f450db3'
];

const sessionId = '8ea6fa92-1386-4396-beaa-97e97e96d9b2';

async function testCompleteAnswers() {
  console.log('🚀 面接質問回答テスト開始');
  console.log(`セッションID: ${sessionId}`);
  console.log(`質問数: ${questions.length}`);
  console.log('='.repeat(60));
  
  for (let i = 0; i < questions.length; i++) {
    const questionId = questions[i];
    
    try {
      console.log(`\n📝 質問 ${i + 1}/12を処理中...`);
      console.log(`質問ID: ${questionId.substring(0, 8)}...`);
      
      const response = await client.request(COMPLETE_ANSWER_MUTATION, {
        input: {
          sessionId: sessionId,
          questionId: questionId
        }
      });
      
      if (response.completeAnswer.isInterviewComplete) {
        console.log('🎉✨ 面接が完了しました！✨🎉');
        console.log(`📝 最終メッセージ: ${response.completeAnswer.message}`);
        console.log(`🏆 全 ${i + 1} 問の質問に回答完了`);
        break;
      } else {
        console.log('✅ 回答完了');
        if (response.completeAnswer.nextQuestion) {
          console.log(`➡️  次の質問順序: ${response.completeAnswer.nextQuestion.orderNumber}`);
          console.log(`❓ 次の質問: ${response.completeAnswer.nextQuestion.question.substring(0, 50)}...`);
        }
        console.log(`💬 メッセージ: ${response.completeAnswer.message}`);
      }
      
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ エラー - 質問 ${i + 1}:`);
      console.error(`エラーメッセージ: ${error.message}`);
      if (error.response?.errors) {
        console.error(`GraphQLエラー:`, error.response.errors.map(e => e.message));
        // もしトークンエラーなら停止
        if (error.response.errors.some(e => e.extensions?.code === 'UNAUTHENTICATED')) {
          console.error('🚫 認証エラー。テストを中断します。');
          break;
        }
      }
      continue;
    }
  }
  
  console.log('\n🏁 テスト完了');
}

testCompleteAnswers().catch(console.error);