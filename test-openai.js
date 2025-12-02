// Quick test to verify OpenRouter free model works
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY || '';

console.log('\n🔍 Testing OpenRouter FREE Model (Google Gemma 2 9B)\n');
console.log('API Key present:', !!apiKey || 'Not required for free models');
if (apiKey) {
  console.log('API Key starts with:', apiKey?.substring(0, 15) + '...');
}
console.log('\n📡 Making test request to OpenRouter (FREE model)...\n');

async function testOpenRouter() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Portfolio Test'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'user', content: 'Say "Hello, test successful!"' }
        ],
        max_tokens: 50
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! AI Response:', data.choices[0].message.content);
    console.log('\n✨ OpenRouter FREE model is working correctly!');
    console.log('💰 No API costs - 100% FREE\n');
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\nPossible issues:');
    console.log('1. No internet connection');
    console.log('2. Firewall blocking OpenRouter API');
    console.log('3. Invalid API key (if provided)\n');
  }
}

testOpenRouter();
