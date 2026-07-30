const fs = require('fs');
const path = require('path');

function createPdfFile() {
  const pdfPath = path.join(__dirname, 'Smart_Idol_Server_Documentation.pdf');

  const pdfStreamText = `BT
/F1 18 Tf
40 740 Td
(SMART IDOL SYSTEM - SERVER ARCHITECTURE DOCUMENTATION) Tj
/F1 10 Tf
0 -24 Td
(Date: July 30, 2026 | Version: v2.5 Standalone IoT Bridge Engine) Tj
0 -16 Td
(Server File: server.cjs | Port: 3001 | Hostname: smart-idol.local) Tj
0 -30 Td
(1. SYSTEM ARCHITECTURE & DUAL-SERVER DESIGN) Tj
0 -16 Td
(The Smart Idol System uses a decoupled Dual-Server Architecture:) Tj
0 -14 Td
(  - React Admin Dashboard (Vite on port 5173): User interface & Web Speech Audio) Tj
0 -14 Td
(  - Node.js Bridge Server (server.cjs on port 3001): ESP32 Middleware & WLAN Scanner) Tj
0 -30 Td
(2. API ENDPOINT REFERENCE) Tj
0 -16 Td
(  - GET /               : Health check and server status page) Tj
0 -14 Td
(  - POST /motion        : Triggered by physical ESP32 PIR Sensor on GPIO 13) Tj
0 -14 Td
(  - GET /motion-status  : Polled every 400ms by React Dashboard to detect motion) Tj
0 -14 Td
(  - GET /scan-wifi      : Executes Windows WLAN netsh to scan real physical SSIDs) Tj
0 -14 Td
(  - POST /connect-wifi  : Provisions Wi-Fi credentials to ESP32 Flash Memory) Tj
0 -30 Td
(3. RELIABILITY & SAFETY FEATURES) Tj
0 -16 Td
(  - Zero-IP mDNS Auto Discovery: Auto-resolves http://smart-idol.local:3001 on any Wi-Fi) Tj
0 -14 Td
(  - Single-Playback Lock: Discards mid-speech motion triggers to prevent overlap) Tj
0 -14 Td
(  - Midnight Rollover: Recalculates Panchangam daily at 12:00 AM Midnight IST) Tj
0 -30 Td
(4. HARDWARE PIN CONNECTION SUMMARY) Tj
0 -16 Td
(  - PIR Sensor OUT   -> ESP32 GPIO 13) Tj
0 -14 Td
(  - DS3231 RTC SDA   -> ESP32 GPIO 21 | SCL -> ESP32 GPIO 22) Tj
0 -14 Td
(  - MAX98357A LRC    -> ESP32 GPIO 25 | BCLK -> GPIO 26 | DIN -> GPIO 27) Tj
0 -14 Td
(  - Speaker 8 Ohm 2W -> MAX98357A + / - Terminals) Tj
ET`;

  const streamLen = Buffer.byteLength(pdfStreamText);

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${pdfStreamText}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000261 00000 n 
0000000344 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${450 + streamLen}
%%EOF`;

  fs.writeFileSync(pdfPath, pdfContent);
  console.log("PDF file created at:", pdfPath);
}

createPdfFile();
