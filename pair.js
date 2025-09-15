const { makeid } = require('./gen-id'); // ✅ Now works fine
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore,
  getAggregateVotesInPollMessage,
  DisconnectReason,
  WA_DEFAULT_EPHEMERAL,
  jidNormalizedUser,
  proto,
  getDevice,
  generateWAMessageFromContent,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  getContentType,
  generateForwardMessageContent,
  downloadContentFromMessage,
  jidDecode
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');
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
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(5000);
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

                        await sock.sendMessage(sock.user.id, { text: md });

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
                    } catch (e) {
                        console.error("Error:", e);
                        let errorMsg = `*Error occurred:* ${e.toString()}`;
                        await sock.sendMessage(sock.user.id, { text: errorMsg });
                    }
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    process.exit();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
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
   return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
