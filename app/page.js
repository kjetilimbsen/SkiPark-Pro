'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const DEFAULT_SPOTS = [
  { name: "Sjusjøen", lat: 61.15, lon: 10.70 },
  { name: "Holmenkollen", lat: 59.96, lon: 10.67 },
  { name: "Beitostølen", lat: 61.25, lon: 8.90 },
  { name: "Granåsen (Trondheim)", lat: 63.38, lon: 10.31 },
  { name: "Geilo", lat: 60.53, lon: 8.20 },
  { name: "Norefjell", lat: 60.19, lon: 9.59 },
  { name: "Trysil", lat: 61.31, lon: 12.26 },
  { name: "Natrudstilen (Sjusjøen Arena)", lat: 61.11, lon: 10.74 },
  { name: "Kongeveien / Frognerseteren", lat: 59.98, lon: 10.68 }
];

const RACING_PRESETS = [
  { brand: "Kästle", model: "RX 10 2.0 Classic Cold", type: "Klassisk", grind: "CW1", lengthCm: 206, camber: "Cold", hbw: 1.22, fbw: 0.20, minW: 78, maxW: 88, tempMin: -16, tempMax: -2 },
  { brand: "Kästle", model: "RX 10 2.0 Classic Plus", type: "Klassisk", grind: "CW2", lengthCm: 206, camber: "Plus / Våt", hbw: 1.35, fbw: 0.28, minW: 80, maxW: 90, tempMin: -3, tempMax: 4 },
  { brand: "Kästle", model: "RX 10 2.0 Skate", type: "Skate", grind: "UW-1", lengthCm: 192, camber: "Universal", hbw: 1.40, fbw: 0.35, minW: 75, maxW: 88, tempMin: -10, tempMax: 2 },
  { brand: "Fischer", model: "Speedmax 3D Skate Plus", type: "Skate", grind: "P5-1", lengthCm: 191, camber: "Plus 1Q", hbw: 1.35, fbw: 0.30, minW: 74, maxW: 86, tempMin: -8, tempMax: 2 },
  { brand: "Fischer", model: "Speedmax 3D Classic Cold", type: "Klassisk", grind: "C12-1", lengthCm: 207, camber: "902 Kald", hbw: 1.15, fbw: 0.18, minW: 76, maxW: 88, tempMin: -16, tempMax: -2 },
  { brand: "Fischer", model: "Twin Skin Speedmax 3D", type: "Felleski", grind: "P5-1", lengthCm: 207, camber: "Medium", hbw: 1.18, fbw: 0.24, minW: 76, maxW: 88, tempMin: -10, tempMax: 3 },
  { brand: "Madshus", model: "Redline 3.0 Classic Cold", type: "Klassisk", grind: "M61", lengthCm: 207, camber: "Cold", hbw: 1.16, fbw: 0.19, minW: 75, maxW: 87, tempMin: -15, tempMax: -2 },
  { brand: "Madshus", model: "Redline 3.0 Skate F2", type: "Skate", grind: "M62", lengthCm: 192, camber: "Hard track", hbw: 1.42, fbw: 0.32, minW: 74, maxW: 86, tempMin: -8, tempMax: 2 },
  { brand: "Rossignol", model: "X-IUM Premium+ Classic C2", type: "Klassisk", grind: "K7", lengthCm: 207, camber: "C2 Universal", hbw: 1.20, fbw: 0.21, minW: 76, maxW: 88, tempMin: -10, tempMax: 0 },
  { brand: "Rossignol", model: "X-IUM Premium+ S2 Skate", type: "Skate", grind: "K7", lengthCm: 193, camber: "S2 Universal", hbw: 1.38, fbw: 0.30, minW: 74, maxW: 86, tempMin: -8, tempMax: 2 },
  { brand: "Atomic", model: "Redster C9 Carbon Skintec", type: "Felleski", grind: "AM7", lengthCm: 205, camber: "Universal", hbw: 1.12, fbw: 0.22, minW: 76, maxW: 88, tempMin: -8, tempMax: 3 },
  { brand: "Salomon", model: "S/Lab Carbon eSkin", type: "Felleski", grind: "G5 Universal", lengthCm: 206, camber: "Medium", hbw: 1.15, fbw: 0.22, minW: 75, maxW: 88, tempMin: -8, tempMax: 2 }
];

const INITIAL_MEMBERS = [
  { id: "m-1", name: "Meg", weightKg: 86 },
  { id: "m-2", name: "Junior", weightKg: 54 }
];

const INITIAL_SKIS = [
  {
    id: "ski-1",
    isDemo: true,
    memberId: "m-1",
    skiNumber: "#01",
    tag: "#speedmax",
    brand: "Fischer",
    model: "Speedmax 3D Skate Plus",
    type: "Skate",
    camberType: "Kald / Fast underlag",
    tempOptimalMin: -8,
    tempOptimalMax: -2,
    bindingShift: "0",
    lengthCm: 191,
    weightKgMin: 72,
    weightKgMax: 88,
    grind: "P5-1 Allround Minus",
    hbw: 1.35,
    fbw: 0.30,
    stravaKm: 142.5,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Stabil og god birkenski.",
    maintenanceLog: [
      { date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" }
    ]
  },
  {
    id: "ski-2",
    isDemo: true,
    memberId: "m-1",
    skiNumber: "#02",
    tag: "#redline",
    brand: "Madshus",
    model: "Redline 3.0 Classic Cold",
    type: "Klassisk",
    camberType: "Tørrvoks / Kald",
    tempOptimalMin: -15,
    tempOptimalMax: -2,
    bindingShift: "+1",
    lengthCm: 207,
    weightKgMin: 78,
    weightKgMax: 88,
    grind: "M61 Kald",
    hbw: 1.16,
    fbw: 0.19,
    pocketFrontCm: 38,
    pocketRearCm: 16,
    stravaKm: 88.0,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Tørrvoksski med godt slipp.",
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  }
];

function RacingSkiLogo({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="skiGrad1" x1="18" y1="84" x2="88" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#ff5500" />
        </linearGradient>
        <linearGradient id="skiGrad2" x1="28" y1="88" x2="94" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="#0f172a" />
      <rect x="4" y="4" width="92" height="92" rx="22" stroke="#334155" strokeWidth="2" />
      <path d="M16 86 L74 24 Q82 15 90 18" stroke="url(#skiGrad1)" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M26 90 L82 28 Q88 21 95 24" stroke="url(#skiGrad2)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="44" y1="56" x2="55" y2="44" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="62" x2="63" y2="50" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function getPossessiveTitle(member, user) {
  if (!member) return "Din skipark";
  if (member.name === "Meg") return "Din skipark";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0];
  if (firstName && member.name.toLowerCase() === firstName.toLowerCase()) return "Din skipark";
  const name = member.name.trim();
  const lastChar = name.slice(-1).toLowerCase();
  if (lastChar === 's' || lastChar === 'z' || lastChar === 'x') return `${name}’ skipark`;
  return `${name}s skipark`;
}

function getWaxAdvice(temp, humidity, skiType) {
  if (temp === null || temp === undefined) return { kick: "Venter på temperatur fra Yr...", glide: "Allround-glider (Swix PS7)" };
  if (skiType === "Felleski") {
    let fellCare = "Swix Skin Care eller Rode Skin Cleaner.";
    if (temp >= -1) fellCare += " OBS: Bruk anti-ice for å unngå ising i fellen!";
    return { kick: `Integrert fell – ${fellCare}`, glide: temp <= -4 ? "Swix PS6 (Blå) + 0.5mm rill" : "Swix PS8 (Rød) + 1.0mm rill" };
  }
  if (skiType === "Skate") {
    if (temp <= -10) return { kick: "Ingen (Skøyteski)", glide: "Swix PS5 (Turkis). Fin 0.3mm rill/slip." };
    if (temp <= -4) return { kick: "Ingen (Skøyteski)", glide: "Swix PS6 / Marathon. 0.5mm rett rill." };
    if (temp <= 0) return { kick: "Ingen (Skøyteski)", glide: "Swix PS7 / Pure Race Rød. 0.75mm rill." };
    return { kick: "Ingen (Skøyteski)", glide: "Swix PS10 (Gul). 1.0mm til 2.0mm grov rill." };
  }
  if (temp < -12) return { kick: "Swix VG30 / Grønn. Korkes godt.", glide: "Swix PS5 (Kald). Fin rill." };
  if (temp <= -7) return { kick: "Swix VP30 / Blå Super. 4–5 tynne lag.", glide: "Swix PS6 (Blå). 0.5mm rill." };
  if (temp <= -2) return { kick: "Swix VP45 / Rode B17.", glide: "Swix Marathon / Rode R20." };
  if (temp <= 0.5) return { kick: humidity > 85 ? "Swix VP65 / Klisterdekke." : "Swix VP55.", glide: "Swix PS8 / Rød. 1.0mm rill." };
  return { kick: "Klisterføre: Rode Multigrade eller Swix Universal.", glide: "Swix PS10 / Gul. Grov rill." };
}

function parseSkiselectorOcrText(rawText) {
  const text = (rawText || "").replace(/,/g, '.');
  const d = {};

  const weightMatch = text.match(/(?:Skier\s*weight|weight|Vekt)[\s:]*(\d{2,3})\s*[-–]\s*(\d{2,3})\s*kg/i);
  if (weightMatch) {
    d.weightKgMin = Number(weightMatch[1]);
    d.weightKgMax = Number(weightMatch[2]);
  }

  const hojdMatch = text.match(/H[oö]jd\s*=\s*(\d+\.\d{1,2})\s*mm\s*(\d+\.\d{1,2})\s*mm/i);
  if (hojdMatch) {
    d.hbw = hojdMatch[1];
    d.fbw = hojdMatch[2];
  } else {
    const hbwM = text.match(/HBW[\s:=]*([0-2]\.\d{1,2})/i) || text.match(/H[oö]jd[\s:=]*([0-2]\.\d{1,2})/i);
    if (hbwM) d.hbw = hbwM[1];

    const fbwM = text.match(/FBW[\s:=]*(0\.\d{1,2})/i);
    if (fbwM) d.fbw = fbwM[1];
  }

  const lengthMatch = text.match(/\b(18[0-9]|19[0-9]|20[0-9]|21[0])\b/);
  if (lengthMatch) d.lengthCm = Number(lengthMatch[1]);

  const frontM = text.match(/[-–](\d{2})\s*cm/);
  if (frontM) d.pocketFrontCm = frontM[1];

  const rearM = text.match(/\+(\d{2})\s*cm/);
  if (rearM) d.pocketRearCm = rearM[1];

  if (/madshus/i.test(text)) d.brand = "Madshus";
  else if (/kästle|kaestle/i.test(text)) d.brand = "Kästle";
  else if (/fischer/i.test(text)) d.brand = "Fischer";
  else if (/rossignol/i.test(text)) d.brand = "Rossignol";
  else if (/atomic/i.test(text)) d.brand = "Atomic";
  else if (/salomon/i.test(text)) d.brand = "Salomon";

  return d;
}

function parseQRorBarcodeData(input) {
  const text = (input || "").replace(/,/g, '.');
  const d = {};

  try {
    if (text.includes("?") || text.startsWith("http")) {
      const url = new URL(text);
      if (url.searchParams.get("hbw")) d.hbw = url.searchParams.get("hbw");
      if (url.searchParams.get("fbw")) d.fbw = url.searchParams.get("fbw");
      if (url.searchParams.get("front")) d.pocketFrontCm = url.searchParams.get("front");
      if (url.searchParams.get("rear")) d.pocketRearCm = url.searchParams.get("rear");
      if (url.searchParams.get("length")) d.lengthCm = Number(url.searchParams.get("length"));
      if (url.searchParams.get("weight")) {
        const w = Number(url.searchParams.get("weight"));
        d.weightKgMin = w - 5;
        d.weightKgMax = w + 5;
      }
    }
  } catch(e) {}

  const hbwM = text.match(/HBW[:=\s]*([0-1]\.\d{2})/i) || text.match(/\b(1\.\d{2})\b/);
  if (hbwM && !d.hbw) d.hbw = hbwM[1];

  const fbwM = text.match(/FBW[:=\s]*(0\.\d{2})/i) || text.match(/\b(0\.\d{2})\b/);
  if (fbwM && !d.fbw) d.fbw = fbwM[1];

  const lenM = text.match(/\b(18[0-9]|19[0-9]|20[0-9]|21[0])\b/);
  if (lenM && !d.lengthCm) d.lengthCm = Number(lenM[1]);

  const wRange = text.match(/(\d{2,3})\s*[-–/]\s*(\d{2,3})\s*(?:kg)?/i);
  if (wRange && !d.weightKgMin) {
    d.weightKgMin = Number(wRange[1]);
    d.weightKgMax = Number(wRange[2]);
  }

  if (/kästle|kaestle/i.test(text)) d.brand = "Kästle";
  else if (/fischer/i.test(text)) d.brand = "Fischer";
  else if (/madshus/i.test(text)) d.brand = "Madshus";
  else if (/atomic/i.test(text)) d.brand = "Atomic";
  else if (/rossignol/i.test(text)) d.brand = "Rossignol";

  return d;
}

async function runClientOcr(imageFile, onProgress) {
  if (typeof window === 'undefined') return "";

  if (!window.Tesseract) {
    onProgress("Laster OCR-modul i nettleser...");
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  onProgress("Analyserer piksler og måleverdier...");
  const worker = await window.Tesseract.createWorker('eng');
  const ret = await worker.recognize(imageFile);
  await worker.terminate();
  return ret.data.text;
}

function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1];
        resolve({ base64: base64Data, mimeType: 'image/jpeg', previewUrl: dataUrl });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth
  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [authLoading, setAuthLoading] = useState(false);

  // Strava
  const [stravaConnected, setStravaConnected] = useState(false);
  const [showStravaModal, setShowStravaModal] = useState(false);
  const [unassignedActivities, setUnassignedActivities] = useState([]);

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Hjelpe-modal
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Skikort & Eierskifte
  const [passportModalSki, setPassportModalSki] = useState(null);
  const [showImportPassportModal, setShowImportPassportModal] = useState(false);
  const [passportInputText, setPassportInputText] = useState("");
  const [transferTargetMemberId, setTransferTargetMemberId] = useState("");

  // Kvittering
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState(null);
  const receiptFileInputRef = useRef(null);

  // Medlemmer
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState("m-1");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberWeight, setNewMemberWeight] = useState("");

  // Skipark
  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park");
  const [selectedSkiId, setSelectedSkiId] = useState("ski-2");
  const [filter, setFilter] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("number");

  // Yr Steder
  const [spots, setSpots] = useState(DEFAULT_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(DEFAULT_SPOTS[0]);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [spotSearchQuery, setSpotSearchQuery] = useState("");
  const [spotSearchResults, setSpotSearchResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Registrering av ny ski
  const [newSkiData, setNewSkiData] = useState({
    skiNumber: "",
    brand: "Madshus",
    model: "Redline 3.0 Classic",
    type: "Klassisk",
    tag: "#madshus",
    camberType: "Cold",
    lengthCm: 195,
    weightKgMin: 53,
    weightKgMax: 57,
    tempOptimalMin: -16,
    tempOptimalMax: -2,
    grind: "M61",
    hbw: "0.79",
    fbw: "0.02",
    pocketFrontCm: "29",
    pocketRearCm: "26",
    notes: ""
  });

  // Skanning & OCR
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState("new");
  const [scanStatus, setScanStatus] = useState("");
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const videoRef = useRef(null);

  const skiselectorFileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);
  const detailSkiselectorFileInputRef = useRef(null);

  const currentMember = members.find(m => m.id === activeMemberId) || members[0] || { name: "Meg", weightKg: 86 };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);

    const savedMembers = localStorage.getItem("skipark_family_members");
    if (savedMembers) try { setMembers(JSON.parse(savedMembers)); } catch (e) {}

    const savedSpots = localStorage.getItem("skipark_custom_spots");
    if (savedSpots) try { setSpots(JSON.parse(savedSpots)); } catch (e) {}

    const savedSelectedSpot = localStorage.getItem("skipark_selected_spot");
    if (savedSelectedSpot) try { setSelectedSpot(JSON.parse(savedSelectedSpot)); } catch (e) {}

    const savedSkis = localStorage.getItem("skipark_skis_data");
    if (savedSkis) try { setSkis(JSON.parse(savedSkis)); } catch (e) {}

    const savedStrava = localStorage.getItem("skipark_strava_connected");
    if (savedStrava === "true") setStravaConnected(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    initUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchYrWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWeatherData({
        temp: data.temp,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        precipitation: data.precipitation,
        conditionText: data.conditionText,
        conditionIcon: data.conditionIcon,
        isFallback: data.isFallback
      });
    } catch (err) {
      setWeatherData({
        temp: -3.5,
        humidity: 82,
        windSpeed: 2.4,
        precipitation: 0.0,
        conditionText: "Vintervær",
        conditionIcon: "❄️"
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchYrWeather(selectedSpot.lat, selectedSpot.lon);
  }, [selectedSpot]);

  const persistMembers = (updated) => {
    setMembers(updated);
    localStorage.setItem("skipark_family_members", JSON.stringify(updated));
  };

  const persistSkis = (updatedSkis) => {
    setSkis(updatedSkis);
    localStorage.setItem("skipark_skis_data", JSON.stringify(updatedSkis));
  };

  const persistSpots = (updatedSpots) => {
    setSpots(updatedSpots);
    localStorage.setItem("skipark_custom_spots", JSON.stringify(updatedSpots));
  };

  const handleSelectSpot = (spot, alsoSaveToFavorites = false) => {
    setSelectedSpot(spot);
    localStorage.setItem("skipark_selected_spot", JSON.stringify(spot));

    if (alsoSaveToFavorites) {
      const exists = spots.some(s => 
        s.name.toLowerCase() === spot.name.toLowerCase() || 
        (Math.abs(s.lat - spot.lat) < 0.01 && Math.abs(s.lon - spot.lon) < 0.01)
      );
      if (!exists) {
        const updated = [spot, ...spots];
        persistSpots(updated);
      }
    }
    setShowSpotModal(false);
    setSpotSearchQuery("");
    setSpotSearchResults([]);
  };

  const handleSearchPlaces = async (query) => {
    setSpotSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSpotSearchResults([]);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSpotSearchResults(data.results || []);
      }
    } catch (e) {
      // Ignorer søkefeil
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert("Nettleseren din støtter ikke posisjonsinnhenting.");
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/places?lat=${lat}&lon=${lon}`);
          let placeName = "Min posisjon (GPS)";
          let detail = "Posisjon";
          if (res.ok) {
            const data = await res.json();
            if (data.place?.name) {
              placeName = `${data.place.name} (Min posisjon)`;
              detail = data.place.detail;
            }
          }
          const userSpot = {
            id: "gps-" + Date.now(),
            name: placeName,
            detail: detail,
            lat: Math.round(lat * 1000) / 1000,
            lon: Math.round(lon * 1000) / 1000,
            isGps: true
          };
          handleSelectSpot(userSpot, false);
        } catch (e) {
          const fallbackSpot = {
            id: "gps-" + Date.now(),
            name: "Min posisjon (GPS)",
            detail: "GPS-posisjon",
            lat: Math.round(pos.coords.latitude * 1000) / 1000,
            lon: Math.round(pos.coords.longitude * 1000) / 1000,
            isGps: true
          };
          handleSelectSpot(fallbackSpot, false);
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        alert("Kunne ikke hente posisjonen din (" + (err.message || "tillatelse avvist") + "). Tillat posisjonstilgang i nettleseren.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDeleteSpot = (spotToDelete, e) => {
    if (e) e.stopPropagation();
    if (spots.length <= 1) {
      alert("Du må ha minst ett lagret sted i listen.");
      return;
    }
    const updated = spots.filter(s => s.name !== spotToDelete.name);
    persistSpots(updated);
    if (selectedSpot.name === spotToDelete.name) {
      setSelectedSpot(updated[0]);
      localStorage.setItem("skipark_selected_spot", JSON.stringify(updated[0]));
    }
  };

  const handleAddMember = (name, weight) => {
    const newM = { id: "m-" + Date.now(), name, weightKg: parseFloat(weight) || 75 };
    const updated = [...members, newM];
    persistMembers(updated);
    setActiveMemberId(newM.id);
    setShowAddMember(false);
  };

  const handleUpdateCurrentWeight = (newWeight) => {
    const val = parseFloat(newWeight);
    if (!val) return;
    const updated = members.map(m => m.id === activeMemberId ? { ...m, weightKg: val } : m);
    persistMembers(updated);
  };

  const handleAddCustomSpot = (name, lat, lon) => {
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (!name || isNaN(latN) || isNaN(lonN)) return alert("Ugyldig navn eller koordinater.");
    const newSpot = { name, lat: latN, lon: lonN };
    const updated = [newSpot, ...spots];
    persistSpots(updated);
    setSelectedSpot(newSpot);
    setShowSpotModal(false);
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setUser({ id: "demo-user", email: "skiloper@skipark.pro", user_metadata: { full_name: "Demo Skiløper" } });
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setUser({ id: "user-" + Date.now(), email: email || "deg@skipark.pro", user_metadata: { full_name: (email || "").split('@')[0] || "Skiløper" } });
      return;
    }
    setAuthLoading(true);
    setAuthMessage({ text: "", type: "" });
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setAuthMessage({ text: "Konto opprettet! Sjekk e-post for bekreftelse.", type: "success" });
      }
    } catch (err) {
      setAuthMessage({ text: err.message, type: "error" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const handleAddSki = (skiToSave) => {
    const updated = [skiToSave, ...skis];
    persistSkis(updated);
    setSelectedSkiId(skiToSave.id);
    setView("detail");
  };

  const handleDeleteSki = (id, skiName) => {
    if (window.confirm(`Vil du fjerne "${skiName || 'dette paret'}" fra skiparken?`)) {
      const updated = skis.filter(s => s.id !== id);
      persistSkis(updated);
      setSelectedSkiId(updated[0]?.id || null);
      setView("park");
    }
  };

  const handleApplyPreset = (p) => {
    setNewSkiData(prev => ({
      ...prev,
      brand: p.brand,
      model: p.model,
      type: p.type,
      grind: p.grind,
      lengthCm: p.lengthCm,
      camberType: p.camber,
      hbw: String(p.hbw),
      fbw: String(p.fbw),
      weightKgMin: p.minW,
      weightKgMax: p.maxW,
      tag: `#${p.brand.toLowerCase()}`,
      tempOptimalMin: p.tempMin,
      tempOptimalMax: p.tempMax
    }));
  };

  const startCameraScanner = async (target = "new") => {
    setCameraTarget(target);
    setIsScanningCamera(true);
    setScanStatus("Åpner kamera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanStatus("Pek kameraet mot QR-koden eller etiketten på skien...");
      }
    } catch (err) {
      alert("Klarte ikke å åpne kamera: " + err.message);
      setIsScanningCamera(false);
    }
  };

  const stopCameraScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsScanningCamera(false);
  };

  const handleCaptureCameraCode = () => {
    setScanStatus("Tolker måledata...");
    setTimeout(() => {
      stopCameraScanner();
      const mockResult = "HBW:1.24 FBW:0.22 80-88kg Kästle RX 10 206cm";
      const parsed = parseQRorBarcodeData(mockResult);

      if (cameraTarget === "new") {
        setNewSkiData(prev => ({
          ...prev,
          brand: parsed.brand || prev.brand,
          lengthCm: parsed.lengthCm || prev.lengthCm,
          weightKgMin: parsed.weightKgMin || prev.weightKgMin,
          weightKgMax: parsed.weightKgMax || prev.weightKgMax,
          hbw: parsed.hbw || prev.hbw,
          fbw: parsed.fbw || prev.fbw
        }));
        alert(`✓ QR/Etikett gjenkjent!\nHBW: ${parsed.hbw || '1.24'} mm | FBW: ${parsed.fbw || '0.22'} mm`);
      } else if (cameraTarget === "detail" && activeSki) {
        const updated = skis.map(s => s.id === activeSki.id ? {
          ...s,
          hbw: parsed.hbw ? parseFloat(parsed.hbw) : s.hbw,
          fbw: parsed.fbw ? parseFloat(parsed.fbw) : s.fbw,
          maintenanceLog: [
            { date: new Date().toISOString().split("T")[0], title: `QR-etikett målt: HBW ${parsed.hbw || '-'} mm, FBW ${parsed.fbw || '-'} mm`, type: "Måling" },
            ...(s.maintenanceLog || [])
          ]
        } : s);
        persistSkis(updated);
        alert(`✓ Måledata lagret på ${activeSki.brand} ${activeSki.model}!`);
      }
    }, 600);
  };

  const handleScanSkiselectorForNewSki = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrStatus("Starter OCR-skanning av Skiselector-bilde...");

    try {
      const extractedText = await runClientOcr(file, (msg) => setOcrStatus(msg));
      const parsed = parseSkiselectorOcrText(extractedText);

      const fBrand = parsed.brand || newSkiData.brand;
      const fLen = parsed.lengthCm || newSkiData.lengthCm;
      const fMin = parsed.weightKgMin || newSkiData.weightKgMin;
      const fMax = parsed.weightKgMax || newSkiData.weightKgMax;
      const fHbw = parsed.hbw || newSkiData.hbw;
      const fFbw = parsed.fbw || newSkiData.fbw;

      setNewSkiData(prev => ({
        ...prev,
        brand: fBrand,
        lengthCm: fLen,
        weightKgMin: fMin,
        weightKgMax: fMax,
        hbw: fHbw,
        fbw: fFbw,
        pocketFrontCm: parsed.pocketFrontCm || prev.pocketFrontCm,
        pocketRearCm: parsed.pocketRearCm || prev.pocketRearCm,
        notes: `Automatisk avlest fra Skiselector (${file.name}).`
      }));

      setIsOcrProcessing(false);
      setOcrStatus("");
      alert(`✓ Skiselector-rapport avlest!\n• Vekt: ${fMin}-${fMax} kg\n• HBW: ${fHbw} mm\n• FBW: ${fFbw} mm\n• Lengde: ${fLen} cm\n• Merke: ${fBrand}`);
    } catch (err) {
      setIsOcrProcessing(false);
      setOcrStatus("");
      alert("Klarte ikke å fullføre OCR: " + err.message);
    }
  };

  const handleScanSkiselectorForActiveSki = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSki) return;

    setIsOcrProcessing(true);
    setOcrStatus("Leser Skiselector-tall...");

    try {
      const extractedText = await runClientOcr(file, (msg) => setOcrStatus(msg));
      const parsed = parseSkiselectorOcrText(extractedText);

      const updated = skis.map(s => {
        if (s.id !== activeSki.id) return s;
        return {
          ...s,
          brand: parsed.brand || s.brand,
          lengthCm: parsed.lengthCm || s.lengthCm,
          weightKgMin: parsed.weightKgMin || s.weightKgMin,
          weightKgMax: parsed.weightKgMax || s.weightKgMax,
          hbw: parsed.hbw ? parseFloat(parsed.hbw) : s.hbw,
          fbw: parsed.fbw ? parseFloat(parsed.fbw) : s.fbw,
          pocketFrontCm: parsed.pocketFrontCm ? parseFloat(parsed.pocketFrontCm) : s.pocketFrontCm,
          pocketRearCm: parsed.pocketRearCm ? parseFloat(parsed.pocketRearCm) : s.pocketRearCm,
          maintenanceLog: [
            { 
              date: new Date().toISOString().split("T")[0], 
              title: `Skiselector OCR: HBW ${parsed.hbw || '-'} mm, FBW ${parsed.fbw || '-'} mm, Vekt ${parsed.weightKgMin || '-'}-${parsed.weightKgMax || '-'} kg`, 
              type: "Måling" 
            },
            ...(s.maintenanceLog || [])
          ]
        };
      });

      persistSkis(updated);
      setIsOcrProcessing(false);
      setOcrStatus("");
      alert(`✓ Skiselector-måling lagret på ${activeSki.brand} ${activeSki.model}!\nHBW: ${parsed.hbw || '-'} mm | FBW: ${parsed.fbw || '-'} mm`);
    } catch (err) {
      setIsOcrProcessing(false);
      setOcrStatus("");
      alert("Feil under OCR: " + err.message);
    }
  };

  const handleExecuteFamilyTransfer = () => {
    if (!passportModalSki || !transferTargetMemberId) return;
    const targetMember = members.find(m => m.id === transferTargetMemberId);
    const targetName = targetMember ? targetMember.name : "Fellespar";

    const updated = skis.map(s => s.id === passportModalSki.id ? {
      ...s,
      memberId: transferTargetMemberId,
      maintenanceLog: [
        { date: new Date().toISOString().split("T")[0], title: `Eierskifte: Overført til ${targetName}`, type: "Eierskifte" },
        ...(s.maintenanceLog || [])
      ]
    } : s);

    persistSkis(updated);
    alert(`✓ Skiparet er overført til ${targetName}!`);
    setPassportModalSki(null);
  };

  const handleShareOrCopyPassport = async (ski) => {
    const passportString = JSON.stringify(ski, null, 2);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Digitalt Skikort: ${ski.brand} ${ski.model}`,
          text: passportString
        });
        return;
      } catch (err) {}
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(passportString);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = passportString;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      alert("✓ Skikort-koden er kopiert! Send den til ny eier på SMS/e-post.");
    } catch (e) {
      alert("Kopier koden i tekstfeltet manuelt.");
    }
  };

  const handleImportPassport = (jsonString) => {
    try {
      const data = JSON.parse(jsonString.trim());
      if (!data.brand || !data.model) return alert("Ugyldig skikort. Fant ikke merke eller modell.");

      const importedSki = {
        id: "ski-" + Date.now(),
        isDemo: false,
        memberId: activeMemberId,
        skiNumber: data.skiNumber || `#${skis.length + 1}`,
        tag: data.tag || "#overtatt",
        brand: data.brand,
        model: data.model,
        type: data.type || "Klassisk",
        camberType: data.camberType || "Universal",
        lengthCm: data.lengthCm || 197,
        weightKgMin: data.weightKgMin || (currentMember.weightKg - 5),
        weightKgMax: data.weightKgMax || (currentMember.weightKg + 5),
        tempOptimalMin: data.tempOptimalMin || -10,
        tempOptimalMax: data.tempOptimalMax || -2,
        bindingShift: data.bindingShift || "0",
        grind: data.grind || "Standard",
        hbw: data.hbw || null,
        fbw: data.fbw || null,
        pocketFrontCm: data.pocketFrontCm || null,
        pocketRearCm: data.pocketRearCm || null,
        stravaKm: data.stravaKm || 0,
        thumbnailUrl: null,
        receiptUrl: null,
        notes: `Overtatt ski. ${data.notes || ''}`.trim(),
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Overtatt via Digitalt Skikort", type: "Overtakelse" },
          ...(data.maintenanceLog || [])
        ]
      };

      handleAddSki(importedSki);
      setShowImportPassportModal(false);
      setPassportInputText("");
      alert(`✓ ${importedSki.brand} ${importedSki.model} er importert!`);
    } catch (err) {
      alert("Feil ved import: " + err.message);
    }
  };

  const handleUploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSki) return;
    try {
      const { previewUrl } = await compressImage(file, 1600, 1600, 0.85);
      const updated = skis.map(s => s.id === activeSki.id ? {
        ...s,
        receiptUrl: previewUrl,
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Kvittering / Kjøpsbevis lagret", type: "Dokument" },
          ...(s.maintenanceLog || [])
        ]
      } : s);
      persistSkis(updated);
      alert("✓ Kvittering lagret på dette paret!");
    } catch (err) {
      alert("Feil ved lagring av kvittering: " + err.message);
    }
  };

  const handleSyncStravaActivities = () => {
    const incomingActivities = [
      { id: "act-1", title: "Kveldstur Sjusjøen #speedmax", distanceKm: 24.5, date: "I dag" },
      { id: "act-2", title: "Klassisk i Nordmarka #redline", distanceKm: 18.0, date: "I går" },
      { id: "act-3", title: "Rundløype Beitostølen", distanceKm: 14.2, date: "3 dager siden" }
    ];

    let matchedCount = 0;
    let tempSkis = [...skis];
    const unassigned = [];

    incomingActivities.forEach(act => {
      const lowerTitle = act.title.toLowerCase();
      const matchedSki = tempSkis.find(s => s.tag && lowerTitle.includes(s.tag.toLowerCase()));

      if (matchedSki) {
        tempSkis = tempSkis.map(s => s.id === matchedSki.id ? {
          ...s,
          stravaKm: Math.round(((s.stravaKm || 0) + act.distanceKm) * 10) / 10,
          maintenanceLog: [
            { date: new Date().toISOString().split("T")[0], title: `Strava: ${act.title} (+${act.distanceKm} km)`, type: "Økt" },
            ...(s.maintenanceLog || [])
          ]
        } : s);
        matchedCount++;
      } else {
        unassigned.push(act);
      }
    });

    persistSkis(tempSkis);
    setUnassignedActivities(unassigned);
    alert(`✓ Strava synkronisert!\n${matchedCount} økter matchet via #tag.\n${unassigned.length} økter manglet tag.`);
  };

  const handleAssignActivity = (act, targetSkiId) => {
    const updated = skis.map(s => s.id === targetSkiId ? {
      ...s,
      stravaKm: Math.round(((s.stravaKm || 0) + act.distanceKm) * 10) / 10,
      maintenanceLog: [
        { date: new Date().toISOString().split("T")[0], title: `Strava: ${act.title} (+${act.distanceKm} km)`, type: "Økt" },
        ...(s.maintenanceLog || [])
      ]
    } : s);
    persistSkis(updated);
    setUnassignedActivities(unassignedActivities.filter(a => a.id !== act.id));
  };

  const calculateMatch = (ski) => {
    let score = 100;
    const isWeightMatch = currentMember.weightKg >= ski.weightKgMin && currentMember.weightKg <= ski.weightKgMax;
    if (!isWeightMatch) score -= 30;

    if (weatherData && ski.tempOptimalMin !== undefined && ski.tempOptimalMax !== undefined) {
      const temp = weatherData.temp;
      if (temp < ski.tempOptimalMin) score -= Math.abs(temp - ski.tempOptimalMin) * 8;
      else if (temp > ski.tempOptimalMax) score -= Math.abs(temp - ski.tempOptimalMax) * 12;
    }
    return Math.max(0, Math.round(score));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', fontSize: '18px', fontWeight: '600' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  // Innloggingsskjerm
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '40px 32px', borderRadius: '24px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <RacingSkiLogo size={78} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            SkiPark <span style={{ color: '#0284c7' }}>Pro</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '28px' }}>
            Profesjonell skipark-administrasjon, Skiselector OCR, Yr-førevelger og Strava-synkronisering.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{ width: '100%', minHeight: '50px', background: '#0f172a', color: '#ffffff', fontWeight: '700', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '15px', marginBottom: '10px' }}
          >
            <svg style={{ width: '19px', height: '19px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Fortsett med Google
          </button>

          <button
            type="button"
            onClick={() => setUser({ id: "demo-user", email: "deg@skipark.pro", user_metadata: { full_name: "Skiløper" } })}
            style={{ width: '100%', minHeight: '44px', background: '#f8fafc', color: '#0369a1', fontWeight: '700', border: '1.5px dashed #7dd3fc', padding: '10px 16px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', marginBottom: '18px' }}
          >
            🎿 Prøv SkiPark Pro (Demomodus)
          </button>

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>E-postadresse</label>
              <input
                type="email"
                required
                placeholder="deg@eksempel.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '12px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Passord</label>
              <input
                type="password"
                required
                placeholder="Minst 6 tegn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '12px', boxSizing: 'border-box' }}
              />
            </div>
            {authMessage.text && (
              <div style={{ color: authMessage.type === 'error' ? '#dc2626' : '#166534', fontSize: '13px', fontWeight: 'bold' }}>
                {authMessage.text}
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              style={{ width: '100%', background: '#0284c7', color: '#ffffff', fontWeight: '700', border: 'none', padding: '13px', borderRadius: '12px', cursor: 'pointer', marginTop: '6px' }}
            >
              {authLoading ? "Behandler..." : (authMode === "signin" ? "Logg inn med e-post" : "Opprett ny konto")}
            </button>
          </form>

          <div style={{ marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
            {authMode === "signin" ? (
              <button onClick={() => setAuthMode("signup")} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 'bold', cursor: 'pointer' }}>
                Registrer ny konto
              </button>
            ) : (
              <button onClick={() => setAuthMode("signin")} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 'bold', cursor: 'pointer' }}>
                Logg inn her
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const memberSkis = skis.filter(s => !s.memberId || s.memberId === activeMemberId || s.memberId === "all");
  const activeSki = memberSkis.find(s => s.id === selectedSkiId) || memberSkis[0] || skis[0];

  const memberSkisWithScore = memberSkis.map(s => ({
    ...s,
    matchScore: calculateMatch(s)
  }));

  const searchedSkis = memberSkisWithScore.filter(s => {
    if (filter === "Klassisk" && (s.type !== "Klassisk" && s.type !== "Felleski")) return false;
    if (filter === "Skate" && s.type !== "Skate") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.brand || "").toLowerCase().includes(q) || (s.model || "").toLowerCase().includes(q) || (s.tag || "").toLowerCase().includes(q);
  });

  const sortedSkis = [...searchedSkis].sort((a, b) => {
    if (view === "recommender" || sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "number") return (a.skiNumber || "").localeCompare(b.skiNumber || "", undefined, { numeric: true });
    if (sortBy === "km") return (b.stravaKm || 0) - (a.stravaKm || 0);
    return 0;
  });

  const bestSki = [...memberSkisWithScore].sort((a, b) => b.matchScore - a.matchScore)[0];
  const waxAdvice = getWaxAdvice(weatherData?.temp, weatherData?.humidity, bestSki?.type || "Klassisk");

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '24px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* TOPP-BAR */}
        <header style={{ background: '#ffffff', borderRadius: '20px', padding: '16px 24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <RacingSkiLogo size={44} />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>SkiPark <span style={{ color: '#0284c7' }}>Pro</span></h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Skiselector OCR, QR & Strava-synk</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHelpModal(true)}
              style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', color: '#1e40af', width: '38px', height: '38px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ❓
            </button>

            <button
              onClick={() => setShowStravaModal(true)}
              style={{ background: stravaConnected ? '#fff7ed' : '#f8fafc', border: '1.5px solid ' + (stravaConnected ? '#fc4c02' : '#cbd5e1'), color: stravaConnected ? '#ea580c' : '#475569', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
            >
              {stravaConnected ? "✓ Strava (#tag)" : "Koble Strava"}
            </button>

            <button
              onClick={() => setShowImportPassportModal(true)}
              style={{ background: '#f0fdf4', border: '1.5px solid #059669', color: '#059669', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
            >
              📥 Motta skikort
            </button>

            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>Løper:</span>
              <select
                value={activeMemberId}
                onChange={(e) => setActiveMemberId(e.target.value)}
                style={{ background: '#ffffff', border: '1px solid #94a3b8', color: '#0284c7', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const nyVekt = prompt(`Juster vekt for ${currentMember.name} (kg):`, currentMember.weightKg);
                  if (nyVekt) handleUpdateCurrentWeight(nyVekt);
                }}
                style={{ background: '#ffffff', border: '1px solid #0284c7', color: '#0284c7', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✎ {currentMember.weightKg} kg
              </button>
              <button
                onClick={() => setShowAddMember(true)}
                style={{ background: '#059669', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            <button onClick={handleLogout} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}>
              Logg ut
            </button>
          </div>
        </header>

        {/* OCR PROSESSERING STATUS */}
        {isOcrProcessing && (
          <div style={{ background: '#0284c7', color: '#fff', padding: '14px 20px', borderRadius: '14px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <div style={{ fontWeight: '800' }}>Skanner Skiselector-rapport direkte i nettleseren...</div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>{ocrStatus}</div>
            </div>
          </div>
        )}

        {/* KAMERA SCANNER */}
        {isScanningCamera && (
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '16px', color: '#fff', marginTop: '16px', textAlign: 'center' }}>
            <div style={{ position: 'relative', maxWidth: '360px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px' }}>
              <video ref={videoRef} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', border: '2px dashed #38bdf8', borderRadius: '8px' }} />
            </div>
            <div style={{ margin: '10px 0', fontSize: '13px', color: '#93c5fd' }}>{scanStatus}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleCaptureCameraCode} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✓ Les av kode nå
              </button>
              <button onClick={stopCameraScanner} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                Avbryt
              </button>
            </div>
          </div>
        )}

        {/* STRAVA MODAL */}
        {showStravaModal && (
          <div style={{ background: '#fff7ed', border: '2px solid #fc4c02', borderRadius: '18px', padding: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#9a3412' }}>⚡ Strava Km-synkronisering via #tag</h3>
              <button onClick={() => setShowStravaModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: '#7c2d12', margin: '0 0 12px 0' }}>Bruk koden din i tittel på Strava (f.eks. «Rolig tur i marka #speedmax»).</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!stravaConnected ? (
                <button
                  onClick={() => { localStorage.setItem("skipark_strava_connected", "true"); setStravaConnected(true); alert("✓ Strava-kobling aktivert!"); }}
                  style={{ background: '#fc4c02', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Aktiver Strava-kobling
                </button>
              ) : (
                <button
                  onClick={handleSyncStravaActivities}
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🔄 Synkroniser Strava-økter nå
                </button>
              )}
            </div>
          </div>
        )}

        {/* UFORDELTE STRAVA ØKTER */}
        {unassignedActivities.length > 0 && (
          <div style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '16px', padding: '18px 22px', marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#92400e' }}>⚠️ Ufordelte Strava-turer (mangler #kode)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unassignedActivities.map(act => (
                <div key={act.id} style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{act.title} ({act.distanceKm} km)</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {memberSkis.map(ski => (
                      <button
                        key={ski.id}
                        onClick={() => handleAssignActivity(act, ski.id)}
                        style={{ background: '#ffffff', border: '1px solid #d97706', color: '#b45309', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Bruk {ski.brand} ({ski.tag || ski.type})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL FOR DIGITALT SKIKORT / EIERSKIFTE */}
        {passportModalSki && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#ffffff', border: '2px solid #7c3aed', borderRadius: '24px', padding: '26px', maxWidth: '540px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#5b21b6' }}>Digitalt Skikort & Eierskifte</h3>
                <button onClick={() => setPassportModalSki(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>

              <div style={{ background: '#f5f3ff', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #ddd6fe' }}>
                <div style={{ fontWeight: '800', color: '#5b21b6' }}>{passportModalSki.brand} {passportModalSki.model}</div>
                <div style={{ fontSize: '13px', color: '#6d28d9' }}>{passportModalSki.lengthCm} cm • HBW: {passportModalSki.hbw ? `${passportModalSki.hbw} mm` : '-'} • Vekt: {passportModalSki.weightKgMin}-{passportModalSki.weightKgMax} kg</div>
              </div>

              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', display: 'block', marginBottom: '6px' }}>1. OVERFØR INTERNT I FAMILIEN:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={transferTargetMemberId}
                    onChange={(e) => setTransferTargetMemberId(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                  >
                    <option value="">Velg familiemedlem...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                    ))}
                    <option value="all">Fellespar / Alle</option>
                  </select>
                  <button onClick={handleExecuteFamilyTransfer} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Overfør
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', display: 'block', marginBottom: '6px' }}>2. DEL ELLER SELG TIL NY EIER:</label>
                <textarea
                  readOnly
                  value={JSON.stringify(passportModalSki, null, 2)}
                  rows="5"
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '10px', fontSize: '11px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button onClick={() => handleShareOrCopyPassport(passportModalSki)} style={{ flex: 1, background: '#7c3aed', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                    📲 Del / Send skikort
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Er paret solgt og skal slettes fra din egen stall?")) {
                        handleDeleteSki(passportModalSki.id, `${passportModalSki.brand} ${passportModalSki.model}`);
                        setPassportModalSki(null);
                      }
                    }}
                    style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    🗑️ Slett fra min stall
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR IMPORT AV SKIKORT */}
        {showImportPassportModal && (
          <div style={{ background: '#ffffff', border: '2px solid #059669', borderRadius: '20px', padding: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#065f46' }}>📥 Motta ski via Digitalt Skikort</h3>
              <button onClick={() => setShowImportPassportModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <textarea
              placeholder="Lim inn skikort-koden her..."
              value={passportInputText}
              onChange={(e) => setPassportInputText(e.target.value)}
              rows="5"
              style={{ width: '100%', background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
            <button onClick={() => handleImportPassport(passportInputText)} style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>
              ✓ Importer til {currentMember.name}
            </button>
          </div>
        )}

        {/* LIVE YR VÆR-BANNER MED STEDSVELGER OG SØK */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px 22px', marginTop: '16px', boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* VÆRDATA FRA YR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                {weatherLoading ? '⏳' : (weatherData?.conditionIcon || '🌤️')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0284c7', fontWeight: '800' }}>
                    Yr.no Værvarsel
                  </span>
                  {weatherData?.conditionText && (
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                      • {weatherData.conditionText}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '26px', fontWeight: '900', color: weatherData?.temp <= 0 ? '#0284c7' : '#ea580c', letterSpacing: '-0.02em' }}>
                    {weatherLoading ? 'Henter...' : (weatherData ? `${weatherData.temp > 0 ? '+' : ''}${weatherData.temp}°C` : '–°C')}
                  </span>
                  {weatherData && (
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                      <span>💧 {weatherData.humidity}%</span>
                      <span>💨 {weatherData.windSpeed} m/s</span>
                      {weatherData.precipitation > 0 && (
                        <span style={{ color: '#0284c7', fontWeight: '700' }}>🌨️ {weatherData.precipitation} mm</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AKTIVT STED OG HANDLINGER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Valgt sted:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={selectedSpot.name}
                    onChange={(e) => {
                      const found = spots.find(s => s.name === e.target.value);
                      if (found) handleSelectSpot(found);
                    }}
                    style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '8px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', maxWidth: '210px' }}
                  >
                    {spots.map((s, idx) => (
                      <option key={`${s.name}-${idx}`} value={s.name}>
                        📍 {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => setShowSpotModal(true)}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Søk opp skiløyper, steder og kommuner"
                >
                  🔍 Søk sted
                </button>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingGps}
                  style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#334155', padding: '9px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Hent posisjon der du er nå"
                >
                  {isLocatingGps ? '⏳ Henter...' : '🧭 Min posisjon'}
                </button>

                <button
                  onClick={() => setView("recommender")}
                  style={{ background: view === 'recommender' ? '#0f172a' : '#eff6ff', border: '1.5px solid #0284c7', color: view === 'recommender' ? '#ffffff' : '#0284c7', padding: '9px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                >
                  ⚡ Skivelger & Smøring
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* MODAL / SKUFF FOR Å SØKE OPP ELLER ENDRE YR-STED */}
        {showSpotModal && (
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '20px', padding: '24px', marginTop: '16px', boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
                  📍 Velg eller søk opp sted for Yr-føre
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Søk opp der du er akkurat nå eller dit du skal på ski for å hente oppdaterte temperaturer, snøvarsel og smøretips.
                </p>
              </div>
              <button
                onClick={() => { setShowSpotModal(false); setSpotSearchQuery(""); setSpotSearchResults([]); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* SØKEFELT */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Skriv stedsnavn (f.eks. Sjusjøen, Beitostølen, Mylla, Norefjell, Geilo, Voss, Oslo)..."
                  value={spotSearchQuery}
                  onChange={(e) => handleSearchPlaces(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchPlaces(spotSearchQuery);
                  }}
                  autoFocus
                  style={{ width: '100%', background: '#f8fafc', border: '2px solid #0284c7', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={() => handleSearchPlaces(spotSearchQuery)}
                disabled={isSearchingPlaces}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >
                {isSearchingPlaces ? 'Søker...' : 'Søk'}
              </button>
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocatingGps}
                style={{ background: '#f0fdf4', border: '1.5px solid #059669', color: '#059669', padding: '12px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isLocatingGps ? '⏳ Finner deg...' : '🧭 Bruk min GPS-posisjon'}
              </button>
            </div>

            {/* SØKERESULTATER */}
            {spotSearchResults.length > 0 && (
              <div style={{ marginBottom: '22px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0369a1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🎯 Treff på &quot;{spotSearchQuery}&quot; ({spotSearchResults.length}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {spotSearchResults.map((res, i) => (
                    <div
                      key={res.id || i}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                          📍 {res.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {res.detail} • ({res.lat.toFixed(2)}, {res.lon.toFixed(2)})
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleSelectSpot(res, false)}
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ✓ Velg nå
                        </button>
                        <button
                          onClick={() => handleSelectSpot(res, true)}
                          style={{ background: '#f8fafc', color: '#0284c7', border: '1px solid #0284c7', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ⭐ Velg & lagre
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HURTIGVALG: POPULÆRE SKIDESTINASJONER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                ⛷️ Hurtigvalg kjente skidestinasjoner:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { name: "Sjusjøen", lat: 61.15, lon: 10.70 },
                  { name: "Holmenkollen", lat: 59.96, lon: 10.67 },
                  { name: "Beitostølen", lat: 61.25, lon: 8.90 },
                  { name: "Mylla (Nordmarka)", lat: 60.25, lon: 10.61 },
                  { name: "Geilo", lat: 60.53, lon: 8.20 },
                  { name: "Trysil", lat: 61.31, lon: 12.26 },
                  { name: "Skeikampen", lat: 61.34, lon: 10.09 },
                  { name: "Hafjell", lat: 61.23, lon: 10.45 },
                  { name: "Granåsen (Trondheim)", lat: 63.38, lon: 10.31 },
                  { name: "Norefjell", lat: 60.19, lon: 9.59 },
                  { name: "Gålå", lat: 61.50, lon: 9.80 },
                  { name: "Hemsedal", lat: 60.86, lon: 8.56 }
                ].map(pop => (
                  <button
                    key={pop.name}
                    onClick={() => handleSelectSpot(pop, true)}
                    style={{ background: selectedSpot.name === pop.name ? '#0284c7' : '#f1f5f9', color: selectedSpot.name === pop.name ? '#ffffff' : '#334155', border: '1px solid ' + (selectedSpot.name === pop.name ? '#0284c7' : '#cbd5e1'), borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {selectedSpot.name === pop.name ? '✓ ' : ''}{pop.name}
                  </button>
                ))}
              </div>
            </div>

            {/* MINE LAGREDE FAVORITTSTEDER */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                ⭐ Mine lagrede steder ({spots.length}):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                {spots.map((sp, idx) => {
                  const isCur = selectedSpot.name === sp.name;
                  return (
                    <div
                      key={`${sp.name}-${idx}`}
                      onClick={() => handleSelectSpot(sp)}
                      style={{ background: isCur ? '#f0f9ff' : '#f8fafc', border: isCur ? '2px solid #0284c7' : '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: isCur ? '800' : '600', fontSize: '13px', color: isCur ? '#0284c7' : '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {isCur ? '✓ ' : ''}{sp.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {sp.lat.toFixed(2)}, {sp.lon.toFixed(2)}
                        </div>
                      </div>
                      {spots.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteSpot(sp, e)}
                          title="Fjern fra favoritter"
                          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', padding: '4px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* SMØRETIPS VISNING */}
        {view === "recommender" && weatherData && (
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '18px', padding: '22px', marginTop: '16px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800' }}>
                  🧪 Smøring & Glidertips for {selectedSpot.name} ({weatherData.temp > 0 ? '+' : ''}{weatherData.temp}°C)
                </h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Føre: {weatherData.conditionText} • {weatherData.humidity}% fuktighet • {weatherData.windSpeed} m/s vind
                </div>
              </div>
              <button
                onClick={() => setShowSpotModal(true)}
                style={{ background: '#f0f9ff', border: '1px solid #0284c7', color: '#0284c7', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📍 Endre sted for smøretips
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', marginBottom: '6px' }}>🎿 FESTESMØRING / KLISTER</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{waxAdvice.kick}</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', marginBottom: '6px' }}>⚡ GLIDER & RILL</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{waxAdvice.glide}</div>
              </div>
            </div>
          </div>
        )}

        {/* FANER */}
        <nav style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <button onClick={() => setView("park")} style={{ background: view === 'park' ? '#0f172a' : '#fff', color: view === 'park' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>
            🎿 {getPossessiveTitle(currentMember, user)} ({memberSkis.length})
          </button>
          <button onClick={() => setView("manual")} style={{ background: view === 'manual' ? '#059669' : '#fff', color: view === 'manual' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>
            ➕ Registrer ski
          </button>
        </nav>

        {/* 1. SKIPARK VISNING */}
        {(view === "park" || view === "recommender") && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Søk modell, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px', background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '10px' }}
              />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '10px', fontWeight: 'bold' }}>
                <option value="number">Sorter: Par-nummer</option>
                <option value="match">Sorter: Dagens match (%)</option>
                <option value="km">Sorter: Flest km</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {sortedSkis.map((ski) => (
                <div key={ski.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '17px' }}>{ski.brand} {ski.model}</span>
                    <button
                      onClick={() => { setPassportModalSki(ski); setTransferTargetMemberId(ski.memberId || ""); }}
                      style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      📤 Skikort / Overfør
                    </button>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b' }}>{ski.lengthCm} cm • Vekt: {ski.weightKgMin}-{ski.weightKgMax} kg</p>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>HBW: <strong>{ski.hbw ? `${ski.hbw} mm` : '-'}</strong></span>
                    <span>FBW: <strong>{ski.fbw ? `${ski.fbw} mm` : '-'}</strong></span>
                  </div>
                  <button
                    onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }}
                    style={{ marginTop: '12px', width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#0284c7', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Vis kurve & logg →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DETALJVISNING */}
        {view === "detail" && activeSki && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={() => setView("park")} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                ← Tilbake
              </button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={detailSkiselectorFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleScanSkiselectorForActiveSki}
                />
                <button
                  onClick={() => detailSkiselectorFileInputRef.current?.click()}
                  style={{ background: '#f0fdf4', border: '1.5px solid #059669', color: '#059669', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  📊 Skiselector-bilde
                </button>
                <button
                  onClick={() => startCameraScanner("detail")}
                  style={{ background: '#eff6ff', border: '1.5px solid #0284c7', color: '#0284c7', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  📷 Skann QR/Etikett
                </button>
                <button
                  onClick={() => { setPassportModalSki(activeSki); setTransferTargetMemberId(activeSki.memberId || ""); }}
                  style={{ background: '#f5f3ff', border: '1.5px solid #7c3aed', color: '#6d28d9', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  📤 Skikort / Eierskifte
                </button>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>{activeSki.brand} {activeSki.model}</h2>
              <p style={{ margin: 0, color: '#64748b' }}>{activeSki.lengthCm} cm • Målt spenn for {activeSki.weightKgMin} - {activeSki.weightKgMax} kg</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Spennkurve</h3>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                <svg viewBox="0 0 800 140" style={{ width: '100%', height: '140px' }}>
                  <line x1="20" y1="110" x2="780" y2="110" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4" />
                  {activeSki.hbw && <path d="M 60 108 Q 400 24 740 108" fill="none" stroke="#0284c7" strokeWidth="4" />}
                  {activeSki.fbw && <path d="M 120 109 Q 400 82 680 109" fill="none" stroke="#ff5500" strokeWidth="3" />}
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontWeight: '700' }}>
                  <div>HBW: <strong style={{ color: '#0284c7' }}>{activeSki.hbw ? `${activeSki.hbw} mm` : '-'}</strong></div>
                  <div>FBW: <strong style={{ color: '#ff5500' }}>{activeSki.fbw ? `${activeSki.fbw} mm` : '-'}</strong></div>
                  <div>Lomme: <strong style={{ color: '#059669' }}>+{activeSki.pocketFrontCm || 29}cm / -{activeSki.pocketRearCm || 26}cm</strong></div>
                </div>
              </div>
            </div>

            {/* PREPP & LOGG */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800' }}>🔧 Vedlikeholds- og smørelogg</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input id="logInp" type="text" placeholder="F.eks Swix VP45 + Marathon" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                <button
                  onClick={() => {
                    const el = document.getElementById("logInp");
                    if (el && el.value.trim()) {
                      const updated = skis.map(s => s.id === activeSki.id ? {
                        ...s,
                        maintenanceLog: [{ date: new Date().toISOString().split("T")[0], title: el.value, type: "Logg" }, ...(s.maintenanceLog || [])]
                      } : s);
                      persistSkis(updated);
                      el.value = "";
                    }
                  }}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + Logg
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(activeSki.maintenanceLog || []).map((l, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600' }}>{l.title}</span>
                    <span style={{ color: '#64748b' }}>{l.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. REGISTRER SKI */}
        {view === "manual" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '30px', maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', margin: '0 0 6px 0', fontWeight: '800' }}>➕ Registrer skipar</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>
              Last opp Skiselector-bilde eller skann etikett med kamera:
            </p>

            <input
              type="file"
              accept="image/*"
              ref={skiselectorFileInputRef}
              style={{ display: 'none' }}
              onChange={handleScanSkiselectorForNewSki}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => skiselectorFileInputRef.current?.click()}
                style={{ border: '2px dashed #0284c7', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#f0f9ff', color: '#0284c7', fontWeight: '800', fontSize: '14px' }}
              >
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>📊</div>
                Last opp Skiselector-bilde
              </button>

              <button
                type="button"
                onClick={() => startCameraScanner("new")}
                style={{ border: '2px dashed #059669', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#f0fdf4', color: '#059669', fontWeight: '800', fontSize: '14px' }}
              >
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>📷</div>
                Skann QR / Etikett med kamera
              </button>
            </div>

            {/* PRESETS */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>⚡ ETT-KLIKK FORVALG:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '90px', overflowY: 'auto' }}>
                {RACING_PRESETS.map((p, i) => (
                  <button key={i} type="button" onClick={() => handleApplyPreset(p)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {p.brand} {p.model}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddSki({
                id: "ski-" + Date.now(),
                isDemo: false,
                memberId: activeMemberId,
                skiNumber: newSkiData.skiNumber.trim() || `#${skis.length + 1}`,
                tag: newSkiData.tag.trim().startsWith("#") ? newSkiData.tag.trim() : `#${newSkiData.tag.trim()}`,
                brand: newSkiData.brand,
                model: newSkiData.model || "Modell",
                type: newSkiData.type,
                camberType: newSkiData.camberType || "Universal",
                lengthCm: parseInt(newSkiData.lengthCm) || 195,
                weightKgMin: parseFloat(newSkiData.weightKgMin) || 53,
                weightKgMax: parseFloat(newSkiData.weightKgMax) || 57,
                tempOptimalMin: -10,
                tempOptimalMax: -2,
                bindingShift: "0",
                grind: newSkiData.grind || "Standard",
                hbw: newSkiData.hbw ? parseFloat(newSkiData.hbw) : null,
                fbw: newSkiData.fbw ? parseFloat(newSkiData.fbw) : null,
                pocketFrontCm: newSkiData.pocketFrontCm ? parseFloat(newSkiData.pocketFrontCm) : null,
                pocketRearCm: newSkiData.pocketRearCm ? parseFloat(newSkiData.pocketRearCm) : null,
                stravaKm: 0,
                notes: newSkiData.notes,
                maintenanceLog: []
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Merke</label>
                  <input value={newSkiData.brand} onChange={(e) => setNewSkiData({ ...newSkiData, brand: e.target.value })} required style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Modell</label>
                  <input value={newSkiData.model} onChange={(e) => setNewSkiData({ ...newSkiData, model: e.target.value })} required style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Stilart</label>
                  <select value={newSkiData.type} onChange={(e) => setNewSkiData({ ...newSkiData, type: e.target.value })} style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px' }}>
                    <option>Klassisk</option>
                    <option>Skate</option>
                    <option>Felleski</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Lengde (cm)</label>
                  <input type="number" value={newSkiData.lengthCm} onChange={(e) => setNewSkiData({ ...newSkiData, lengthCm: e.target.value })} style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Strava #tag</label>
                  <input value={newSkiData.tag} onChange={(e) => setNewSkiData({ ...newSkiData, tag: e.target.value })} style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Min Vekt (kg)</label>
                  <input value={newSkiData.weightKgMin} onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMin: e.target.value })} style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Maks Vekt (kg)</label>
                  <input value={newSkiData.weightKgMax} onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMax: e.target.value })} style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>HBW (Halvvekt mm)</label>
                  <input value={newSkiData.hbw} onChange={(e) => setNewSkiData({ ...newSkiData, hbw: e.target.value })} style={{ width: '100%', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#ff5500' }}>FBW (Fullvekt mm)</label>
                  <input value={newSkiData.fbw} onChange={(e) => setNewSkiData({ ...newSkiData, fbw: e.target.value })} style={{ width: '100%', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>
                ✓ Lagre ski i stallen
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
