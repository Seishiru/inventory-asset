const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: 'localhost', port: 4000, path, timeout: 3000 }, res => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', d => out += d);
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    }).on('error', err => reject(err));
  });
}

(async () => {
  try {
    const endpoints = ['/loginuser', '/assets', '/accessories', '/brands'];
    for (const ep of endpoints) {
      try {
        const r = await get(ep);
        console.log(`=== ${ep} (status=${r.status}) ===`);
        console.log(r.body);
      } catch (e) {
        console.error(`Error fetching ${ep}:`, e.message);
      }
    }
  } catch (e) {
    console.error(e);
  }
})();
