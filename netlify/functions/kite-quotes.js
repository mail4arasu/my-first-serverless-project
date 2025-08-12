exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    const { instruments, api_key, access_token } = JSON.parse(event.body);
    
    console.log('Fetching quotes for:', instruments);
    
    const response = await fetch(`https://api.kite.trade/quote?i=${instruments}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${api_key}:${access_token}`,
        'X-Kite-Version': '3'
      }
    });
    
    const data = await response.json();
    console.log('Kite API response:', data);
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Kite API error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message,
        status: 'error'
      })
    };
  }
};
