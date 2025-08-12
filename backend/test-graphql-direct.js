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

const sessionId = '8ea6fa92-1386-4396-beaa-97e97e96d9b2';
const questionId = '51dc066c-801d-406d-8fc3-b016ee33386f';

async function testGraphQLDirectly() {
  console.log('🚀 Testing GraphQL mutation directly (no auth)');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Question ID: ${questionId}`);
  console.log('='.repeat(60));
  
  try {
    const response = await client.request(COMPLETE_ANSWER_MUTATION, {
      input: {
        sessionId: sessionId,
        questionId: questionId
      }
    });
    
    console.log('✅ Success! Response:');
    console.log('📝 Is Interview Complete:', response.completeAnswer.isInterviewComplete);
    console.log('💬 Message:', response.completeAnswer.message);
    if (response.completeAnswer.nextQuestion) {
      console.log('➡️ Next Question Order:', response.completeAnswer.nextQuestion.orderNumber);
      console.log('❓ Next Question:', response.completeAnswer.nextQuestion.question.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error:');
    console.error(`Error message: ${error.message}`);
    if (error.response?.errors) {
      console.error(`GraphQL errors:`, error.response.errors.map(e => e.message));
    }
  }
  
  console.log('\n🏁 Test complete');
}

testGraphQLDirectly().catch(console.error);