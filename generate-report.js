const { execSync } = require('child_process');

const mutation = `
mutation {
  generateEvaluationReport(input: { sessionId: "82b5c997-5561-4535-9f18-72a0ad8483dd" }) {
    id
    sessionId
    overallScore
    recommendationGrade
    technicalScores {
      frontend
      backend
      database
      infrastructure
      architecture
    }
    softSkillsScores {
      communication
      problemSolving
      teamwork
      leadership
      learning
    }
  }
}
`;

const query = JSON.stringify({ query: mutation });

console.log('Sending GraphQL mutation to generate evaluation report...');

try {
  const result = execSync(`curl -X POST http://localhost:3000/graphql -H "Content-Type: application/json" -d '${query}'`, { encoding: 'utf8' });
  
  console.log('Response:', result);
} catch (error) {
  console.error('Error:', error.message);
}