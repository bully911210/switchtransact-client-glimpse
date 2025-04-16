// Simple test script to check the API directly

const API_KEY = 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b';
const API_URL = 'https://app.switchtransact.com/api/1.0/workflow/people/details';

// Test with different authorization header formats
async function testAPI() {
  console.log('Testing API with different authorization formats...');
  
  // Test 1: Plain API key
  try {
    console.log('\nTest 1: Using plain API key');
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: '7608210157080',
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      })
    });
    
    console.log('Status:', response1.status, response1.statusText);
    if (response1.ok) {
      const data = await response1.json();
      console.log('Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Failed with status', response1.status);
    }
  } catch (error) {
    console.error('Error in Test 1:', error.message);
  }
  
  // Test 2: Bearer token
  try {
    console.log('\nTest 2: Using Bearer token');
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: '7608210157080',
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      })
    });
    
    console.log('Status:', response2.status, response2.statusText);
    if (response2.ok) {
      const data = await response2.json();
      console.log('Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Failed with status', response2.status);
    }
  } catch (error) {
    console.error('Error in Test 2:', error.message);
  }
  
  // Test 3: Basic auth
  try {
    console.log('\nTest 3: Using Basic auth');
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: '7608210157080',
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      })
    });
    
    console.log('Status:', response3.status, response3.statusText);
    if (response3.ok) {
      const data = await response3.json();
      console.log('Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Failed with status', response3.status);
    }
  } catch (error) {
    console.error('Error in Test 3:', error.message);
  }
  
  // Test 4: No auth header, just API key in URL
  try {
    console.log('\nTest 4: Using API key in URL');
    const response4 = await fetch(`${API_URL}?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: '7608210157080',
        record: true,
        subscriptions: true,
        bank_accounts: false,
        transactions: false
      })
    });
    
    console.log('Status:', response4.status, response4.statusText);
    if (response4.ok) {
      const data = await response4.json();
      console.log('Success! Response data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Failed with status', response4.status);
    }
  } catch (error) {
    console.error('Error in Test 4:', error.message);
  }
}

// Run the tests
testAPI().then(() => console.log('Tests completed'));
