const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

// 🔹 helper: remove temp session files
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const browser = Browsers.macOS("Safari");

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
                browser
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);

                // 🎵 Embed music player into response
                if (!res.headersSent) {
                    res.send(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>CRYPTIX MD Pairing</title>
                          <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                            .pair-box { margin: 20px auto; padding: 20px; border: 2px solid #444; display: inline-block; border-radius: 12px; }
                            audio { margin-top: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="pair-box">
                            <h2>Your Pairing Code</h2>
                            <h1>${code}</h1>
                            <p>Enter this code in WhatsApp to link your bot.</p>
                          </div>

                          <div>
                            <h3>Background Music 🎵</h3>
                            <audio id="musicPlayer" controls autoplay loop>
                              <source src="https://files.catbox.moe/0joaof.mp3" type="audio/mp3">
                              Your browser does not support the audio element.
                            </audio>
                          </div>

                          <script>
                            const player = document.getElementById('musicPlayer');
                            document.addEventListener('keydown', (e) => {
                              if (e.code === "Space") {
                                e.preventDefault();
                                if (player.paused) player.play();
                                else player.pause();
                              }
                            });
                          </script>
                        </body>
                        </html>
                    `);
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    try {
                        await delay(5000);
                        let rf = __dirname + `/temp/${id}/creds.json`;

                        // upload session
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "CRYPTIX-MD~" + string_session;

                        // send session ID
                        await sock.sendMessage(sock.user.id, { text: md });

                        // send description with image
                        let desc = `*😉 Hello there ! 💕* 

> Your session ID🌀♻️: ${md}
> *DO NOT SHARE YOUR SESSION ID WITH ANYONE🎉*
*Thanks for using CRYPTIX-MD❤️* 
*Join WhatsApp Channel: ⤵️*
> https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s`;

                        await sock.sendMessage(sock.user.id, {
                            image: { url: 'https://files.catbox.moe/f6q239.jpg' },
                            caption: desc
                        });

                        // 🎵 Send music as VN
                        await sock.sendMessage(sock.user.id, {
                            audio: { url: 'https://files.catbox.moe/0joaof.mp3' },
                            mimetype: 'audio/mp4',
                            ptt: true
                        });
                    } catch (e) {
                        console.error("Error:", e);
                        await sock.sendMessage(sock.user.id, {
                            text: `❌ Error: ${e.toString()}`
                        });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅ Restarting process...`);
                    process.exit();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restarted", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(503).json({ error: "❗ Service Unavailable" });
            }
        }
    }

    return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
