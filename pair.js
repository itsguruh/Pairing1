const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) {
        fs.rmSync(FilePath, { recursive: true, force: true });
    }
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    // ✅ Prevent empty number error
    if (!num) {
        return res.json({ code: "❗ Please enter a valid phone number!" });
    }

    const id = makeid();

    async function CRYPTIX_PAIR_CODE() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: "fatal" }).child({ level: "fatal" })
                    ),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            // ✅ Request pairing code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, ''); // clean number
                try {
                    const code = await sock.requestPairingCode(num);
                    return res.json({ code: code });
                } catch (err) {
                    console.error("Pairing Error:", err);
                    return res.json({ code: "❗ Failed to generate code. Check number format." });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    console.log(`✅ Connected: ${sock.user.id}`);

                    let rf = __dirname + `/temp/${id}/creds.json`;

                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            randomText += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        return randomText;
                    }

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const sessionID = "CRYPTIX-MD~" + mega_url.replace('https://mega.nz/file/', '');

                        // 📩 Send session to WhatsApp
                        await sock.sendMessage(sock.user.id, { text: sessionID });

                        // 📸 Send bot logo + description
                        const desc = `*🤖 Hello there ! 💕*  

Your session ID 🌀:  
> ${sessionID}  

⚠️ *DO NOT SHARE THIS SESSION ID*  
✅ Thanks for using *CRYPTIX-MD* ❤️  

📢 Join Channel:  
https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s  

© Powered by Official Guru 🔥`;

                        await sock.sendMessage(sock.user.id, {
                            image: { url: 'https://files.catbox.moe/f6q239.jpg' },
                            caption: desc,
                        });

                        // 🎵 Send music as voice note
                        await sock.sendMessage(sock.user.id, {
                            audio: { url: 'https://files.catbox.moe/0joaof.mp3' },
                            mimetype: 'audio/mp4',
                            ptt: true
                        });

                    } catch (e) {
                        console.error("Session Error:", e);
                        await sock.sendMessage(sock.user.id, { text: "❗ Error while saving session. Try again." });
                    }
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                    console.log("⚠️ Restarting service...");
                    await delay(2000);
                    CRYPTIX_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("Fatal Error:", err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                return res.json({ code: "❗ Service Unavailable. Please retry." });
            }
        }
    }

    return await CRYPTIX_PAIR_CODE();
});

module.exports = router;
