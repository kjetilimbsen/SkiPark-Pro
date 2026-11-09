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
  { brand: "Madshus", model: "Redline 3.0 Classic Cold", type: "Klassisk", grind: "M61", lengthCm: 207, camber: "Cold", hbw: 1.16, fbw: 0.19, minW: 75, maxW: 87, tempMin: -15, tempMax: -2 },
  { brand: "Madshus", model: "Redline 3.0 Skate F2", type: "Skate", grind: "M62", lengthCm: 192, camber: "Hard track", hbw: 1.42, fbw: 0.32, minW: 74, maxW: 86, tempMin: -8, tempMax: 2 },
  { brand: "Rossignol", model: "X-IUM Premium+ Classic C2", type: "Klassisk", grind: "K7", lengthCm: 207, camber: "C2 Universal", hbw: 1.20, fbw: 0.21, minW: 76, maxW: 88, tempMin: -10, tempMax: 0 },
  { brand: "Atomic", model: "Redster C9 Carbon Skintec", type: "Felleski", grind: "AM7", lengthCm: 205, camber: "Universal", hbw: 1.12, fbw: 0.22, minW: 76, maxW: 88, tempMin: -8, tempMax: 3 }
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
      <line x1="18" y1="74" x2="74" y2="18" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="26" y1="82" x2="82" y2="26" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M18 64 Q50 38 82 46" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" opacity="0.7" />
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

// Robust tolk for ren Skiselector-skjermbilde OCR-tekst
function parseSkiselectorOcrText(rawText) {
  const text = (rawText || "").replace(/,/g, '.');
  const d = {};

  // 1. Skier weight: XX - YY kg
  const weightMatch = text.match(/(?:Skier\s*weight|weight|Vekt)[\s:]*(\d{2,3})\s*[-–]\s*(\d{2,3})\s*kg/i);
  if (weightMatch) {
    d.weightKgMin = Number(weightMatch[1]);
    d.weightKgMax = Number(weightMatch[2]);
  }

  // 2. Höjd / HBW og FBW fra tabellen oppe til høyre
  // Typisk: "Höjd = 0.79 mm 0.02 mm" eller "0.95 mm 0.21 mm"
  const hojdMatch = text.match(/H[oö]jd\s*=\s*(\d+\.\d{1,2})\s*mm\s*(\d+\.\d{1,2})\s*mm/i);
  if (hojdMatch) {
    d.hbw = hojdMatch[1];
    d.fbw = hojdMatch[2];
  } else {
    // Frittstående HBW / FBW søk
    const hbwM = text.match(/HBW[\s:=]*([0-2]\.\d{1,2})/i) || text.match(/H[oö]jd[\s:=]*([0-2]\.\d{1,2})/i);
    if (hbwM) d.hbw = hbwM[1];

    const fbwM = text.match(/FBW[\s:=]*(0\.\d{1,2})/i);
    if (fbwM) d.fbw = fbwM[1];
  }

  // 3. Lengde (fra nedtrekksmeny til venstre, f.eks 195, 206, 207)
  const lengthMatch = text.match(/\b(18[0-9]|19[0-9]|20[0-9]|21[0])\b/);
  if (lengthMatch) {
    d.lengthCm = Number(lengthMatch[1]);
  }

  // 4. Smørelommer fra aksen nederst
  // Ser etter f.eks "-29cm" eller "29cm" og "+26cm"
  const frontM = text.match(/[-–](\d{2})\s*cm/);
  if (frontM) d.pocketFrontCm = frontM[1];

  const rearM = text.match(/\+(\d{2})\s*cm/);
  if (rearM) d.pocketRearCm = rearM[1];

  // 5. Merke
  if (/madshus/i.test(text)) d.brand = "Madshus";
  else if (/kästle|kaestle/i.test(text)) d.brand = "Kästle";
  else if (/fischer/i.test(text)) d.brand = "Fischer";
  else if (/rossignol/i.test(text)) d.brand = "Rossignol";
  else if (/atomic/i.test(text)) d.brand = "Atomic";
  else if (/salomon/i.test(text)) d.brand = "Salomon";

  return d;
}

// Laster inn Tesseract OCR dynamisk i nettleseren ved behov
async function runClientOcr(imageFile, onProgress) {
  if (typeof window === 'undefined') return "";

  if (!window.Tesseract) {
    onProgress("Laster inn OCR-motor i nettleseren...");
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  onProgress("Skanner bildet og leser av Skiselector-grafen...");
  const worker = await window.Tesseract.createWorker('eng');
  const ret = await worker.recognize(imageFile);
  await worker.terminate();
  return ret.data.text;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth states
  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [authLoading, setAuthLoading] = useState(false);

  // Strava state
  const [stravaConnected, setStravaConnected] = useState(false);
  const [showStravaModal, setShowStravaModal] = useState(false);
  const [unassignedActivities, setUnassignedActivities] = useState([]);

  // Hjelp / Skikort
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [transferModalSki, setTransferModalSki] = useState(null);
  const [showImportPassportModal, setShowImportPassportModal] = useState(false);
  const [passportInputText, setPassportInputText] = useState("");

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
  const [selectedSkiId, setSelectedSkiId] = useState("ski-1");
  const [filter, setFilter] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("number");

  // Yr Steder
  const [spots, setSpots] = useState(DEFAULT_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(DEFAULT_SPOTS[0]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Registrering av ski
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

  // Skiselector OCR status
  const [ocrStatus, setOcrStatus] = useState("");
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const skiselectorFileInputRef = useRef(null);
  const detailSkiselectorFileInputRef = useRef(null);
  const [showDetailQrBox, setShowDetailQrBox] = useState(false);

  const currentMember = members.find(m => m.id === activeMemberId) || members[0] || { name: "Meg", weightKg: 86 };

  useEffect(() => {
    const savedMembers = localStorage.getItem("skipark_family_members");
    if (savedMembers) try { setMembers(JSON.parse(savedMembers)); } catch (e) {}

    const savedSpots = localStorage.getItem("skipark_custom_spots");
    if (savedSpots) try { setSpots(JSON.parse(savedSpots)); } catch (e) {}

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
  }, []);

  const fetchYrWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const current = data.properties.timeseries[0].data.instant.details;
      setWeatherData({
        temp: current.air_temperature,
        humidity: current.relative_humidity,
        windSpeed: current.wind_speed
      });
    } catch (err) {
      setWeatherData({ temp: -3.5, humidity: 82, windSpeed: 2.4 });
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

  // Ekte klientside-OCR på opplastet Skiselector-bilde for NY ski
  const handleScanSkiselectorForNewSki = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrStatus("Starter bildeanalyse...");

    try {
      const extractedText = await runClientOcr(file, (msg) => setOcrStatus(msg));
      const parsed = parseSkiselectorOcrText(extractedText);

      setNewSkiData(prev => ({
        ...prev,
        brand: parsed.brand || prev.brand,
        lengthCm: parsed.lengthCm || prev.lengthCm,
        weightKgMin: parsed.weightKgMin || prev.weightKgMin,
        weightKgMax: parsed.weightKgMax || prev.weightKgMax,
        hbw: parsed.hbw || prev.hbw,
        fbw: parsed.fbw || prev.fbw,
        pocketFrontCm: parsed.pocketFrontCm || prev.pocketFrontCm,
        pocketRearCm: parsed.pocketRearCm || prev.pocketRearCm,
        notes: `Automatisk avlest fra Skiselector (${file.name}).`
      }));

      setIsOcrProcessing(false);
      setOcrStatus("");
      alert(`✓ Skiselector-rapport avlest!\n• Vekt: ${parsed.weightKgMin || '?'}-${parsed.weightKgMax || '?'} kg\n• HBW: ${parsed.hbw || '?'} mm\n• FBW: ${parsed.fbw || '?'} mm\n• Lengde: ${parsed.lengthCm || '?'} cm`);
    } catch (err) {
      setIsOcrProcessing(false);
      setOcrStatus("");
      alert("Klarte ikke å fullføre OCR: " + err.message);
    }
  };

  // Ekte klientside-OCR på opplastet Skiselector-bilde for AKTIV ski (detaljside)
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
      setShowDetailQrBox(false);
      alert(`✓ Skiselector-måling lagret på ${activeSki.brand} ${activeSki.model}!\nHBW: ${parsed.hbw || '-'} mm | FBW: ${parsed.fbw || '-'} mm | Løpervekt: ${parsed.weightKgMin || '-'}-${parsed.weightKgMax || '-'} kg`);
    } catch (err) {
      setIsOcrProcessing(false);
      setOcrStatus("");
      alert("Feil under OCR-skanning: " + err.message);
    }
  };

  // Universell del/kopier skikort-funksjon
  const handleShareOrCopyPassport = async (ski) => {
    const passportString = JSON.stringify(ski, null, 2);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Skikort: ${ski.brand} ${ski.model}`,
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
      alert("✓ Skikort-koden er kopiert til utklippstavlen!");
    } catch (e) {
      alert("Kopier teksten fra ruten manuelt.");
    }
  };

  const handleTransferSkiToFamilyMember = (skiId, targetMemberId) => {
    const targetMember = members.find(m => m.id === targetMemberId);
    const targetName = targetMember ? targetMember.name : "Fellespar";

    const updated = skis.map(s => s.id === skiId ? {
      ...s,
      memberId: targetMemberId,
      maintenanceLog: [
        { 
          date: new Date().toISOString().split("T")[0], 
          title: `Overført i familien: Til ${targetName}`, 
          type: "Eierskifte" 
        },
        ...(s.maintenanceLog || [])
      ]
    } : s);

    persistSkis(updated);
    alert(`✓ Skiparet er nå tildelt ${targetName}!`);
  };

  const handleImportPassport = (jsonString) => {
    try {
      const data = JSON.parse(jsonString.trim());
      if (!data.brand || !data.model) return alert("Ugyldig format på skikortet.");

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
        notes: `Importert skikort. ${data.notes || ''}`.trim(),
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Importert via digitalt skikort", type: "Overtakelse" },
          ...(data.maintenanceLog || [])
        ]
      };

      handleAddSki(importedSki);
      setShowImportPassportModal(false);
      setPassportInputText("");
      alert(`✓ ${importedSki.brand} ${importedSki.model} importert!`);
    } catch (err) {
      alert("Feil ved import: " + err.message);
    }
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
    return (
      (s.brand || "").toLowerCase().includes(q) ||
      (s.model || "").toLowerCase().includes(q) ||
      (s.skiNumber || "").toLowerCase().includes(q)
    );
  });

  const sortedSkis = [...searchedSkis].sort((a, b) => {
    if (view === "recommender" || sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "number") return (a.skiNumber || "").localeCompare(b.skiNumber || "", undefined, { numeric: true });
    return 0;
  });

  const waxAdvice = getWaxAdvice(weatherData?.temp, weatherData?.humidity, activeSki?.type || "Klassisk");

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>Laster SkiPark Pro...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* TOPPLINJE */}
        <header style={{ background: '#ffffff', borderRadius: '20px', padding: '16px 24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <RacingSkiLogo size={46} />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
                SkiPark <span style={{ color: '#0284c7' }}>Pro</span>
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Skiselector OCR & Førevelger</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>Løper:</span>
              <select
                value={activeMemberId}
                onChange={(e) => setActiveMemberId(e.target.value)}
                style={{ background: '#ffffff', border: '1px solid #94a3b8', color: '#0284c7', padding: '6px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* OCR PROSESSERING VARSEL */}
        {isOcrProcessing && (
          <div style={{ background: '#0284c7', color: '#fff', padding: '14px 20px', borderRadius: '14px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <div style={{ fontWeight: '800' }}>Leser Skiselector-rapport direkte fra bildet...</div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>{ocrStatus}</div>
            </div>
          </div>
        )}

        {/* MODAL FOR DIGITALT SKIKORT (EKSPORT) */}
        {transferModalSki && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#ffffff', border: '2px solid #7c3aed', borderRadius: '24px', padding: '26px', maxWidth: '540px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#5b21b6' }}>
                  📤 Digitalt Skikort: {transferModalSki.brand} {transferModalSki.model}
                </h3>
                <button onClick={() => setTransferModalSki(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', color: '#5b21b6', fontWeight: 'bold' }}>✕</button>
              </div>

              <textarea
                readOnly
                value={JSON.stringify(transferModalSki, null, 2)}
                rows="7"
                style={{ width: '100%', background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', color: '#4c1d95', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleShareOrCopyPassport(transferModalSki)}
                  style={{ flex: 1, minHeight: '44px', background: '#7c3aed', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                >
                  📲 Del / Kopier skikort
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Er paret solgt og skal slettes fra din skipark?")) {
                      handleDeleteSki(transferModalSki.id, `${transferModalSki.brand} ${transferModalSki.model}`);
                      setTransferModalSki(null);
                    }
                  }}
                  style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  🗑️ Slett fra stallen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE YR VÆR-BANNER */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px 24px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '14px', fontSize: '28px' }}>🌤️</div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Live Yr-føre ({selectedSpot.name}):</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: weatherData?.temp <= 0 ? '#0284c7' : '#ea580c' }}>
                {weatherData ? `${weatherData.temp}°C` : 'Henter...'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setView("recommender")}
            style={{ background: '#eff6ff', border: '1.5px solid #0284c7', color: '#0284c7', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
          >
            ⚡ Dagens Skivelger
          </button>
        </div>

        {/* FANER */}
        <nav style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <button
            onClick={() => setView("park")}
            style={{ background: view === 'park' ? '#0f172a' : '#fff', color: view === 'park' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
          >
            🎿 Skipark ({memberSkis.length})
          </button>
          <button
            onClick={() => setView("manual")}
            style={{ background: view === 'manual' ? '#059669' : '#fff', color: view === 'manual' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
          >
            ➕ Registrer ski
          </button>
        </nav>

        {/* 1. SKIPARK VISNING */}
        {view === "park" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {sortedSkis.map((ski) => (
              <div key={ski.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '17px' }}>{ski.brand} {ski.model}</span>
                  <button onClick={() => setTransferModalSki(ski)} style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📤</button>
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
        )}

        {/* 2. DETALJVISNING MED OPPDATERING FRA SKISELECTOR-BILDE */}
        {view === "detail" && activeSki && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setView("park")} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                ← Tilbake
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
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
                  📊 Les inn Skiselector-bilde
                </button>
                <button
                  onClick={() => setTransferModalSki(activeSki)}
                  style={{ background: '#f5f3ff', border: '1.5px solid #7c3aed', color: '#6d28d9', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  📤 Skikort
                </button>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>{activeSki.brand} {activeSki.model}</h2>
              <p style={{ margin: 0, color: '#64748b' }}>{activeSki.lengthCm} cm • Målt utøvervekt: {activeSki.weightKgMin} - {activeSki.weightKgMax} kg</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Spennkurve</h3>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                <svg viewBox="0 0 800 140" style={{ width: '100%', height: '140px' }}>
                  <line x1="20" y1="110" x2="780" y2="110" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4" />
                  {activeSki.hbw && <path d="M 60 108 Q 400 24 740 108" fill="none" stroke="#0284c7" strokeWidth="4" />}
                  {activeSki.fbw && <path d="M 120 109 Q 400 82 680 109" fill="none" stroke="#ff5500" strokeWidth="3" />}
                  <line x1="400" y1="15" x2="400" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3" />
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontWeight: '700' }}>
                  <div>HBW: <strong style={{ color: '#0284c7' }}>{activeSki.hbw ? `${activeSki.hbw} mm` : '-'}</strong></div>
                  <div>FBW: <strong style={{ color: '#ff5500' }}>{activeSki.fbw ? `${activeSki.fbw} mm` : '-'}</strong></div>
                  <div>Smørelomme: <strong style={{ color: '#059669' }}>+{activeSki.pocketFrontCm || 30}cm / -{activeSki.pocketRearCm || 15}cm</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. REGISTRER SKI MED SKISELECTOR OCR */}
        {view === "manual" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '30px', maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', margin: '0 0 6px 0', fontWeight: '800' }}>➕ Registrer skipar</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>
              Last opp skjermbilde fra Skiselector. Nettleseren scanner og henter tallene rett fra bildet.
            </p>

            <input
              type="file"
              accept="image/*"
              ref={skiselectorFileInputRef}
              style={{ display: 'none' }}
              onChange={handleScanSkiselectorForNewSki}
            />

            <button
              type="button"
              onClick={() => skiselectorFileInputRef.current?.click()}
              style={{ width: '100%', border: '2px dashed #0284c7', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f0f9ff', color: '#0284c7', fontWeight: '800', fontSize: '16px', marginBottom: '20px' }}
            >
              📄 📊 Last opp skjermbilde fra Skiselector
            </button>

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
                  <input
                    value={newSkiData.brand}
                    onChange={(e) => setNewSkiData({ ...newSkiData, brand: e.target.value })}
                    required
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Lengde (cm)</label>
                  <input
                    type="number"
                    value={newSkiData.lengthCm}
                    onChange={(e) => setNewSkiData({ ...newSkiData, lengthCm: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Min Vekt (kg)</label>
                  <input
                    value={newSkiData.weightKgMin}
                    onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMin: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Maks Vekt (kg)</label>
                  <input
                    value={newSkiData.weightKgMax}
                    onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMax: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>HBW (Halvvekt mm)</label>
                  <input
                    value={newSkiData.hbw}
                    onChange={(e) => setNewSkiData({ ...newSkiData, hbw: e.target.value })}
                    style={{ width: '100%', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#ff5500' }}>FBW (Fullvekt mm)</label>
                  <input
                    value={newSkiData.fbw}
                    onChange={(e) => setNewSkiData({ ...newSkiData, fbw: e.target.value })}
                    style={{ width: '100%', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}
              >
                ✓ Lagre ski i stallen
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
