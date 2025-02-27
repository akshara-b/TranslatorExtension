const express = require('express');
const youtubedl = require('youtube-dl-exec');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/transcribe', async (req, res) => {
  const url = req.body.url;
  try {
    console.log("Downloading audio from:", url);
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: 'full_audio.mp3' // Full file first
    });

    console.log("Trimming to first 30 seconds...");
    exec('ffmpeg -i full_audio.mp3 -ss 0 -t 30 -acodec copy audio.mp3', (trimError) => {
      if (trimError) {
        console.error("Trim error:", trimError);
        return res.status(500).json({ error: "Trim failed" });
      }

      console.log("Transcribing audio...");
      exec('whisper audio.mp3 --model tiny --language en --output_format txt', (transError, stdout, stderr) => {
        if (transError) {
          console.error("Transcription error:", transError);
          return res.status(500).json({ error: "Transcription failed" });
        }
        if (stderr) {
          console.log("Whisper output:", stderr);
        }
        const transcript = fs.readFileSync('audio.txt', 'utf8');
        console.log("Transcript:", transcript);
        fs.unlinkSync('full_audio.mp3');
        fs.unlinkSync('audio.mp3');
        fs.unlinkSync('audio.txt');
        res.json({ transcript });
      });
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});