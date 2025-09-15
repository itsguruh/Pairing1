// pair.js (minimal fixes only)
const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    console.log(`[pair] request id=${id} number=${num || '(none)'}`);

    // Early guard: require a phone number
    if (!num) {
        return res.send({ code: "❗ Please enter your phone number first" });
    }

    async function CRYPTIX_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            // choose a browser string (unchanged)
            const items = ["Safari"];
            const randomItem = items[Math.floor(Math.random() * items.length)];

            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            // If not registered -> request pairing code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                // sanitize number (keeps digits only)
                num = (num || "").replace(/[^0-9]/g, '');
                console.log(`[pair] id=${id} sanitized number=${num}`);

                // request pairing code (may throw if Baileys fails)
                const code = await sock.requestPairingCode(num);
                console.log(`[pair] id=${id} code generated`);

                if (!res.headersSent) {
                    return res.send({ code });
                } else {
                    console.warn(`[pair] id=${id} response already sent`);
                }
            }

            // Save creds on update
            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                try {
                    const { connection, lastDisconnect } = s;
                    console.log(`[pair] id=${id} connection.update: ${connection}`);

                    if (connection === "open") {
                        console.log(`👤 ${sock.user.id} Connected ✅ Pairing success!`);

                        let rf = __dirname + `/temp/${id}/creds.json`;

                        function generateRandomText() {
                            const prefix = "3EB";
                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            let randomText = prefix;
                            for (let i = prefix.length; i < 22; i++) {
                                const randomIndex = Math.floor(Math.random() * characters.length);
                                randomText += characters.charAt(randomIndex);
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CRYPTIX MD - Pairing</title>
  <style>
    body {
      background: black;
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
    }
    img {
      width: 120px;
      margin: 20px auto;
      display: block;
      border-radius: 50%;
      box-shadow: 0 0 15px brown;
    }
    input {
      padding: 10px;
      border-radius: 8px;
      border: none;
      margin: 10px;
      width: 250px;
      text-align: center;
    }
    button {
      display: block;
      margin: 10px auto;
      background: brown;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 250px;
      transition: all 0.3s ease-in-out;
    }
    button:hover {
      background: white;
      color: black;
    }
    #result {
      margin-top: 20px;
      font-weight: bold;
      color: yellow;
    }
  </style>
</head>
<body>
  <!-- Bot Logo -->
  <img src="https://files.catbox.moe/f6q239.jpg" alt="CRYPTIX Bot">
  
  <h1>CRYPTIX MD Pairing</h1>

  <!-- Phone input + pairing button -->
  <input id="phone" type="text" placeholder="Enter phone number with country code">
  <button onclick="getCode()">Get Pairing Code</button>

  <!-- Buttons for external links -->
  <button onclick="window.open('https://github.com/itsguruh/Pairing1','_blank')">
    🌐 GitHub
  </button>
  <button onclick="window.open('https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s','_blank')">
    📢 WhatsApp Channel
  </button>
  <button onclick="window.open('https://wa.me/254105521300','_blank')">
    📞 Contact Owner
  </button>

  <!-- Result (pairing code) -->
  <div id="result"></div>

  <script>
    async function getCode() {
      const phone = document.getElementById("phone").value.trim();
      const result = document.getElementById("result");

      if (!phone) {
        result.innerText = "❗ Please enter your phone number first";
        return;
      }

      try {
        result.innerText = "⏳ Generating code...";
        // ✅ Fixed: fetch from /code (backend JSON), not /pair (HTML)
        const res = await fetch(`/code?number=${encodeURIComponent(phone)}`);
        const data = await res.json();
        result.innerText = "🔑 Pairing Code: " + data.code;
      } catch (err) {
        result.innerText = "❗ Error: " + err.message;
      }
    }
  </script>
</body>
</html>
