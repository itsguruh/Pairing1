<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRYPTIX-MD Pairing</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(to right, #3e2723, #000, #fff);
      color: #fff;
      text-align: center;
      padding: 40px;
    }
    h1 {
      color: #ffcc80;
    }
    button {
      padding: 10px 20px;
      margin-top: 20px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      background: #4e342e;
      color: white;
      transition: 0.3s;
    }
    button:hover {
      background: #6d4c41;
    }
    #music-controls {
      margin-top: 30px;
    }
    .pair-box {
      margin-top: 30px;
      background: rgba(0,0,0,0.5);
      padding: 20px;
      border-radius: 12px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>CRYPTIX-MD Pairing Code</h1>
  <p>Enter your number with country code to generate a pairing code:</p>

  <div class="pair-box">
    <form id="pairForm">
      <input type="text" id="number" placeholder="2547xxxxxxxx" required>
      <button type="submit">Get Pairing Code</button>
    </form>
    <p id="result"></p>
  </div>

  <!-- 🎵 Background Music -->
  <div id="music-controls">
    <audio id="bg-music" loop>
      <source src="https://files.catbox.moe/0joaof.mp3" type="audio/mp3">
    </audio>
    <button onclick="toggleMusic()">▶ Play / ⏸ Pause Music</button>
  </div>

  <script>
    // Handle pairing request
    document.getElementById('pairForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const number = document.getElementById('number').value;
      document.getElementById('result').textContent = "⏳ Generating code...";
      try {
        const res = await fetch(`/pair?number=${number}`);
        const data = await res.json();
        if (data.code) {
          document.getElementById('result').textContent = "✅ Pairing Code: " + data.code;
        } else if (data.error) {
          document.getElementById('result').textContent = "❌ " + data.error;
        }
      } catch (err) {
        document.getElementById('result').textContent = "⚠️ Error: " + err;
      }
    });

    // 🎵 Music toggle
    const music = document.getElementById("bg-music");
    function toggleMusic() {
      if (music.paused) {
        music.play();
      } else {
        music.pause();
      }
    }
  </script>
</body>
</html>
