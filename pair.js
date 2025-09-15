I'll// pair.js (minimal fixes only)
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

    async function CRYPTIX_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                return array[Math.floor(Math.random() * array.length)];
            }
            var randomItem = selectRandomItem(items);

            let sock = makeWASocket({
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

            // If not yet registered → request pairing code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                if (!num) {
                    if (!res.headersSent) return res.json({ code: "❗ No number provided" });
                    return;
                }
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    return res.json({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

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

    async function CRYPTIX_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                return array[Math.floor(Math.random() * array.length)];
            }
            var randomItem = selectRandomItem(items);

            let sock = makeWASocket({
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

            // If not yet registered → request pairing code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                if (!num) {
                    if (!res.headersSent) return res.json({ code: "❗ No number provided" });
                    return;
                }
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    return res.json({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

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
                        }
                        return randomText;
                    }

                    const randomText = generateRandomText();
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "CRYPTIX-MD~" + string_session;

                        // Send session ID
                        await sock.sendMessage(sock.user.id, { text: md });

                        // Send description with image
                        let desc = `*😉 Hello there ! 💕* 

> Your session ID🌀♻️: ${md}
> *DO NOT SHARE YOUR SESSION ID WITH ANYONE🎉*
*Thanks for using CRYPTIX-MD❤️* 
*Join WhatsApp Channel: ⤵️*
> https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s
Don't forget to fork the repo ⬇️
> *© Powered by Official Guru*`;

                        await sock.sendMessage(sock.user.id, {
                            image: { url: 'https://files.catbox.moe/f6q239.jpg' },
                            caption: desc,
                        });

                        // 🎵 Send music (voice note style)
                        await sock.sendMessage(sock.user.id, {
                            audio: { url: 'https://files.catbox.moe/0joaof.mp3' },
                            mimetype: 'audio/mp4',
                            ptt: true
                        });

                    } catch (e) {
                        console.error("Error:", e);
                        let errorMsg = `*Error occurred:* ${e.toString()}\n\n*Don't share this with anyone*\n\n ◦ *Github:* https://github.com/itsguruh/CRYPTIX-MD`;
                        await sock.sendMessage(sock.user.id, { text: errorMsg });
                    }
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode != 401) {
                    console.log("⚠️ Connection closed, restarting...");
                    await delay(2000);
                    CRYPTIX_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                return res.json({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await CRYPTIX_PAIR_CODE();
});

module.exports = router;
