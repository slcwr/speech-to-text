const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = 'AIzaSyBFuSPeWegFBmro_rhKml3BjNMNtiQZPdw';
  
  try {
    console.log('Testing Gemini API connection...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = 'こんにちは。これはテストメッセージです。簡単に返事してください。';
    
    console.log('Sending test prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API test successful!');
    console.log('Response:', text);
    
    // Test JSON generation
    console.log('\nTesting JSON generation...');
    const jsonPrompt = `
    次のJSON形式で簡単なデータを返してください：
    {
      "status": "success",
      "message": "テスト成功"
    }
    `;
    
    const jsonResult = await model.generateContent(jsonPrompt);
    const jsonResponse = await jsonResult.response;
    const jsonText = jsonResponse.text();
    
    console.log('Raw JSON response:', jsonText);
    
    // Try to parse JSON
    const cleanedText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    console.log('✅ JSON parsing successful:', parsed);
    
  } catch (error) {
    console.error('❌ Gemini API test failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGeminiAPI();