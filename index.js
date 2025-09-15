const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

const PORT = process.env.PORT || 8000;

// Import your bot routes
let server = require('./qr');
let code = require('./pair'); // this is your backend pairing router

require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/server', server);
app.use('/pair', code); // pairing API (from pair.js)

// Serve frontend pages
app.get('/pair-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html')); // frontend page
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
