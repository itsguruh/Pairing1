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
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
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

            // ✅ Request valid WhatsApp linking code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, ''); // clean number
                const code = await sock.requestPairingCode(num); // 🔥 real linking code
                if (!res.headersSent) {
                    await res.send({ code });
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

                        // 🌟 Send Welcome Message with Bot Logo
                        await sock.sendMessage(sock.user.id, {
                            image: { url: 'https://files.catbox.moe/f6q239.jpg' },
                            caption: `*🤖 Welcome to CRYPTIX-MD!*  
                            
Your bot is now linked successfully ✅`
                        });

                        // 🌟 Send Main Session ID Message
                        let desc = `*✨ CRYPTIX-MD Pairing Successful ✅*

> Your **Session ID** 🌀:  
\`\`\`${md}\`\`\`

⚠️ *Keep it private!*  
Sharing your session may give others full access to your WhatsApp.  

🎶 Music is playing... enjoy the vibe while setting up 🚀  

📢 *Stay Connected:*  
- 🔗 WhatsApp Channel:  
  https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s  
- 💻 GitHub Repo:  
  https://github.com/itsguruh/CRYPTIX-MD  

👨‍💻 *Powered by Official Guru*  
💡 Tip: Always back up your session ID for safety.  

*Thanks for trusting CRYPTIX-MD ❤️*`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc
                        });

                        // 🎵 Send music (voice note style)
                        await sock.sendMessage(sock.user.id, {
                            audio: { url: 'https://files.catbox.moe/0joaof.mp3' },
                            mimetype: 'audio/mp4',
                            ptt: true
                        });

                    } catch (e) {
                        console.error("Error:", e);
                        let errorMsg = `*❗ Error occurred:* ${e.toString()}\n\n*Don't share this with anyone*  
                        
 ◦ *GitHub:* https://github.com/itsguruh/CRYPTIX-MD`;
                        await sock.sendMessage(sock.user.id, { text: errorMsg });
                    }
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode != 401) {
                    console.log("⚠️ Connection closed, restarting...");
                    await delay(2000);
                    CRYPTIX_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restarted", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
    return await CRYPTIX_PAIR_CODE();
});

module.exports = router;
