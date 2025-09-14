const http = require('http');

const url = process.env.HEROKU_APP_URL; // set in Config Vars
const interval = 25 * 60 * 1000; // 25 minutes

if (!url) {
  console.error("HEROKU_APP_URL not set in Config Vars");
  process.exit(1);
}

setInterval(() => {
  http.get(url, (res) => {
    console.log(`Pinged ${url} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Ping error:', err.message);
  });
}, interval);

console.log(`Ping bot started. Pinging every 25 minutes: ${url}`);
