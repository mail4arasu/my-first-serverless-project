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
    let request_token, api_key, api_secret;

    // Handle both JSON and form data
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      // JSON format
      const { request_token: rt, api_key: ak, api_secret: as } = JSON.parse(event.body);
      request_token = rt;
      api_key = ak;
      api_secret = as;
    } else {
      // Form data format
      const params = new URLSearchParams(event.body);
      request_token = params.get('request_token');
      api_key = params.get('api_key');
      api_secret = params.get('api_secret');
    }
    
    console.log('Generating access token for:', {
      request_token: request_token?.substring(0, 10) + '...',
      api_key: api_key?.substring(0, 8) + '...',
      api_secret: api_secret ? 'provided' : 'missing'
    });

    // Validate inputs
    if (!request_token || !api_key || !api_secret) {
      throw new Error('Missing required parameters: request_token, api_key, or api_secret');
    }

    if (api_key.length < 6) {
      throw new Error(`api_key too short: ${api_key.length} characters (need 6+)`);
    }
    
    // Call Zerodha API with form data
    const response = await fetch('https://api.kite.trade/session/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_key: api_key,
        api_secret: api_secret,
        request_token: request_token
      })
    });
    
    const data = await response.json();
    console.log('Kite API response status:', response.status);
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
    console.error('Token generation error:', error);
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