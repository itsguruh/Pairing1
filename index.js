const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

__path = process.cwd();

require('events').EventEmitter.defaultMaxListeners = 500;

// Routers
let server = require('./qr');
let code = require('./pair');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Backend API routes
app.use('/server', server);
app.use('/code', code);
app.use('/api/pair', code);   // pairing backend (JSON)

// ✅ Frontend pages
app.use('/pair', (req, res) => {
  res.sendFile(__path + '/pair.html'); // frontend page with colors + music
});

app.use('/qr', (req, res) => {
  res.sendFile(__path + '/qr.html');
});

app.use('/', (req, res) => {
  res.sendFile(__path + '/main.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`
Don't Forget To Give Star ⭐ CRYPTIX MD

✅ Server running on http://localhost:${PORT}
  `);
});

module.exports = app;
