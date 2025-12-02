import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

async function checkModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    const freeModels = data.data.filter(m => 
      m.pricing.prompt === "0" || m.id.includes('free')
    );
    
    console.log('\n🆓 Available FREE models:\n');
    freeModels.forEach(m => {
      console.log(`- ${m.id}`);
    });
    
    if (freeModels.length > 0) {
      console.log('\n✅ Recommended:', freeModels[0].id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkModels();
