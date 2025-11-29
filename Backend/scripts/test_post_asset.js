// Simple test script to reproduce POST /assets
// Usage: node test_post_asset.js

const payload = {
  assetType: 'Laptop',
  brandMake: 'Apple',
  modelNumber: 'MBP-16-2025',
  serialNumber: 'SN-TEST-12345',
  barcode: 'BC-TEST-12345',
  description: 'Test asset created by script',
  status: 'On-Stock',
  location: 'Office - Test Desk',
  userName: 'Jane Doe',
  image: undefined,
  attachments: [],
  comments: [],
};

async function main() {
  try {
    const res = await fetch('http://localhost:4000/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Request failed:', err);
  }
}

main();
