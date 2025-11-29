// Simple test script to reproduce POST /accessories
// Usage: node test_post_accessory.js

const payload = {
  assetType: 'USB-C Cable',
  modelNumber: 'USB-C-1M',
  brandMake: 'Anker',
  serialNumber: 'ACC-SN-001',
  barcode: 'ACC-BC-001',
  quantity: 5,
  status: 'On-Stock',
  location: 'Storage Room',
  comments: 'Added via test script',
  attachments: [],
};

async function main() {
  try {
    const res = await fetch('http://localhost:4000/accessories', {
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
