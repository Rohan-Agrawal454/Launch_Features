// Contentstack Launch Redeploy Script (Node.js)
// Usage: node redeploy.js

const DEPLOY_URL = 'https://launch-api.contentstack.com/manage/deploy/6984612f8a13740c53417fc8';

async function triggerRedeploy() {
  try {
    console.log('🚀 Triggering Contentstack Launch redeploy...');
    
    const response = await fetch(DEPLOY_URL, {
      method: 'POST'
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`\n📊 Response Status: ${status} ${statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('✅ Redeploy triggered successfully!');
        console.log('Response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('✅ Redeploy triggered successfully!');
        console.log('(No JSON response body)');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Redeploy failed!');
      console.error('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error triggering redeploy:', error.message);
  }
}

triggerRedeploy();
