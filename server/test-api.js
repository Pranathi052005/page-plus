import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 15000 // wait up to 15s for the slow/timeout tests
});

const testUrls = [
  { name: '1. Standard Reachable (Google)', url: 'https://www.google.com' },
  { name: '2. Large Page (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Main_Page' },
  { name: '3. Redirect URL (http to https)', url: 'http://wikipedia.org' },
  { name: '4. Non-HTML URL (PDF file)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { name: '5. Unreachable Domain', url: 'https://dnsfailcheckdomain.xyz' },
  { name: '6. SSL Certificate Failure', url: 'https://self-signed.badssl.com/' },
  { name: '7. Timeout URL (>10s delay)', url: 'https://httpbin.org/delay/11' }
];

async function runTests() {
  console.log('=== STARTING BACKEND INTEGRATION TESTS ===\n');

  for (const item of testUrls) {
    console.log(`Testing: ${item.name}`);
    console.log(`Target:  ${item.url}`);
    
    try {
      const response = await api.post('/api/audit', { url: item.url });
      const data = response.data;

      console.log(`Response Status: ${response.status}`);
      console.log(`Success Indicator: ${data.success}`);
      if (data.success) {
        console.log(`Health Score: ${data.healthScore}/100`);
        console.log(`Response Time: ${data.responseTimeMs}ms`);
        console.log(`Page Title: ${data.metrics.title?.text}`);
        console.log(`Word Count: ${data.metrics.wordCount?.value}`);
        console.log(`Final URL: ${data.finalUrl}`);
        if (data.deductions.length > 0) {
          console.log(`Deductions:`, data.deductions.map(d => `${d.metric} (-${d.value}): ${d.reason}`));
        }
      } else {
        console.log(`Error Type: ${data.errorType}`);
        console.log(`Error Message: ${data.errorMessage}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`HTTP Error Code: ${error.response.status}`);
        console.log(`Response Payload:`, error.response.data);
      } else {
        console.log(`Request Exception: ${error.message}`);
      }
    }
    console.log('\n-----------------------------------------\n');
  }

  console.log('=== INTEGRATION TESTS COMPLETE ===');
}

runTests();
