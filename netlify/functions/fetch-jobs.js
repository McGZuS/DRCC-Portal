const GHL_TOKEN = 'pit-40e675a1-c57f-4f50-8958-7c234c273313';
const GHL_VERSION = '2021-07-28';
const LOCATION_ID = 'j0HO2JPPof9rG52GRAFg';
const PIPELINE_ID = '8jfxwqFFb2hE3xymNq4A';

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { token } = JSON.parse(event.body || '{}');
    if (!token) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No token' }) };

    const resp = await fetch(
      'https://services.leadconnectorhq.com/opportunities/search?location_id=' + LOCATION_ID + '&pipeline_id=' + PIPELINE_ID + '&limit=100',
      {
        headers: {
          'Authorization': 'Bearer ' + GHL_TOKEN,
          'Version': GHL_VERSION,
          'Accept': 'application/json'
        }
      }
    );

    if (!resp.ok) throw new Error('GHL error: ' + resp.status);
    const data = await resp.json();
    const opps = data.opportunities || [];

    const matched = opps.filter(function(o) {
      const email = (o.contact && o.contact.email) || o.contactEmail || '';
      return email.toLowerCase() === token.toLowerCase();
    });

    if (!matched.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'No projects found' }) };
    }

    const contact = matched[0].contact || {};
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        contactName: contact.name || 'Valued Partner',
        contactEmail: contact.email || token,
        jobs: matched
      })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
