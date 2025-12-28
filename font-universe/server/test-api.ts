
async function testEndpoints() {
  console.log('Testing Font Universe API...');

  // Test 1: Generate Text
  try {
    console.log('\n1. Testing /api/generate-text...');
    const genResponse = await fetch('http://127.0.0.1:3000/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Space exploration',
        type: 'slogan'
      })
    });
    
    if (genResponse.ok) {
      const genData = await genResponse.json();
      console.log('✅ Generate Text Success:', genData);
    } else {
      console.error('❌ Generate Text Failed:', genResponse.statusText);
    }
  } catch (error: any) {
    console.error('❌ Generate Text Error:', error.message);
  }

  // Test 2: Optimize Prompt
  try {
    console.log('\n2. Testing /api/optimize-prompt...');
    const optResponse = await fetch('http://127.0.0.1:3000/api/optimize-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Write a story about a cat',
        focus: 'creativity',
        intensity: 80
      })
    });

    if (optResponse.ok) {
      const optData = await optResponse.json();
      console.log('✅ Optimize Prompt Success:', optData);
    } else {
      console.error('❌ Optimize Prompt Failed:', optResponse.statusText);
    }
  } catch (error: any) {
    console.error('❌ Optimize Prompt Error:', error.message);
  }
}

testEndpoints();
