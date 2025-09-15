const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

const PORT = process.env.PORT || 8000;

// Import routes
let server = require('./qr');
let code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/server', server);
app.use('/code', code);

// HTML pages
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CRYPTIX-MD running on http://localhost:${PORT}`);
});

module.exports = app;
