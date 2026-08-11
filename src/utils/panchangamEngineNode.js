// Node.js CommonJS Compatible Panchangam Engine
const CITIES = [
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, nameTe: 'హైదరాబాద్', nameHi: 'हैदराबाद', nameTa: 'ஹைதராபாத்', nameKn: 'ಹೈದರಾಬಾದ್' },
  { id: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, nameTe: 'తిరుపతి', nameHi: 'तिरुपति', nameTa: 'திருப்பதி', nameKn: 'ತಿರುಪತಿ' },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, nameTe: 'విజయవాడ', nameHi: 'विजयवाडा', nameTa: 'விஜயவாடா', nameKn: 'ವಿಜಯವಾಡ' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, nameTe: 'బెంగళూరు', nameHi: 'बेंगलुरु', nameTa: 'பெங்களூரு', nameKn: 'ಬೆಂಗಳೂರು' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, nameTe: 'చెన్నై', nameHi: 'चेन्नई', nameTa: 'சென்னை', nameKn: 'சென்னையும்' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, nameTe: 'ముంబై', nameHi: 'मुंबई', nameTa: 'மும்பை', nameKn: 'ಮುಂಬೈ' },
  { id: 'delhi', name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090, nameTe: 'న్యూఢిల్లీ', nameHi: 'नई दिल्ली', nameTa: 'புது தில்லி', nameKn: 'ನವದೆಹಲಿ' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, nameTe: 'వారణాసి', nameHi: 'वाराणसी', nameTa: 'வாரணாசி', nameKn: 'ವಾರಾಣಸಿ' },
];

const TITHIS_EN = ["Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"];
const TITHIS_TE = ["పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "పౌర్ణమి", "పాడ్యమి", "విదియ", "తదియ", "చవితి", "పంచమి", "షష్ఠి", "సప్తమి", "అష్టమి", "నవమి", "దశమి", "ఏకాదశి", "ద్వాదశి", "త్రయోదశి", "చతుర్దశి", "అమావాస్య"];
const TITHIS_HI = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा", "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावस्या"];

const NAKSHATRAS_EN = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const NAKSHATRAS_TE = ["అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆర్ద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఖ", "పూర్వఫల్గుణి", "ఉత్తరఫల్గుణి", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ", "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"];
const NAKSHATRAS_HI = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"];

const YOGAS_EN = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Subha", "Sukla", "Brahma", "Indra", "Vaidhriti"];
const YOGAS_TE = ["విష్కంభం", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్యం", "శోభనం", "అతిగండం", "సుకర్మ", "ధృతి", "శూలం", "గండం", "వృద్ధి", "ధ్రువం", "వ్యాఘాతం", "హర్షణం", "వజ్రం", "సిద్ధి", "వ్యతీపాతం", "వరీయాన్", "పరిఘం", "శివం", "సిద్ధం", "సాధ్యం", "శుభం", "శుక్లం", "బ్రహ్మం", "ఐంద్రం", "వైధృతి"];

const KARANAS_EN = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"];
const KARANAS_TE = ["బవ", "బాలవ", "కౌలవ", "తైతిల", "గరజ", "వణిజ", "విష్టి", "శకుని", "చతుష్పాత్", "నాగవ", "కింస్తుఘ్న"];

const TE_MONTHS = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబరు", "అక్టోబరు", "నవంబరు", "డిసెంబరు"];
const TE_DAYS = ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"];

const HI_MONTHS = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const HI_DAYS = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

function getJulianDay(date) {
  return (date.getTime() / 86400000) + 2440587.5;
}

function calculateSunTimings(lat, lon, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
  const latRad = lat * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);
  
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad)) * (180 / Math.PI);

  const solarNoonMins = 720 - (lon * 4);
  const sunriseMinutes = solarNoonMins - (hourAngle * 4);
  const sunsetMinutes = solarNoonMins + (hourAngle * 4);

  const formatMinutes = (totalMins) => {
    let hrs = Math.floor(totalMins / 60);
    let mins = Math.round(totalMins % 60);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;
  };

  return {
    sunrise: formatMinutes(sunriseMinutes),
    sunset: formatMinutes(sunsetMinutes),
    sunriseMinutes,
    sunsetMinutes
  };
}

function calculateRahuKalam(sunriseMins, sunsetMins, dayOfWeek) {
  const dayDuration = sunsetMins - sunriseMins;
  const periodDuration = dayDuration / 8;

  const rahuPeriodMap = [7, 1, 6, 4, 5, 3, 2];
  const rahuStart = sunriseMins + (rahuPeriodMap[dayOfWeek] * periodDuration);
  const rahuEnd = rahuStart + periodDuration;

  const formatMinutes = (totalMins) => {
    let hrs = Math.floor(totalMins / 60);
    let mins = Math.round(totalMins % 60);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;
  };

  return {
    rahuKalam: `${formatMinutes(rahuStart)} – ${formatMinutes(rahuEnd)}`
  };
}

function getDailyPanchangam(cityId = 'hyderabad', targetDate = new Date()) {
  const city = CITIES.find(c => c.id === cityId) || CITIES[0];
  const sunTimings = calculateSunTimings(city.lat, city.lon, targetDate);
  const rahuYama = calculateRahuKalam(sunTimings.sunriseMinutes, sunTimings.sunsetMinutes, targetDate.getDay());

  const jd = getJulianDay(targetDate);
  const daysSinceEpoch = jd - 2451545.0;
  const sunLong = (280.460 + 0.9856474 * daysSinceEpoch) % 360;
  const moonLong = (218.316 + 13.176396 * daysSinceEpoch) % 360;

  const tithiDiff = (moonLong - sunLong + 360) % 360;
  const tithiIdx = Math.floor(tithiDiff / 12) % 30;
  
  const nakshatraIdx = Math.floor(moonLong / 13.33333) % 27;
  const yogaIdx = Math.floor(((moonLong + sunLong) % 360) / 13.33333) % 27;
  const karanaIdx = Math.floor(tithiDiff / 6) % 11;

  const dayNum = targetDate.getDate();
  const monthIdx = targetDate.getMonth();
  const yearNum = targetDate.getFullYear();
  const dayOfWeekIdx = targetDate.getDay();

  return {
    cityId: city.id,
    cityName: `${city.name}, ${city.state}`,
    cityObj: city,
    dateObj: targetDate,
    dayNum,
    yearNum,

    dateSpokenEn: `${targetDate.toLocaleDateString('en-IN', { weekday: 'long' })}, ${dayNum} ${targetDate.toLocaleDateString('en-IN', { month: 'long' })} ${yearNum}`,
    dateSpokenTe: `${TE_DAYS[dayOfWeekIdx]}, ${dayNum} ${TE_MONTHS[monthIdx]} ${yearNum}`,
    dateSpokenHi: `${HI_DAYS[dayOfWeekIdx]}, ${dayNum} ${HI_MONTHS[monthIdx]} ${yearNum}`,
    dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),

    tithiEn: TITHIS_EN[tithiIdx],
    nakshatraEn: NAKSHATRAS_EN[nakshatraIdx],
    yogaEn: YOGAS_EN[yogaIdx],
    karanaEn: KARANAS_EN[karanaIdx],

    tithiTe: TITHIS_TE[tithiIdx],
    nakshatraTe: NAKSHATRAS_TE[nakshatraIdx],
    yogaTe: YOGAS_TE[yogaIdx],
    karanaTe: KARANAS_TE[karanaIdx],

    tithiHi: TITHIS_HI[tithiIdx],
    nakshatraHi: NAKSHATRAS_HI[nakshatraIdx],
    yogaHi: YOGAS_TE[yogaIdx],
    karanaHi: KARANAS_TE[karanaIdx],

    sunrise: sunTimings.sunrise,
    sunset: sunTimings.sunset,
    rahuKalam: rahuYama.rahuKalam
  };
}

function generateAudioScript(langId, panchang) {
  const city = panchang.cityObj || CITIES[0];
  const langKey = (langId || 'te').toLowerCase();

  if (langKey === 'te' || langKey === 'telugu' || langKey === 'te-in') {
    return `ఓం శ్రీ వేంకటేశాయ నమః. నేటి తేదీ ${panchang.dateSpokenTe || panchang.dateFormatted}. పవిత్ర ${city.nameTe || city.name} పంచాంగము. తిథి: ${panchang.tithiTe}. నక్షత్రము: ${panchang.nakshatraTe}. యోగం: ${panchang.yogaTe}. కరణం: ${panchang.karanaTe}. రాహు కాలం: ${panchang.rahuKalam}. సూర్యోదయం: ${panchang.sunrise}, సూర్యాస్తమయం: ${panchang.sunset}. మీ కుటుంబానికి ఈ రోజు శుభం కలుగుగాక.`;
  }

  if (langKey === 'hi' || langKey === 'hindi' || langKey === 'hi-in') {
    return `जय श्री राम। आज की तिथि ${panchang.dateSpokenHi || panchang.dateFormatted}। पवित्र ${city.nameHi || city.name} पंचांग। तिथि: ${panchang.tithiHi}। नक्षत्र: ${panchang.nakshatraHi}। राहु काल: ${panchang.rahuKalam}। सूर्योदय: ${panchang.sunrise}, सूर्यास्त: ${panchang.sunset}। आपका दिन शुभ और मंगलमय हो।`;
  }

  return `Welcome Devotee. Today's Date: ${panchang.dateSpokenEn || panchang.dateFormatted}. Today's Panchangam for ${city.name}. Tithi: ${panchang.tithiEn}. Nakshatra: ${panchang.nakshatraEn}. Rahu Kalam: ${panchang.rahuKalam}. Sunrise: ${panchang.sunrise}, Sunset: ${panchang.sunset}. Have a blessed day.`;
}

module.exports = { CITIES, getDailyPanchangam, generateAudioScript };
