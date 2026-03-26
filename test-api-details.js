const https = require('https');

const apiKey = '2a1eca8e84msh49b38948c7d92c3p168af6jsnbb278f742246';
const apiHost = 'realty-in-us.p.rapidapi.com';
const propertyId = '6127912483'; // First property

const url = `https://${apiHost}/properties/v3/detail?property_id=${propertyId}`;

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-rapidapi-host': apiHost,
    'x-rapidapi-key': apiKey
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Response Structure:');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('Error parsing response:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
