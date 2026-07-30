const https = require('https');
const fs = require('fs');
const path = require('path');

// Today's Panchangam Text in Telugu (or English/Hindi)
const text = encodeURIComponent("ఓం శ్రీ గణేశాయ నమః. నేటి పవిత్ర పంచాంగము. తిథి త్రయోదశి, నక్షత్రం స్వాతి, యోగం వరీయాన్. శుభ సమయం ప్రాప్తం.");
const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${text}`;

console.log("📥 Downloading Today's Spoken Panchangam Audio File...");

const wavPath = path.join(__dirname, 'panchangam_today.mp3');
const file = fs.createWriteStream(wavPath);

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log("✅ Audio Downloaded Successfully: panchangam_today.mp3");
      
      // Convert raw MP3 bytes to C++ PROGMEM array header for ESP32
      const audioBuffer = fs.readFileSync(wavPath);
      let headerContent = `// Today's Panchangam Spoken Audio File Array\n`;
      headerContent += `#include <pgmspace.h>\n\n`;
      headerContent += `const uint8_t TODAY_PANCHANGAM_AUDIO[] PROGMEM = {\n  `;

      for (let i = 0; i < audioBuffer.length; i++) {
        headerContent += `0x${audioBuffer[i].toString(16).padStart(2, '0')}`;
        if (i < audioBuffer.length - 1) {
          headerContent += `, `;
          if ((i + 1) % 16 === 0) headerContent += `\n  `;
        }
      }
      headerContent += `\n};\n\n`;
      headerContent += `const size_t TODAY_PANCHANGAM_AUDIO_LEN = sizeof(TODAY_PANCHANGAM_AUDIO);\n`;

      const headerPath = path.join(__dirname, 'panchangam_audio.h');
      fs.writeFileSync(headerPath, headerContent);
      console.log(`✅ Generated C++ Header File: panchangam_audio.h (${audioBuffer.length} bytes)`);
    });
  });
}).on('error', (err) => {
  console.error("Error downloading audio:", err);
});
