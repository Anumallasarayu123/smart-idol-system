// Real Hardware Telemetry Initial State (Unconnected until Administrator provisions Wi-Fi)

export const INITIAL_IDOL_STATE = {
  deviceId: 'ESP32-SMART-IDOL',
  deviceName: 'Sacred Sanctum Idol',
  isOnline: false, // Starts OFF until Wi-Fi is provisioned by Admin
  wifiSsid: 'Not Connected',
  wifiRssi: 0,
  ipAddress: 'Pending Wi-Fi Connection',
  batteryPercentage: 100,
  batteryVoltage: '5.00V USB Power',
  powerSource: '5V USB Powered',
  activeCity: 'hyderabad', // Active Idol City Location
  activeLanguage: 'te', // Active Idol Confirmed Language: Telugu
  pirSensitivity: 'GPIO 13 Active',
  pirState: 'IDLE', // 'IDLE', 'MOTION_DETECTED', 'ANNOUNCING'
  totalTriggersToday: 0,
  lastTriggerTime: 'None yet',
  speakerVolume: 100,
  speakerHardware: 'PC / Laptop Speaker (Browser Audio Engine)',
  uptimeHours: 0.1,
  firmwareVersion: 'v2.5.0-real'
};

export const INITIAL_LOGS = [
  { id: 1, timestamp: new Date().toLocaleTimeString('en-IN'), type: 'SYSTEM_BOOT', detail: 'Smart Idol System booted. Waiting for Admin Wi-Fi provisioning.', source: 'System Core' }
];

export const HOURLY_MOTION_DATA = [
  { hour: '6 AM', count: 0 },
  { hour: '7 AM', count: 0 },
  { hour: '8 AM', count: 0 },
  { hour: '9 AM', count: 0 },
  { hour: '10 AM', count: 0 },
  { hour: '11 AM', count: 0 },
];
