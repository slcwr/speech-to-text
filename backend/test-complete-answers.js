const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('http://localhost:3000/graphql');

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
  { id: '51dc066c-801d-406d-8fc3-b016ee33386f', order: 1, text: '自己紹介をお願いします。' },
  { id: '111a313d-60db-460e-8d49-9aa8539f385e', order: 2, text: '給与計算システム新規開発プロジェクトにおいて、Apollo Federationを採用した理由...' },
  { id: '0fd12507-fd1b-488a-951e-5df226ee7aa6', order: 3, text: 'SaaSシステムの機能改修プロジェクトでAtomicDesignを導入したとのことですが...' },
  { id: 'c42bd83a-26af-46d7-93ba-c581cf4518a3', order: 4, text: '複数のプロジェクトでDockerを利用されていますが...' },
  { id: '8a38304e-220d-4976-b442-7f16463ae43a', order: 5, text: 'Next.jsとReactの経験が豊富ですが...' },
  { id: 'cda568a8-6ae7-4f52-99c6-d86e1d764c55', order: 6, text: 'バックエンド開発において、NestJSとSpring Frameworkの両方を使用されていますが...' },
  { id: '13e6b66d-6227-4ef0-a43e-8c9ab6d0c727', order: 7, text: 'データベース技術として、PostgreSQL、MySQL...' },
  { id: '60dc0073-2477-4e2d-a604-8aea11c53a24', order: 8, text: 'テストフレームワークとしてJestとCypressを使用されていますが...' },
  { id: '8122e40e-09cf-469d-b5b7-1f87543abcc0', order: 9, text: 'スキルシートからは、常に新しい技術を学び...' },
  { id: '908820ae-cfcd-46ed-8c93-afed5ea96f0a', order: 10, text: 'チーム開発において、ドキュメント作成や心理的安全性の確保に貢献...' },
  { id: '727b3d40-1632-4939-aeeb-7257529ae512', order: 11, text: 'これまでのプロジェクト経験の中で、最もやりがいを感じたプロジェクト...' },
  { id: '530cf29d-8ed5-4c5e-a63f-7efd9f450db3', order: 12, text: 'これまでのご経験を活かして、弊社ではどのような貢献ができるとお考えですか？' }
];

const sessionId = '8ea6fa92-1386-4396-beaa-97e97e96d9b2';

async function testAllQuestions() {
  console.log('🚀 面接質問回答テスト開始');
  console.log(`セッションID: ${sessionId}`);
  console.log(`質問数: ${questions.length}`);
  console.log('=' * 60);

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    try {
      console.log(`\n📝 質問 ${question.order}/12: ${question.text.substring(0, 50)}...`);
      
      const response = await client.request(COMPLETE_ANSWER_MUTATION, {
        input: {
          sessionId: sessionId,
          questionId: question.id
        }
      });
      
      if (response.completeAnswer.isInterviewComplete) {
        console.log('✅ 面接が完了しました！');
        console.log(`メッセージ: ${response.completeAnswer.message}`);
        break;
      } else {
        console.log('✅ 回答完了');
        if (response.completeAnswer.nextQuestion) {
          console.log(`次の質問: ${response.completeAnswer.nextQuestion.question.substring(0, 80)}...`);
          console.log(`次の質問順序: ${response.completeAnswer.nextQuestion.orderNumber}`);
        }
        console.log(`メッセージ: ${response.completeAnswer.message}`);
      }
      
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ エラー - 質問 ${question.order}:`);
      console.error('Error message:', error.message);
      if (error.response?.errors) {
        console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
      }
      break;
    }
  }
  
  console.log('\n🏁 テスト完了');
}

testAllQuestions().catch(console.error);