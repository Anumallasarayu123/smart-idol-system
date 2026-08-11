const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../data/panchangam_database.json');

let panchangDb = {};
try {
  if (fs.existsSync(DB_PATH)) {
    panchangDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load panchangam_database.json:', e.message);
}

const CITIES = [
  // SOUTH INDIA
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, nameTe: 'హైదరాబాద్', nameHi: 'हैदराबाद', nameTa: 'ஹைதராபாத்', nameKn: 'హైదరాబాద్' },
  { id: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, nameTe: 'తిరుపతి', nameHi: 'तिरुपति', nameTa: 'திருப்பதி', nameKn: 'తిరుపతి' },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, nameTe: 'విజయవాడ', nameHi: 'विजयवाडा', nameTa: 'விஜயவாடா', nameKn: 'విజయవాడ' },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, nameTe: 'విశాఖపట్నం', nameHi: 'विशाखापत्तनम', nameTa: 'விசாகப்பட்டினம்', nameKn: 'ವಿಶಾಖಪಟ್ಟಣಂ' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, nameTe: 'బెంగళూరు', nameHi: 'बेंगलुरु', nameTa: 'பெங்களூரு', nameKn: 'ಬೆಂಗಳೂರು' },
  { id: 'mysuru', name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394, nameTe: 'మైసూర్', nameHi: 'मैसूर', nameTa: 'மைசூர்', nameKn: 'ಮೈಸೂರು' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, nameTe: 'చెన్నై', nameHi: 'चेन्नई', nameTa: 'சென்னை', nameKn: 'ಚೆන්නై' },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, nameTe: 'మధురై', nameHi: 'मदुरै', nameTa: 'மதுரை', nameKn: 'ಮಧುರೈ' },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, nameTe: 'కోయంబత్తూర్', nameHi: 'कोयंबटूर', nameTa: 'கோயம்புத்தூர்', nameKn: 'ಕೊಯಮುತ್ತೂರು' },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, nameTe: 'తిరువనంతపురం', nameHi: 'तिरुवनंतपुरम', nameTa: 'திருவனந்தபுரம்', nameKn: 'ತಿರುವನಂತಪುರಂ' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, nameTe: 'కొచ్చి', nameHi: 'कोच्चि', nameTa: 'കൊച്ചി', nameKn: 'ಕೊಚ್ಚി' },

  // NORTH INDIA
  { id: 'delhi', name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090, nameTe: 'న్యూఢిల్లీ', nameHi: 'नई दिल्ली', nameTa: 'புது தில்லி', nameKn: 'ನವದೆಹಲಿ' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, nameTe: 'వారణాసి', nameHi: 'वाराणसी', nameTa: 'வாரணாசி', nameKn: '<ctrl42>వారణಾಸಿ' },
  { id: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7922, lon: 82.1998, nameTe: 'అయోధ్య', nameHi: 'अयोध्या', nameTa: 'அயோத்தி', nameKn: 'ಅಯೋಧ್ಯೆ' },
  { id: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737, nameTe: 'మధుర', nameHi: 'मथुरा', nameTa: 'மதுரா', nameKn: 'ਮਥੁਰਾ' },
  { id: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, nameTe: 'ప్రయాగ్‌రాజ్', nameHi: 'प्रयागराज', nameTa: 'பிரயாக்ராஜ்', nameKn: 'ಪ್ರಯಾಗ್‌ರಾಜ್' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, nameTe: 'జైపూర్', nameHi: 'जयपुर', nameTa: 'ஜெய்ப்பூர்', nameKn: 'ಜೈಪುರ' },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab / Haryana', lat: 30.7333, lon: 76.7794, nameTe: 'చండీగఢ్', nameHi: 'चंडीगढ़', nameTa: 'ਸੰਡਿਗੜ੍ਹ', nameKn: 'ਚੰਡੀਗੜ੍ਹ' },
  { id: 'jammu', name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570, nameTe: 'జమ్మూ', nameHi: 'जम्मू', nameTa: 'ஜம்மு', nameKn: 'ಜమ్మੁ' },

  // WEST INDIA
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, nameTe: 'ముంబై', nameHi: 'मुंबई', nameTa: 'மும்பை', nameKn: 'மும்பை' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, nameTe: 'పుణే', nameHi: 'पुणे', nameTa: 'புனே', nameKn: 'ಪುಣೆ' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, nameTe: 'అహ్మదాబాద్', nameHi: 'अहमदाबाद', nameTa: 'அகமதாபாத்', nameKn: 'ಅಹਮਦਾਬਾਦ' },
  { id: 'panaji', name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, nameTe: 'పనాజీ', nameHi: 'पणजी', nameTa: 'பணாஜி', nameKn: 'ಪಣಜಿ' },

  // EAST & NORTH-EAST INDIA
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, nameTe: 'కోల్‌కతా', nameHi: 'कोलकाता', nameTa: 'கொல்கத்தா', nameKn: 'ಕೊಲ್ಕತ್ತಾ' },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, nameTe: 'భువనేశ్వర్', nameHi: 'भुवनेश्वर', nameTa: 'புவனேஸ்வர்', nameKn: 'ଭୁବନେଶ୍ୱର' },
  { id: 'puri', name: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312, nameTe: 'పూరీ', nameHi: 'पुरी', nameTa: 'பூரி', nameKn: 'ପୁରୀ' },
  { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, nameTe: 'పాట్నా', nameHi: 'पटना', nameTa: 'பாட்னா', nameKn: 'ಪಾಟ್ನಾ' },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, nameTe: 'గువాహటి', nameHi: 'गुवाहाटी', nameTa: 'கௌஹாத்தி', nameKn: 'ਗੁਵਾਹਾਟੀ' },

  // CENTRAL INDIA
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, nameTe: 'భోపాల్', nameHi: 'भोपाल', nameTa: 'போபால்', nameKn: 'ಭೋಪಾಲ್' },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, nameTe: 'ఇండోర్', nameHi: 'इंदौर', nameTa: 'இந்தூர்', nameKn: 'ಇಂದೋರ್' },
];

const TE_MONTHS = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబరు", "అక్టోబరు", "నవంబరు", "డిసెంబరు"];
const TE_DAYS = ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"];

const HI_MONTHS = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const HI_DAYS = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

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

  return `${formatMinutes(rahuStart)} – ${formatMinutes(rahuEnd)}`;
}

function getDailyPanchangam(cityId = 'hyderabad', targetDate = new Date()) {
  const city = CITIES.find(c => c.id === cityId) || CITIES[0];
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  const dayOfWeekIdx = targetDate.getDay();
  const monthIdx = targetDate.getMonth();
  const dayNum = targetDate.getDate();
  const yearNum = targetDate.getFullYear();

  const sunTimings = calculateSunTimings(city.lat, city.lon, targetDate);
  const rahuKalamStr = calculateRahuKalam(sunTimings.sunriseMinutes, sunTimings.sunsetMinutes, dayOfWeekIdx);

  const spokenTeDate = `${TE_DAYS[dayOfWeekIdx]}, ${dayNum} ${TE_MONTHS[monthIdx]} ${yearNum}`;
  const spokenHiDate = `${HI_DAYS[dayOfWeekIdx]}, ${dayNum} ${HI_MONTHS[monthIdx]} ${yearNum}`;
  const spokenEnDate = `${targetDate.toLocaleDateString('en-IN', { weekday: 'long' })}, ${dayNum} ${targetDate.toLocaleDateString('en-IN', { month: 'long' })} ${yearNum}`;

  const entry = panchangDb[dateKey];

  if (entry) {
    const finalSunrise = entry.sunrise || sunTimings.sunrise;
    const finalSunset = entry.sunset || sunTimings.sunset;
    const finalRahuKalam = entry.rahuKalam || rahuKalamStr;

    return {
      cityId: city.id,
      cityName: `${city.name}, ${city.state}`,
      cityObj: city,
      dateObj: targetDate,
      dateKey,
      dayNum,
      yearNum,

      dateSpokenEn: spokenEnDate,
      dateSpokenTe: spokenTeDate,
      dateSpokenHi: spokenHiDate,
      dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),

      tithiEn: entry.tithiEn,
      nakshatraEn: entry.nakshatraEn,
      yogaEn: entry.yogaEn,
      karanaEn: entry.karanaEn,

      tithiTe: entry.tithiTe || entry.tithiEn,
      nakshatraTe: entry.nakshatraTe || entry.nakshatraEn,
      yogaTe: entry.yogaTe || entry.yogaEn,
      karanaTe: entry.karanaTe || entry.karanaEn,

      tithiHi: entry.tithiHi || entry.tithiEn,
      nakshatraHi: entry.nakshatraHi || entry.nakshatraEn,
      yogaHi: entry.yogaHi || entry.yogaEn,
      karanaHi: entry.karanaHi || entry.karanaEn,

      sunrise: finalSunrise,
      sunset: finalSunset,
      rahuKalam: finalRahuKalam
    };
  }

  return {
    cityId: city.id,
    cityName: `${city.name}, ${city.state}`,
    cityObj: city,
    dateObj: targetDate,
    dateKey,
    dayNum,
    yearNum,

    dateSpokenEn: spokenEnDate,
    dateSpokenTe: spokenTeDate,
    dateSpokenHi: spokenHiDate,
    dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),

    tithiEn: 'Panchami (until 3:46 AM)',
    nakshatraEn: 'Krittika (until 6:17 AM)',
    yogaEn: 'Preeti (until 6:06 AM)',
    karanaEn: 'Balava / Kaulava',

    tithiTe: 'పంచమి (ఉదయం 3:46 వరకు)',
    nakshatraTe: 'కృత్తిక (ఉదయం 6:17 వరకు)',
    yogaTe: 'ప్రీతి (ఉదయం 6:06 వరకు)',
    karanaTe: 'బాలవ మరియు కౌలవ',

    tithiHi: 'पंचमी (सुबह 3:46 बजे तक)',
    nakshatraHi: 'कृत्तिका (सुबह 6:17 बजे तक)',
    yogaHi: 'प्रीति (सुबह 6:06 बजे तक)',
    karanaHi: 'बालव और कौलव',

    sunrise: sunTimings.sunrise,
    sunset: sunTimings.sunset,
    rahuKalam: rahuKalamStr
  };
}

function generateAudioScript(langId, panchang) {
  const city = panchang.cityObj || CITIES[0];
  const langKey = (langId || 'te').split('-')[0].toLowerCase();

  // TELUGU
  if (langKey === 'te' || langKey === 'telugu') {
    return `ఓం శ్రీ వేంకటేశాయ నమః. నేటి తేదీ ${panchang.dateSpokenTe}. పవిత్ర ${city.nameTe || city.name} పంచాంగము. తిథి: ${panchang.tithiTe || panchang.tithiEn}. నక్షత్రము: ${panchang.nakshatraTe || panchang.nakshatraEn}. యోగం: ${panchang.yogaTe || panchang.yogaEn}. కరణం: ${panchang.karanaTe || panchang.karanaEn}. రాహు కాలం: ${panchang.rahuKalam}. సూర్యోదయం: ${panchang.sunrise}, సూర్యాస్తమయం: ${panchang.sunset}. మీ కుటుంబానికి ఈ రోజు శుభం కలుగుగాక.`;
  }

  // HINDI
  if (langKey === 'hi' || langKey === 'hindi') {
    return `जय श्री राम। आज की तिथि ${panchang.dateSpokenHi}। पवित्र ${city.nameHi || city.name} पंचांग। तिथि: ${panchang.tithiHi || panchang.tithiEn}। नक्षत्र: ${panchang.nakshatraHi || panchang.nakshatraEn}। योग: ${panchang.yogaHi || panchang.yogaEn}। करण: ${panchang.karanaHi || panchang.karanaEn}। राहु काल: ${panchang.rahuKalam}। सूर्योदय: ${panchang.sunrise}, सूर्यास्त: ${panchang.sunset}। आपका दिन शुभ और मंगलमय हो।`;
  }

  // TAMIL
  if (langKey === 'ta' || langKey === 'tamil') {
    return `ஓம் நமச்சிவாய. இன்றைய தேதி ${panchang.dateFormatted}. புனித ${city.nameTa || city.name} பஞ்சாங்கம். திதி: ${panchang.tithiEn}. நட்சத்திரம்: ${panchang.nakshatraEn}. ராகு காலம்: ${panchang.rahuKalam}. சூரியோதயம்: ${panchang.sunrise}, சூரியாஸ்தமனம்: ${panchang.sunset}. சுபமஸ்து.`;
  }

  // KANNADA
  if (langKey === 'kn' || langKey === 'kannada') {
    return `ಓಂ ನಮಃ ಶಿವಾಯ. ಇಂದಿನ ದಿನಾಂಕ ${panchang.dateFormatted}. ಪವಿತ್ರ ${city.nameKn || city.name} ಪಂಚಾಂಗ. ತಿಥಿ: ${panchang.tithiEn}. ನಕ್ಷತ್ರ: ${panchang.nakshatraEn}. ರಾಹು ಕಾಲ: ${panchang.rahuKalam}. ಸೂರ್ಯೋದಯ: ${panchang.sunrise}, ಸೂರ್ಯಾಸ್ತ: ${panchang.sunset}. ನಿಮ್ಮ ದಿನ ಶುಭವಾಗಲಿ.`;
  }

  // MALAYALAM
  if (langKey === 'ml' || langKey === 'malayalam') {
    return `ഓം സ്വാമിയേ ശരണമയ്യപ്പ. ഇന്നത്തെ തീയതി ${panchang.dateFormatted}. പവിത്രമായ ${city.name} പഞ്ചാംഗം. തിഥി: ${panchang.tithiEn}. നക്ഷത്രം: ${panchang.nakshatraEn}. രാഹുകാലം: ${panchang.rahuKalam}. സൂര്യോദയം: ${panchang.sunrise}, സൂര്യാസ്തമയം: ${panchang.sunset}. നിങ്ങളുടെ ദിവസം ശുഭകരമാകട്ടെ.`;
  }

  // MARATHI
  if (langKey === 'mr' || langKey === 'marathi') {
    return `जय श्री राम। आजची तारीख ${panchang.dateSpokenHi}। आजचे ${city.nameHi || city.name} पंचांग। तिथि: ${panchang.tithiHi || panchang.tithiEn}। नक्षत्र: ${panchang.nakshatraHi || panchang.nakshatraEn}। सूर्योदय: ${panchang.sunrise}, सूर्यास्त: ${panchang.sunset}। आपका दिन शुभ हो।`;
  }

  // GUJARATI
  if (langKey === 'gu' || langKey === 'gujarati') {
    return `જય શ્રી કૃષ્ણ। આજની તારીખ ${panchang.dateFormatted}। આજનું ${city.name} પંચાંગ। તિથિ: ${panchang.tithiHi || panchang.tithiEn}। નક્ષત્ર: ${panchang.nakshatraHi || panchang.nakshatraEn}। સૂર્યોદય: ${panchang.sunrise}, સૂર્યાસ્ત: ${panchang.sunset}। તમારો દિવસ શુભ રહે.`;
  }

  // BENGALI
  if (langKey === 'bn' || langKey === 'bengali') {
    return `জয় শ্রী রাম। আজকের তারিখ ${panchang.dateFormatted}। আজকের ${city.name} পঞ্জিকা। তিথি: ${panchang.tithiEn}। নক্ষত্র: ${panchang.nakshatraEn}। সূর্যোদয়: ${panchang.sunrise}, সূর্যাস্ত: ${panchang.sunset}। আপনার দিনটি শুভ হোক।`;
  }

  // ODIA
  if (langKey === 'or' || langKey === 'odia') {
    return `ଜୟ ଜଗନ୍ନାଥ। ଆଜିର ତାରିଖ ${panchang.dateFormatted}। ପବିତ୍ର ${city.name} ପଞ୍ଜିକା। ତିଥି: ${panchang.tithiEn}। ନକ୍ଷତ୍ର: ${panchang.nakshatraEn}। ସୂର୍ଯ୍ୟୋଦୟ: ${panchang.sunrise}, ସୂର୍ଯ୍ୟାସ୍ତ: ${panchang.sunset}। ଆପଣଙ୍କ ଦିନ ଶୁଭ ହେଉ।`;
  }

  // PUNJABI
  if (langKey === 'pa' || langKey === 'punjabi') {
    return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ। ਅੱਜ ਦੀ ਤਾਰੀਖ ${panchang.dateFormatted}। ਪਵਿੱਤਰ ${city.name} ਪੰਚਾਂਗ। ਤਿਥੀ: ${panchang.tithiEn}। ਨਕਸ਼ਤਰ: ${panchang.nakshatraEn}। ਸੂਰਜ ਚੜ੍ਹਨਾ: ${panchang.sunrise}, ਸੂਰਜ ਛਿਪਣਾ: ${panchang.sunset}। ਤੁਹਾਡਾ ਦਿਨ ਸ਼ੁਭ ਹੋਵੇ।`;
  }

  // ASSAMESE
  if (langKey === 'as' || langKey === 'assamese') {
    return `জয় আই অসম। আজকের তাৰিখ ${panchang.dateFormatted}। পৱিত্ৰ ${city.name} পঞ্জিকা। তিথি: ${panchang.tithiEn}। নক্ষত্ৰ: ${panchang.nakshatraEn}। সূৰ্যোদয়: ${panchang.sunrise}, সূৰ্যাস্ত: ${panchang.sunset}। আপোনাৰ দিনটো শুভ হওক।`;
  }

  // SANSKRIT
  if (langKey === 'sa' || langKey === 'sanskrit') {
    return `ॐ नमः शिवाय। अद्यतन दिनांकः ${panchang.dateSpokenHi}। अद्यतन ${city.name} पञ्चाङ्गम्। तिथिः ${panchang.tithiHi || panchang.tithiEn}। नक्षत्रम्: ${panchang.nakshatraHi || panchang.nakshatraEn}। सूर्योदयः ${panchang.sunrise}, सूर्यास्तः ${panchang.sunset}। सर्वे भवन्तु सुखिनः।`;
  }

  // ENGLISH DEFAULT
  return `Welcome Devotee. Today's Date: ${panchang.dateSpokenEn}. Today's Panchangam for ${city.name}. Tithi: ${panchang.tithiEn}. Nakshatra: ${panchang.nakshatraEn}. Yoga: ${panchang.yogaEn}. Karana: ${panchang.karanaEn}. Rahu Kalam: ${panchang.rahuKalam}. Sunrise: ${panchang.sunrise}, Sunset: ${panchang.sunset}. Have a blessed day.`;
}

module.exports = {
  CITIES,
  getDailyPanchangam,
  generateAudioScript
};
