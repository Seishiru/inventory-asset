// Quick test script to check if activity logs are being saved
const fetch = require('node-fetch');

async function testActivityLog() {
  try {
    console.log('Fetching activity logs from backend...');
    const response = await fetch('http://localhost:4000/activity-log');
    
    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText);
      return;
    }
    
    const logs = await response.json();
    console.log(`\nFound ${logs.length} activity log(s):\n`);
    
    logs.forEach((log, index) => {
      console.log(`[${index + 1}] ${log.type} - ${log.action}`);
      console.log(`    User: ${log.username}`);
      console.log(`    Details: ${log.details || 'N/A'}`);
      console.log(`    Timestamp: ${log.timestamp}`);
      console.log(`    EquipmentAssetId: ${log.equipmentAssetId || 'N/A'}`);
      console.log(`    AccessoryAssetId: ${log.accessoryAssetId || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testActivityLog();
