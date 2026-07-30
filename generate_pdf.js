const fs = require('fs');
const path = require('path');

// Simple PostScript/PDF Binary Document Writer
function generatePdf() {
  const pdfPath = path.join(__dirname, 'server_architecture_documentation.pdf');

  const content = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj

2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj

3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 4 0 R
    >>
  >>
  /MediaBox [0 0 612 792]
  /Contents 5 0 R
>>
endobj

4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj

5 0 obj
<<
  /Length 550
>>
stream
BT
/F1 20 Tf
40 730 Td
(SMART IDOL SYSTEM - BRIDGE SERVER DOCUMENTATION) Tj
/F1 12 Tf
0 -30 Td
(System Version: v2.5 Standalone IoT Bridge Engine) Tj
0 -18 Td
(Server File: server.cjs | Port: 3001 | Hostname: smart-idol.local) Tj
0 -35 Td
(1. EXECUTIVE SUMMARY) Tj
0 -18 Td
(The Smart Idol System uses a decoupled Dual-Server Architecture:) Tj
0 -16 Td
(- React Admin Dashboard (Vite): Web UI & Web Speech Audio Engine) Tj
0 -16 Td
(- Node.js Bridge Server (server.cjs): ESP32 Middleware & WLAN Scanner) Tj
0 -35 Td
(2. API ENDPOINTS REFERENCE) Tj
0 -18 Td
(- GET /: Server status & health check HTML page) Tj
0 -16 Td
(- POST /motion: Triggered by ESP32 PIR Sensor on GPIO 13) Tj
0 -16 Td
(- GET /motion-status: Polled every 400ms by React Dashboard) Tj
0 -16 Td
(- GET /scan-wifi: Scans real physical Wi-Fi networks on Windows) Tj
0 -16 Td
(- POST /connect-wifi: Provisions Wi-Fi credentials to ESP32 Flash) Tj
0 -35 Td
(3. RELIABILITY & SAFETY FEATURES) Tj
0 -18 Td
(- Zero-IP mDNS Auto Discovery: Auto resolves smart-idol.local) Tj
0 -16 Td
(- Single-Playback Lock: Discards mid-speech motion triggers) Tj
0 -16 Td
(- Midnight Rollover: Recalculates Panchangam daily at 12:00 AM) Tj
ET
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
<<
  /Size 6
  /Root 1 0 R
>>
startxref
948
%%EOF`;

  fs.writeFileSync(pdfPath, content, 'binary');
  console.log("✅ PDF Document Generated Successfully at:", pdfPath);
}

generatePdf();
