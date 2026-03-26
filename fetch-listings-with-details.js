const fs = require('fs');
const https = require('https');

const apiKey = '2a1eca8e84msh49b38948c7d92c3p168af6jsnbb278f742246';
const apiHost = 'realty-in-us.p.rapidapi.com';

// Function to make API requests
function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchListingsWithDetails() {
  console.log('Fetching listings with details...');

  // Load local listings
  const homesData = JSON.parse(fs.readFileSync('/Users/geofflo/Desktop/54879/holly-sells-homes/listings.json', 'utf8'));
  const housesData = JSON.parse(fs.readFileSync('/Users/geofflo/Desktop/54879/holly-sells-houses/listings.json', 'utf8'));

  // Extract listings arrays
  let homesListings = homesData.data?.home_search?.results || [];
  let housesListings = housesData.data?.home_search?.results || [];

  console.log(`Found ${homesListings.length} homes listings and ${housesListings.length} houses listings`);

  // Fetch details for each listing
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': apiHost,
    'x-rapidapi-key': apiKey
  };

  const allListings = [...homesListings, ...housesListings];

  for (let i = 0; i < allListings.length; i++) {
    const listing = allListings[i];
    try {
      console.log(`[${i + 1}/${allListings.length}] Fetching details for property ${listing.property_id}...`);
      const detailUrl = `https://${apiHost}/properties/v3/detail?property_id=${listing.property_id}`;
      const detailData = await makeRequest(detailUrl, headers);

      if (detailData.data) {
        const details = detailData.data;
        listing.property_description =
          details.description?.trim() ||
          details.remarks?.trim() ||
          details.property_description?.trim() ||
          'Beautiful property in Ave Maria, Florida.';
        console.log(`  ✓ Description: "${listing.property_description.substring(0, 50)}..."`);
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.warn(`  ✗ Error fetching details: ${error.message}`);
      listing.property_description = 'Beautiful property in Ave Maria, Florida.';
    }
  }

  // Save combined listings to files
  console.log('\nSaving updated listings files...');

  // Update individual files with descriptions
  const updatedHomesData = {
    ...homesData,
    data: {
      ...homesData.data,
      home_search: {
        ...homesData.data.home_search,
        results: homesListings
      }
    }
  };

  const updatedHousesData = {
    ...housesData,
    data: {
      ...housesData.data,
      home_search: {
        ...housesData.data.home_search,
        results: housesListings
      }
    }
  };

  fs.writeFileSync(
    '/Users/geofflo/Desktop/54879/holly-sells-homes/listings.json',
    JSON.stringify(updatedHomesData, null, 2)
  );

  fs.writeFileSync(
    '/Users/geofflo/Desktop/54879/holly-sells-houses/listings.json',
    JSON.stringify(updatedHousesData, null, 2)
  );

  // Also save a combined file if needed
  const combinedData = {
    data: {
      home_search: {
        results: allListings,
        count: allListings.length,
        total: allListings.length
      }
    }
  };

  fs.writeFileSync(
    '/Users/geofflo/Desktop/54879/all-listings.json',
    JSON.stringify(combinedData, null, 2)
  );

  console.log('✓ Successfully updated listings files with descriptions!');
  console.log(`  - Updated /holly-sells-homes/listings.json (${homesListings.length} listings)`);
  console.log(`  - Updated /holly-sells-houses/listings.json (${housesListings.length} listings)`);
  console.log(`  - Created /all-listings.json (${allListings.length} total listings)`);
}

fetchListingsWithDetails().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
