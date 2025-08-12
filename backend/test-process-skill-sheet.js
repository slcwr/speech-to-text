const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testProcessSkillSheet() {
  const apiKey = 'AIzaSyBFuSPeWegFBmro_rhKml3BjNMNtiQZPdw';
  const filePath = '/workspaces/speech-to-text/backend/uploads/227d69ca7ecd1ca899d8bf1886ad5b1e.csv';
  
  try {
    console.log('Testing skill sheet processing...');
    
    // 1. Read the file
    console.log('Reading file:', filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log('File content length:', fileContent.length);
    console.log('First 500 chars:', fileContent.substring(0, 500));
    
    // 2. Analyze with Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
以下の日本のスキルシート（CSVフォーマット）を分析して、JSON形式で情報を抽出してください。
このスキルシートには個人情報、保有技術、プロジェクト経験などが含まれています。
情報が見つからない場合は、空の配列または適切なデフォルト値を使用してください。

有効なJSONオブジェクトのみを返してください。以下の構造に従ってください：

{
  "technical_skills": ["スキル1", "スキル2", ...],
  "experience_years": 数値（経験年数、不明な場合は0）,
  "projects": [
    {
      "name": "プロジェクト名",
      "role": "役割",
      "technologies": ["使用技術"],
      "duration_months": 期間（月数）
    }
  ],
  "strengths": ["強み・得意分野"],
  "weaknesses": ["課題・改善点"],
  "problem_solving": {
    "approach": "問題解決アプローチ",
    "examples": [],
    "methodologies": ["開発手法"],
    "collaboration_style": "チーム作業スタイル"
  },
  "certifications": ["保有資格"],
  "education": "学歴",
  "languages": ["日本語", "英語など"]
}

注意：
- 「保有技術」セクションから技術スキルを抽出
- プロジェクト経験が明記されていれば抽出、なければ空配列
- 年齢から概算の経験年数を推定可能
- 情報が不明な場合は適切なデフォルト値を使用

スキルシート内容:
${fileContent}
`;
    
    console.log('\nSending to Gemini for analysis...');
    console.log('Prompt length:', prompt.length);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Gemini response received!');
    console.log('Response length:', text.length);
    console.log('First 500 chars of response:', text.substring(0, 500));
    
    // Parse JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('\nCleaned text (first 500 chars):', cleanedText.substring(0, 500));
    
    try {
      const analysisResult = JSON.parse(cleanedText);
      console.log('\n✅ JSON parsed successfully!');
      console.log('Analysis result:', JSON.stringify(analysisResult, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      console.error('Full cleaned text:', cleanedText);
    }
    
  } catch (error) {
    console.error('❌ Processing failed!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testProcessSkillSheet();