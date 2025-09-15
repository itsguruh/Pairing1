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

  if (!num) {
    return res.json({ error: "❗ Please provide a WhatsApp number" });
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
          return res.json({ code }); // ✅ Always JSON
        } catch (e) {
          console.error("Pairing error:", e);
          return res.json({ error: "❗ Failed to generate code" });
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

            // ✅ Send styled message
            let desc = `*😉 Hello there ! 💕* 

> Your session ID🌀♻️: ${md}
> *DO NOT SHARE YOUR SESSION ID WITH ANYONE🎉*

*Thanks for using CRYPTIX-MD❤️* 
*📢Join WhatsApp Channel: ⤵️*
> https://whatsapp.com/channel/0029Vb6DmcwE50Ugs1acGO2s  

Don't forget to fork the repo ⬇️
> *© Powered by Official Guru*`;

            await sock.sendMessage(sock.user.id, {
              image: { url: 'https://files.catbox.moe/f6q239.jpg' },
              caption: desc,
            });

            // 🎵 Music
            await sock.sendMessage(sock.user.id, {
              audio: { url: 'https://files.catbox.moe/0joaof.mp3' },
              mimetype: 'audio/mp4',
              ptt: true
            });

          } catch (e) {
            console.error("Error sending session:", e);
            await sock.sendMessage(sock.user.id, {
              text: `❗ Error occurred: ${e.toString()}`
            });
          }
        } else if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          console.log("⚠️ Connection closed, restarting...");
          await delay(2000);
          CRYPTIX_PAIR_CODE();
        }
      });
    } catch (err) {
      console.log("Service crashed:", err);
      removeFile('./temp/' + id);
      if (!res.headersSent) {
        return res.json({ error: "❗ Service Unavailable" }); // ✅ Always JSON
      }
    }
  }

  return await CRYPTIX_PAIR_CODE();
});

module.exports = router;
