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
    const id = makeid();
    let num = req.query.number;

    if (!num) {
        return res.json({ code: "❗ Please provide a number" });
    }

    async function CRYPTIX_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);

                // cleanup number
                num = num.replace(/[^0-9]/g, '');
                if (num.length < 10) {
                    return res.json({ code: "❗ Invalid number format" });
                }

                const code = await sock.requestPairingCode(num);

                // Show in terminal logs
                console.log(`✅ Pairing code for ${num}: ${code}`);

                return res.json({ code });
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    console.log(`✅ ${sock.user.id} Paired successfully`);

                    let rf = __dirname + `/temp/${id}/creds.json`;
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        let md = "CRYPTIX-MD~" + mega_url.replace('https://mega.nz/file/', '');

                        await sock.sendMessage(sock.user.id, { 
                            text: `✅ *PAIRING SUCCESSFUL!*\n\n*Your Session ID:* ${md}\n\n⚠️ Do NOT share with anyone.\n🔒 Keep it safe and private.` 
                        });

                        // cleanup temp after success
                        removeFile('./temp/' + id);

                    } catch (e) {
                        console.error("Error:", e);
                        await sock.sendMessage(sock.user.id, { text: `❌ Error: ${e.toString()}` });
                    }
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                    await delay(2000);
                    CRYPTIX_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("❗ Service Error:", err);
            removeFile('./temp/' + id);
            return res.json({ code: "❗ Service Unavailable" });
        }
    }

    return CRYPTIX_PAIR_CODE();
});

module.exports = router;
