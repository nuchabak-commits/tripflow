/** ISO 3166-1 alpha-2 codes; names come from Intl.DisplayNames (en + th). */
const CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
export type Country = { code: string; en: string; th: string };
const names = (locale: string) => {
  try {
    const d = new Intl.DisplayNames([locale], { type: "region" });
    return (code: string) => d.of(code) || code;
  } catch {
    return (code: string) => code;
  }
};
let cache: Country[] | undefined;
export function countries(): Country[] {
  if (cache) return cache;
  const en = names("en"),
    th = names("th");
  cache = CODES.map((code) => ({ code, en: en(code), th: th(code) })).sort(
    (a, b) => a.en.localeCompare(b.en),
  );
  return cache;
}
export const countryByCode = (code?: string) =>
  code ? countries().find((c) => c.code === code) : undefined;
export const countryByName = (name: string) => {
  const n = normalize(name);
  return countries().find(
    (c) => normalize(c.en) === n || normalize(c.th) === n || c.code === name,
  );
};
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s\-'’.,]+/g, " ")
    .trim();
export type City = {
  en: string;
  th: string;
  code: string;
  lat: number;
  lng: number;
};
// [English, Thai, country, lat, lng] — popular destinations; other cities come from online search.
const RAW: [string, string, string, number, number][] = [
  ["Bangkok", "กรุงเทพมหานคร", "TH", 13.7563, 100.5018],
  ["Chiang Mai", "เชียงใหม่", "TH", 18.7883, 98.9853],
  ["Chiang Rai", "เชียงราย", "TH", 19.9105, 99.8406],
  ["Pai", "ปาย", "TH", 19.3583, 98.4406],
  ["Mae Hong Son", "แม่ฮ่องสอน", "TH", 19.3013, 97.9654],
  ["Lampang", "ลำปาง", "TH", 18.2888, 99.4909],
  ["Nan", "น่าน", "TH", 18.7756, 100.773],
  ["Phrae", "แพร่", "TH", 18.1446, 100.1403],
  ["Sukhothai", "สุโขทัย", "TH", 17.0078, 99.823],
  ["Phitsanulok", "พิษณุโลก", "TH", 16.8211, 100.2659],
  ["Tak", "ตาก", "TH", 16.8839, 99.1258],
  ["Khao Kho", "เขาค้อ", "TH", 16.6528, 101.1286],
  ["Chiang Khan", "เชียงคาน", "TH", 17.8986, 101.6603],
  ["Loei", "เลย", "TH", 17.4861, 101.7223],
  ["Nong Khai", "หนองคาย", "TH", 17.8783, 102.742],
  ["Udon Thani", "อุดรธานี", "TH", 17.4138, 102.787],
  ["Khon Kaen", "ขอนแก่น", "TH", 16.4322, 102.8236],
  ["Nakhon Phanom", "นครพนม", "TH", 17.3923, 104.7695],
  ["Ubon Ratchathani", "อุบลราชธานี", "TH", 15.2287, 104.8564],
  ["Buriram", "บุรีรัมย์", "TH", 14.993, 103.1029],
  ["Nakhon Ratchasima", "นครราชสีมา", "TH", 14.9799, 102.0977],
  ["Khao Yai", "เขาใหญ่", "TH", 14.4392, 101.3725],
  ["Nakhon Nayok", "นครนายก", "TH", 14.2069, 101.2131],
  ["Ayutthaya", "พระนครศรีอยุธยา", "TH", 14.3532, 100.5689],
  ["Lopburi", "ลพบุรี", "TH", 14.7995, 100.6534],
  ["Kanchanaburi", "กาญจนบุรี", "TH", 14.0228, 99.5328],
  ["Amphawa", "อัมพวา", "TH", 13.4253, 99.955],
  ["Nakhon Pathom", "นครปฐม", "TH", 13.8199, 100.0621],
  ["Ratchaburi", "ราชบุรี", "TH", 13.5283, 99.8134],
  ["Phetchaburi", "เพชรบุรี", "TH", 13.1119, 99.9398],
  ["Cha-am", "ชะอำ", "TH", 12.8, 99.9667],
  ["Hua Hin", "หัวหิน", "TH", 12.5684, 99.9577],
  ["Pranburi", "ปราณบุรี", "TH", 12.3916, 99.9146],
  ["Prachuap Khiri Khan", "ประจวบคีรีขันธ์", "TH", 11.812, 99.7973],
  ["Pattaya", "พัทยา", "TH", 12.9236, 100.8825],
  ["Bang Saen", "บางแสน", "TH", 13.2847, 100.9153],
  ["Rayong", "ระยอง", "TH", 12.6814, 101.2816],
  ["Ko Samet", "เกาะเสม็ด", "TH", 12.5657, 101.4497],
  ["Chanthaburi", "จันทบุรี", "TH", 12.6114, 102.1039],
  ["Trat", "ตราด", "TH", 12.2428, 102.5175],
  ["Ko Chang", "เกาะช้าง", "TH", 12.0626, 102.3337],
  ["Ko Kut", "เกาะกูด", "TH", 11.6592, 102.5664],
  ["Chumphon", "ชุมพร", "TH", 10.493, 99.18],
  ["Ranong", "ระนอง", "TH", 9.9658, 98.6348],
  ["Surat Thani", "สุราษฎร์ธานี", "TH", 9.1382, 99.3217],
  ["Khao Sok", "เขาสก", "TH", 8.9116, 98.5287],
  ["Ko Samui", "เกาะสมุย", "TH", 9.512, 100.0136],
  ["Ko Pha Ngan", "เกาะพะงัน", "TH", 9.7319, 100.0136],
  ["Ko Tao", "เกาะเต่า", "TH", 10.0956, 99.8404],
  ["Nakhon Si Thammarat", "นครศรีธรรมราช", "TH", 8.4304, 99.9631],
  ["Khao Lak", "เขาหลัก", "TH", 8.6367, 98.2487],
  ["Phang Nga", "พังงา", "TH", 8.4509, 98.5255],
  ["Phuket", "ภูเก็ต", "TH", 7.8804, 98.3923],
  ["Krabi", "กระบี่", "TH", 8.0863, 98.9063],
  ["Ao Nang", "อ่าวนาง", "TH", 8.0325, 98.8238],
  ["Ko Phi Phi", "เกาะพีพี", "TH", 7.7407, 98.7784],
  ["Ko Lanta", "เกาะลันตา", "TH", 7.6245, 99.0791],
  ["Trang", "ตรัง", "TH", 7.5594, 99.6114],
  ["Ko Lipe", "เกาะหลีเป๊ะ", "TH", 6.4886, 99.3041],
  ["Satun", "สตูล", "TH", 6.6238, 100.0674],
  ["Hat Yai", "หาดใหญ่", "TH", 7.0086, 100.4747],
  ["Songkhla", "สงขลา", "TH", 7.1898, 100.5954],
  ["Betong", "เบตง", "TH", 5.7735, 101.0729],
  ["Tokyo", "โตเกียว", "JP", 35.6762, 139.6503],
  ["Osaka", "โอซาก้า", "JP", 34.6937, 135.5023],
  ["Kyoto", "เกียวโต", "JP", 35.0116, 135.7681],
  ["Nara", "นารา", "JP", 34.6851, 135.8048],
  ["Kobe", "โกเบ", "JP", 34.6901, 135.1955],
  ["Yokohama", "โยโกฮาม่า", "JP", 35.4437, 139.638],
  ["Hakone", "ฮาโกเน่", "JP", 35.2324, 139.1069],
  ["Kawaguchiko", "คาวากูจิโกะ", "JP", 35.5171, 138.7519],
  ["Nagoya", "นาโกย่า", "JP", 35.1815, 136.9066],
  ["Takayama", "ทาคายามะ", "JP", 36.1461, 137.2522],
  ["Kanazawa", "คานาซาวะ", "JP", 36.5613, 136.6562],
  ["Hiroshima", "ฮิโรชิม่า", "JP", 34.3853, 132.4553],
  ["Fukuoka", "ฟุกุโอกะ", "JP", 33.5904, 130.4017],
  ["Sapporo", "ซัปโปโร", "JP", 43.0618, 141.3545],
  ["Otaru", "โอตารุ", "JP", 43.1907, 140.9947],
  ["Hakodate", "ฮาโกดาเตะ", "JP", 41.7688, 140.7288],
  ["Sendai", "เซนได", "JP", 38.2682, 140.8694],
  ["Okinawa", "โอกินาว่า", "JP", 26.2124, 127.6809],
  ["Seoul", "โซล", "KR", 37.5665, 126.978],
  ["Busan", "ปูซาน", "KR", 35.1796, 129.0756],
  ["Jeju", "เชจู", "KR", 33.4996, 126.5312],
  ["Taipei", "ไทเป", "TW", 25.033, 121.5654],
  ["Taichung", "ไถจง", "TW", 24.1477, 120.6736],
  ["Tainan", "ไถหนาน", "TW", 22.9999, 120.227],
  ["Kaohsiung", "เกาสง", "TW", 22.6273, 120.3014],
  ["Hong Kong", "ฮ่องกง", "HK", 22.3193, 114.1694],
  ["Macau", "มาเก๊า", "MO", 22.1987, 113.5439],
  ["Beijing", "ปักกิ่ง", "CN", 39.9042, 116.4074],
  ["Shanghai", "เซี่ยงไฮ้", "CN", 31.2304, 121.4737],
  ["Chengdu", "เฉิงตู", "CN", 30.5728, 104.0668],
  ["Chongqing", "ฉงชิ่ง", "CN", 29.563, 106.5516],
  ["Xi'an", "ซีอาน", "CN", 34.3416, 108.9398],
  ["Guangzhou", "กวางโจว", "CN", 23.1291, 113.2644],
  ["Shenzhen", "เซินเจิ้น", "CN", 22.5431, 114.0579],
  ["Kunming", "คุนหมิง", "CN", 25.0389, 102.7183],
  ["Lijiang", "ลี่เจียง", "CN", 26.8721, 100.2299],
  ["Guilin", "กุ้ยหลิน", "CN", 25.274, 110.29],
  ["Hangzhou", "หางโจว", "CN", 30.2741, 120.1551],
  ["Zhangjiajie", "จางเจียเจี้ย", "CN", 29.117, 110.4792],
  ["Harbin", "ฮาร์บิน", "CN", 45.8038, 126.535],
  ["Xiamen", "เซียะเหมิน", "CN", 24.4798, 118.0894],
  ["Singapore", "สิงคโปร์", "SG", 1.3521, 103.8198],
  ["Kuala Lumpur", "กัวลาลัมเปอร์", "MY", 3.139, 101.6869],
  ["Penang", "ปีนัง", "MY", 5.4141, 100.3288],
  ["Langkawi", "ลังกาวี", "MY", 6.35, 99.8],
  ["Malacca", "มะละกา", "MY", 2.1896, 102.2501],
  ["Kota Kinabalu", "โกตากินะบะลู", "MY", 5.9804, 116.0735],
  ["Bali", "บาหลี", "ID", -8.4095, 115.1889],
  ["Jakarta", "จาการ์ตา", "ID", -6.2088, 106.8456],
  ["Yogyakarta", "ยอกยาการ์ตา", "ID", -7.7956, 110.3695],
  ["Hanoi", "ฮานอย", "VN", 21.0278, 105.8342],
  ["Ha Long", "ฮาลอง", "VN", 20.9517, 107.0801],
  ["Sapa", "ซาปา", "VN", 22.3364, 103.8438],
  ["Da Nang", "ดานัง", "VN", 16.0544, 108.2022],
  ["Hoi An", "ฮอยอัน", "VN", 15.8801, 108.338],
  ["Hue", "เว้", "VN", 16.4637, 107.5909],
  ["Da Lat", "ดาลัด", "VN", 11.9404, 108.4583],
  ["Nha Trang", "ญาจาง", "VN", 12.2388, 109.1967],
  ["Ho Chi Minh City", "โฮจิมินห์", "VN", 10.8231, 106.6297],
  ["Phu Quoc", "ฟูก๊วก", "VN", 10.2899, 103.984],
  ["Luang Prabang", "หลวงพระบาง", "LA", 19.8856, 102.1347],
  ["Vientiane", "เวียงจันทน์", "LA", 17.9757, 102.6331],
  ["Vang Vieng", "วังเวียง", "LA", 18.9235, 102.4478],
  ["Pakse", "ปากเซ", "LA", 15.1202, 105.7988],
  ["Siem Reap", "เสียมเรียบ", "KH", 13.3671, 103.8448],
  ["Phnom Penh", "พนมเปญ", "KH", 11.5564, 104.9282],
  ["Yangon", "ย่างกุ้ง", "MM", 16.8409, 96.1735],
  ["Bagan", "พุกาม", "MM", 21.1717, 94.8585],
  ["Manila", "มะนิลา", "PH", 14.5995, 120.9842],
  ["Cebu", "เซบู", "PH", 10.3157, 123.8854],
  ["Boracay", "โบราไกย์", "PH", 11.9674, 121.9248],
  ["Kathmandu", "กาฐมาณฑุ", "NP", 27.7172, 85.324],
  ["Pokhara", "โพขรา", "NP", 28.2096, 83.9856],
  ["Thimphu", "ทิมพู", "BT", 27.4728, 89.639],
  ["New Delhi", "นิวเดลี", "IN", 28.6139, 77.209],
  ["Agra", "อักรา", "IN", 27.1767, 78.0081],
  ["Jaipur", "ชัยปุระ", "IN", 26.9124, 75.7873],
  ["Mumbai", "มุมไบ", "IN", 19.076, 72.8777],
  ["Leh", "เลห์", "IN", 34.1526, 77.5771],
  ["Colombo", "โคลัมโบ", "LK", 6.9271, 79.8612],
  ["Malé", "มาเล", "MV", 4.1755, 73.5093],
  ["Dubai", "ดูไบ", "AE", 25.2048, 55.2708],
  ["Abu Dhabi", "อาบูดาบี", "AE", 24.4539, 54.3773],
  ["Doha", "โดฮา", "QA", 25.2854, 51.531],
  ["Istanbul", "อิสตันบูล", "TR", 41.0082, 28.9784],
  ["Cappadocia", "คัปปาโดเกีย", "TR", 38.6431, 34.8289],
  ["Cairo", "ไคโร", "EG", 30.0444, 31.2357],
  ["Tbilisi", "ทบิลิซี", "GE", 41.7151, 44.8271],
  ["Almaty", "อัลมาตี", "KZ", 43.222, 76.8512],
  ["Tashkent", "ทาชเคนต์", "UZ", 41.2995, 69.2401],
  ["Samarkand", "ซามาร์คันด์", "UZ", 39.6542, 66.9597],
  ["London", "ลอนดอน", "GB", 51.5072, -0.1276],
  ["Edinburgh", "เอดินบะระ", "GB", 55.9533, -3.1883],
  ["Paris", "ปารีส", "FR", 48.8566, 2.3522],
  ["Nice", "นีซ", "FR", 43.7102, 7.262],
  ["Rome", "โรม", "IT", 41.9028, 12.4964],
  ["Milan", "มิลาน", "IT", 45.4642, 9.19],
  ["Venice", "เวนิส", "IT", 45.4408, 12.3155],
  ["Florence", "ฟลอเรนซ์", "IT", 43.7696, 11.2558],
  ["Barcelona", "บาร์เซโลนา", "ES", 41.3874, 2.1686],
  ["Madrid", "มาดริด", "ES", 40.4168, -3.7038],
  ["Lisbon", "ลิสบอน", "PT", 38.7223, -9.1393],
  ["Porto", "ปอร์โต", "PT", 41.1579, -8.6291],
  ["Amsterdam", "อัมสเตอร์ดัม", "NL", 52.3676, 4.9041],
  ["Brussels", "บรัสเซลส์", "BE", 50.8503, 4.3517],
  ["Berlin", "เบอร์ลิน", "DE", 52.52, 13.405],
  ["Munich", "มิวนิก", "DE", 48.1351, 11.582],
  ["Frankfurt", "แฟรงก์เฟิร์ต", "DE", 50.1109, 8.6821],
  ["Vienna", "เวียนนา", "AT", 48.2082, 16.3738],
  ["Hallstatt", "ฮัลล์ชตัทท์", "AT", 47.5622, 13.6493],
  ["Salzburg", "ซาลซ์บูร์ก", "AT", 47.8095, 13.055],
  ["Prague", "ปราก", "CZ", 50.0755, 14.4378],
  ["Budapest", "บูดาเปสต์", "HU", 47.4979, 19.0402],
  ["Zurich", "ซูริก", "CH", 47.3769, 8.5417],
  ["Lucerne", "ลูเซิร์น", "CH", 47.0502, 8.3093],
  ["Interlaken", "อินเทอร์ลาเคน", "CH", 46.6863, 7.8632],
  ["Zermatt", "เซอร์แมท", "CH", 46.0207, 7.7491],
  ["Geneva", "เจนีวา", "CH", 46.2044, 6.1432],
  ["Copenhagen", "โคเปนเฮเกน", "DK", 55.6761, 12.5683],
  ["Stockholm", "สตอกโฮล์ม", "SE", 59.3293, 18.0686],
  ["Oslo", "ออสโล", "NO", 59.9139, 10.7522],
  ["Tromsø", "ทรอมโซ", "NO", 69.6492, 18.9553],
  ["Helsinki", "เฮลซิงกิ", "FI", 60.1699, 24.9384],
  ["Rovaniemi", "โรวาเนียมิ", "FI", 66.5039, 25.7294],
  ["Reykjavik", "เรคยาวิก", "IS", 64.1466, -21.9426],
  ["Athens", "เอเธนส์", "GR", 37.9838, 23.7275],
  ["Santorini", "ซานโตรินี", "GR", 36.3932, 25.4615],
  ["Dubrovnik", "ดูบรอฟนิก", "HR", 42.6507, 18.0944],
  ["New York", "นิวยอร์ก", "US", 40.7128, -74.006],
  ["Los Angeles", "ลอสแอนเจลิส", "US", 34.0522, -118.2437],
  ["San Francisco", "ซานฟรานซิสโก", "US", 37.7749, -122.4194],
  ["Las Vegas", "ลาสเวกัส", "US", 36.1699, -115.1398],
  ["Seattle", "ซีแอตเทิล", "US", 47.6062, -122.3321],
  ["Chicago", "ชิคาโก", "US", 41.8781, -87.6298],
  ["Honolulu", "โฮโนลูลู", "US", 21.3069, -157.8583],
  ["Vancouver", "แวนคูเวอร์", "CA", 49.2827, -123.1207],
  ["Toronto", "โทรอนโต", "CA", 43.6532, -79.3832],
  ["Sydney", "ซิดนีย์", "AU", -33.8688, 151.2093],
  ["Melbourne", "เมลเบิร์น", "AU", -37.8136, 144.9631],
  ["Brisbane", "บริสเบน", "AU", -27.4698, 153.0251],
  ["Perth", "เพิร์ท", "AU", -31.9523, 115.8613],
  ["Auckland", "โอ๊คแลนด์", "NZ", -36.8485, 174.7633],
  ["Queenstown", "ควีนส์ทาวน์", "NZ", -45.0312, 168.6626],
];
export const CITIES: City[] = RAW.map(([en, th, code, lat, lng]) => ({
  en,
  th,
  code,
  lat,
  lng,
}));
/** Local matches: prefix matches first, then substring, in English or Thai. */
export function findCities(query: string, limit = 8): City[] {
  const q = normalize(query);
  if (!q) return [];
  const score = (c: City) => {
    const names = [normalize(c.en), normalize(c.th)];
    if (names.some((n) => n === q)) return 0;
    if (names.some((n) => n.startsWith(q))) return 1;
    if (names.some((n) => n.split(" ").some((w) => w.startsWith(q)))) return 2;
    if (names.some((n) => n.includes(q))) return 3;
    const country = countryByCode(c.code);
    if (country && [country.en, country.th].some((n) => normalize(n).startsWith(q)))
      return 4;
    return -1;
  };
  return CITIES.map((c) => [c, score(c)] as const)
    .filter(([, s]) => s >= 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([c]) => c);
}
export const cityByName = (name: string, code?: string) => {
  const n = normalize(name);
  return CITIES.find(
    (c) =>
      (normalize(c.en) === n || normalize(c.th) === n) &&
      (!code || c.code === code),
  );
};
export function findCountries(query: string, limit = 8): Country[] {
  const q = normalize(query);
  const all = countries();
  if (!q) return all.slice(0, limit);
  const score = (c: Country) => {
    const names = [normalize(c.en), normalize(c.th)];
    if (c.code.toLowerCase() === q || names.some((n) => n === q)) return 0;
    if (names.some((n) => n.startsWith(q))) return 1;
    if (names.some((n) => n.includes(q))) return 2;
    return -1;
  };
  return all
    .map((c) => [c, score(c)] as const)
    .filter(([, s]) => s >= 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([c]) => c);
}
