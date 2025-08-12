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
    let instruments, api_key, access_token;

    // Handle both JSON and form data
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // JSON format
      const body = JSON.parse(event.body);
      instruments = body.instruments;
      api_key = body.api_key;
      access_token = body.access_token;
    } else {
      // Form data format
      const params = new URLSearchParams(event.body);
      instruments = params.get('instruments');
      api_key = params.get('api_key');
      access_token = params.get('access_token');
    }
    
    console.log('Fetching quotes for:', {
      instruments: instruments?.substring(0, 50) + '...',
      api_key: api_key?.substring(0, 8) + '...',
      access_token: access_token ? 'provided' : 'missing'
    });

    // Validate inputs
    if (!instruments || !api_key || !access_token) {
      throw new Error('Missing required parameters: instruments, api_key, or access_token');
    }
    
    // Call Zerodha quotes API
    const response = await fetch(`https://api.kite.trade/quote?i=${instruments}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${api_key}:${access_token}`,
        'X-Kite-Version': '3'
      }
    });
    
    const data = await response.json();
    console.log('Kite quotes response status:', response.status);
    console.log('Kite quotes response:', data);
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Kite quotes error:', error);
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