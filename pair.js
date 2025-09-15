const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) {
        fs.rmSync(FilePath, { recursive: true, force: true });
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    // ✅ Check if number was provided
    if (!num || num.trim() === "") {
        return res.status(400).json({ code: "❗ Error: No number provided!" });
    }

    async function CRYPTIX_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
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
                browser: Browsers.macOS("Safari"),
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');

                try {
                    const code = await sock.requestPairingCode(num);
                    if (!res.headersSent) {
                        return res.json({ code }); // ✅ Always JSON
                    }
                } catch (err) {
                    console.error("❌ Failed to get pairing code:", err);
                    if (!res.headersSent) {
                        return res.status(500).json({ code: "❗ Error: Failed to request code" });
                    }
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection } = s;

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

                        // 🎉 Main session message
                        let desc = `*✨ CRYPTIX-MD Pairing Successful ✅*

> Your **Session ID** 🌀:  
\`\`\`${md}\`\`\`

⚠️ *Keep it private!*  
Sharing your session may give others full access to your WhatsApp.  

📢 *Stay Connected:*  
- 🔗 WhatsApp Channel:  
  https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s  
- 💻 GitHub Repo:  
  https://github.com/itsguruh/CRYPTIX-MD  

👨‍💻 *Powered by Official Guru*  
💡 Tip: Always back up your session ID for safety.  

*Thanks for trusting CRYPTIX-MD ❤️*`;

                        // Send welcome + logo
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
                        console.error("Error while sending session:", e);
                        let errorMsg = `*❗ Error:* ${e.toString()}\n\n*Don't share this with anyone*\n\n ◦ *GitHub:* https://github.com/itsguruh/CRYPTIX-MD`;
                        await sock.sendMessage(sock.user.id, { text: errorMsg });
                    }

                    await delay(2000);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                }
            });
        } catch (err) {
            console.error("Service crashed:", err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                return res.status(500).json({ code: "❗ Error: Service crashed unexpectedly" });
            }
        }
    }

    return await CRYPTIX_PAIR_CODE();
});

module.exports = router;
