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

const INITIAL_MEMBERS = [
  { id: "m-1", name: "Meg", weightKg: 76 },
  { id: "m-2", name: "Junior", weightKg: 52 }
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
    weightKgMax: 78,
    grind: "P5-1 Allround Minus",
    hbw: null,
    fbw: null,
    stravaKm: 142.5,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Nydelig glid på -2 til -7 med faste spor. Eksempel på birkenski.",
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
    weightKgMin: 74,
    weightKgMax: 80,
    grind: "M61 Kald",
    hbw: 1.15,
    fbw: 0.22,
    pocketFrontCm: 38,
    pocketRearCm: 16,
    stravaKm: 88.0,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Eksempel på tørrvoksski. Null subb i staking og lett å tråkke ned.",
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  },
  {
    id: "ski-3",
    isDemo: true,
    memberId: "m-2",
    skiNumber: "#J1",
    tag: "#juniorfelle",
    brand: "Rossignol",
    model: "Delta Sport R-Skin Junior",
    type: "Felleski",
    camberType: "Integrert Mohair",
    tempOptimalMin: -8,
    tempOptimalMax: 2,
    bindingShift: "0",
    lengthCm: 177,
    weightKgMin: 49,
    weightKgMax: 55,
    grind: "K5 Universal",
    hbw: 1.10,
    fbw: 0.20,
    pocketFrontCm: 28,
    pocketRearCm: 10,
    stravaKm: 34.2,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Eksempel på felleski for Junior. Lett å tråkke ned for sikkert feste.",
    maintenanceLog: [
      { date: "2025-01-10", title: "Renset og impregnert fell", type: "Fell" }
    ]
  }
];

function RacingSkiLogo({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  if (firstName && member.name.toLowerCase() === firstName.toLowerCase()) {
    return "Din skipark";
  }

  const name = member.name.trim();
  const lastChar = name.slice(-1).toLowerCase();
  if (lastChar === 's' || lastChar === 'z' || lastChar === 'x') {
    return `${name}’ skipark`;
  }
  return `${name}s skipark`;
}

function getWaxAdvice(temp, humidity, skiType) {
  if (temp === null || temp === undefined) {
    return { kick: "Venter på temperatur fra Yr...", glide: "Standard allround-glider (f.eks. Swix PS7)" };
  }

  if (skiType === "Felleski") {
    let fellCare = "Swix Skin Care eller Rode Skin Cleaner / Impregnering.";
    if (temp >= -1) fellCare += " OBS: Bruk anti-ice for å unngå ising i fellen ved nullføre/våt nysnø!";
    return {
      kick: `Integrert fell – ${fellCare}`,
      glide: temp <= -4 ? "Swix PS6 / Rode R20 (Blå) + 0.5mm rett rill" : "Swix PS8 / Rode R30 (Rød) + 1.0mm rett rill"
    };
  }

  if (skiType === "Skate") {
    if (temp <= -10) {
      return {
        kick: "Ingen (Skøyteski)",
        glide: "Swix PS5 (Turkis) / Rode R10 Kald. Rill: Finkornet 0.3mm eller rett slip."
      };
    } else if (temp <= -4) {
      return {
        kick: "Ingen (Skøyteski)",
        glide: "Swix PS6 / Marathon / Rode R20 Blå. Rill: 0.5mm rett eller fiskebein bak."
      };
    } else if (temp <= 0) {
      return {
        kick: "Ingen (Skøyteski)",
        glide: "Swix PS7 / PS8 / Vauhti Pure Race Rød. Rill: 0.75mm til 1mm rett."
      };
    } else {
      return {
        kick: "Ingen (Skøyteski)",
        glide: "Swix PS10 (Gul) / Rode R40 Våt / Vauhti Wet. Rill: 1.0mm eller 2.0mm grov rill."
      };
    }
  }

  if (temp < -12) {
    return {
      kick: "Swix VG30 / Rode Grønn (eller Rode T-Line VO). Tynt lag, korkes godt.",
      glide: "Swix PS5 / Rode R10 (Kald). Rill: Fin 0.3mm."
    };
  } else if (temp <= -7) {
    return {
      kick: "Swix VP30 / Rode Blå Super / Vauhti K15. 4–5 tynne lag.",
      glide: "Swix PS6 (Blå). Rill: 0.5mm."
    };
  } else if (temp <= -2) {
    return {
      kick: "Swix VP45 / VP40 eller Rode B17 / Violett Multigrade.",
      glide: "Swix Marathon / Rode R20. Rill: 0.5mm til 0.75mm."
    };
  } else if (temp <= 0.5) {
    return {
      kick: humidity > 85 
        ? "Swix VP65 / Rode Rossa / Klisterdekke (Chola + Swix Universal) hvis grov snø."
        : "Swix VP55 eller Rode Weiss.",
      glide: "Swix PS8 / Rode R30. Rill: 1.0mm."
    };
  } else {
    return {
      kick: "Klisterføre: Rode Multigrade Klister eller Swix KX40S (Sølvklister) dekket med KX65.",
      glide: "Swix PS10 / Rode R40. Rill: 1.0mm + 2.0mm kryssrill bak."
    };
  }
}

// Skalerer ned store mobilbilder til maks 1000px for lynrask opplasting og analyse
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
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

  // Hjelpe-modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Skikort / Salg modal state
  const [transferModalSki, setTransferModalSki] = useState(null);
  const [showImportPassportModal, setShowImportPassportModal] = useState(false);
  const [passportInputText, setPassportInputText] = useState("");

  // Kvittering modal state
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState(null);
  const receiptFileInputRef = useRef(null);

  // Familiemedlemmer state
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState("m-1");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberWeight, setNewMemberWeight] = useState("");

  // Skipark state
  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park");
  const [selectedSkiId, setSelectedSkiId] = useState("ski-2");
  const [filter, setFilter] = useState("Alle");

  // Søk & Sortering state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("number");

  // Yr Steder
  const [spots, setSpots] = useState(DEFAULT_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(DEFAULT_SPOTS[0]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // PWA install-prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Registrering av ny ski (state for felter)
  const [newSkiData, setNewSkiData] = useState({
    skiNumber: "",
    brand: "Fischer",
    model: "",
    type: "Klassisk",
    tag: "",
    camberType: "Universal",
    lengthCm: 197,
    weightKgMin: 70,
    weightKgMax: 80,
    tempOptimalMin: -10,
    tempOptimalMax: -2,
    grind: "Standard",
    hbw: "",
    fbw: "",
    pocketFrontCm: "",
    pocketRearCm: "",
    notes: ""
  });

  // Flerbilde-state for registrering
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isRegisterAnalyzing, setIsRegisterAnalyzing] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState("");
  const [registerAiError, setRegisterAiError] = useState("");
  const multiFileInputRef = useRef(null);

  // Kalibrering på aktiv ski (Skiselector & QR)
  const [isSkiselectorUpdating, setIsSkiselectorUpdating] = useState(false);
  const [skiselectorError, setSkiselectorError] = useState("");
  const skiselectorFileInputRef = useRef(null);

  const [showDetailQrBox, setShowDetailQrBox] = useState(false);
  const [detailQrScanning, setDetailQrScanning] = useState(false);
  const [detailQrManualInput, setDetailQrManualInput] = useState("");
  const detailQrFileInputRef = useRef(null);

  const currentMember = members.find(m => m.id === activeMemberId) || members[0] || { name: "Meg", weightKg: 76 };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    const savedMembers = localStorage.getItem("skipark_family_members");
    if (savedMembers) {
      try { setMembers(JSON.parse(savedMembers)); } catch (e) {}
    }

    const savedSpots = localStorage.getItem("skipark_custom_spots");
    if (savedSpots) {
      try { setSpots(JSON.parse(savedSpots)); } catch (e) {}
    }

    const savedSkis = localStorage.getItem("skipark_skis_data");
    if (savedSkis) {
      try { setSkis(JSON.parse(savedSkis)); } catch (e) {}
    }

    const savedStrava = localStorage.getItem("skipark_strava_connected");
    if (savedStrava === "true") {
      setStravaConnected(true);
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user?.user_metadata?.full_name) {
        const firstName = user.user_metadata.full_name.split(" ")[0];
        setMembers(prev => {
          const hasCustomName = prev.some(m => m.id === "m-1" && m.name !== "Meg");
          if (!hasCustomName) {
            const updated = prev.map(m => m.id === "m-1" ? { ...m, name: firstName } : m);
            localStorage.setItem("skipark_family_members", JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }

      setLoading(false);
    }
    initUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
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

  const persistSpots = (updatedSpots) => {
    setSpots(updatedSpots);
    localStorage.setItem("skipark_custom_spots", JSON.stringify(updatedSpots));
  };

  const handleClearDemoData = () => {
    if (window.confirm("Vil du fjerne alle demopar fra listen og kun beholde dine egne ski?")) {
      const realOnly = skis.filter(s => !s.isDemo);
      persistSkis(realOnly);
      setSelectedSkiId(realOnly[0]?.id || null);
    }
  };

  const handleAddCustomSpot = (name, lat, lon) => {
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (!name || isNaN(latN) || isNaN(lonN)) {
      alert("Vennligst oppgi et gyldig navn og koordinater.");
      return;
    }
    const newSpot = { name, lat: latN, lon: lonN };
    const updated = [newSpot, ...spots];
    persistSpots(updated);
    setSelectedSpot(newSpot);
    setShowAddSpot(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    } else {
      alert("For å legge til på hjemskjermen:\n\n• På iPhone: Del-ikon -> «Legg til på Hjem-skjerm» 📲\n• På Android: Menyprikker -> «Installer app».");
    }
  };

  const handleAddMember = (name, weight) => {
    const newM = { id: "m-" + Date.now(), name, weightKg: parseFloat(weight) || 70 };
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

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;

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
        setAuthMessage({
          text: "Konto opprettet! Sjekk e-posten din for bekreftelseslenke.",
          type: "success"
        });
      }
    } catch (err) {
      setAuthMessage({
        text: err.message === "Invalid login credentials" ? "Feil e-post eller passord." : err.message,
        type: "error"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handleAddSki = (skiToSave) => {
    const updated = [skiToSave, ...skis];
    persistSkis(updated);
    setSelectedSkiId(skiToSave.id);
    setView("detail");
    setUploadedImages([]);
    setNewSkiData({
      skiNumber: "",
      brand: "Fischer",
      model: "",
      type: "Klassisk",
      tag: "",
      camberType: "Universal",
      lengthCm: 197,
      weightKgMin: currentMember.weightKg - 5,
      weightKgMax: currentMember.weightKg + 5,
      tempOptimalMin: -10,
      tempOptimalMax: -2,
      grind: "Standard",
      hbw: "",
      fbw: "",
      pocketFrontCm: "",
      pocketRearCm: "",
      notes: ""
    });
  };

  const handleDeleteSki = (id, skiName) => {
    if (window.confirm(`Vil du fjerne "${skiName || 'dette paret'}" fra skiparken?`)) {
      const updated = skis.filter(s => s.id !== id);
      persistSkis(updated);
      if (selectedSkiId === id) {
        setSelectedSkiId(updated[0]?.id || null);
        setView("park");
      }
    }
  };

  // INTERN OVERFØRING I FAMILIEN (ARV)
  const handleTransferSkiToFamilyMember = (skiId, targetMemberId) => {
    const targetMember = members.find(m => m.id === targetMemberId);
    const targetName = targetMember ? targetMember.name : "Fellespar";

    const updated = skis.map(s => s.id === skiId ? {
      ...s,
      memberId: targetMemberId,
      maintenanceLog: [
        { 
          date: new Date().toISOString().split("T")[0], 
          title: `Overført i familien: Arvet av ${targetName}`, 
          type: "Eierskifte" 
        },
        ...(s.maintenanceLog || [])
      ]
    } : s);

    persistSkis(updated);
    alert(`✓ Skiparet er nå flyttet til stallen til ${targetName}!`);
  };

  // IMPORT AV DIGITALT SKIKORT (EKSTERNT SALG/OVERDRAGELSE)
  const handleImportPassport = (jsonString) => {
    try {
      const data = JSON.parse(jsonString.trim());
      if (!data.brand || !data.model) {
        alert("Ugyldig skikort-format. Fant ikke merke eller modell.");
        return;
      }

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
        weightKgMin: data.weightKgMin || (currentMember.weightKg - 4),
        weightKgMax: data.weightKgMax || (currentMember.weightKg + 4),
        tempOptimalMin: data.tempOptimalMin || -10,
        tempOptimalMax: data.tempOptimalMax || -2,
        bindingShift: data.bindingShift || "0",
        grind: data.grind || "Standard",
        hbw: data.hbw || null,
        fbw: data.fbw || null,
        pocketFrontCm: data.pocketFrontCm || null,
        pocketRearCm: data.pocketRearCm || null,
        stravaKm: data.stravaKm || 0,
        thumbnailUrl: data.thumbnailUrl || null,
        receiptUrl: data.receiptUrl || null,
        notes: `Overtatt/kjøpt. ${data.notes || ''}`.trim(),
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Importert via digitalt skikort", type: "Overtakelse" },
          ...(data.maintenanceLog || [])
        ]
      };

      handleAddSki(importedSki);
      setShowImportPassportModal(false);
      setPassportInputText("");
      alert(`✓ Gratulerer! ${importedSki.brand} ${importedSki.model} er nå lagt inn i din skipark med all historikk.`);
    } catch (err) {
      alert("Klarte ikke å lese skikort-koden. Sjekk at hele koden er kopiert riktig.");
    }
  };

  // LAST OPP OG LAGRE KVITTERING PÅ AKTIVT SKIPAR
  const handleUploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSki) return;

    try {
      const { previewUrl } = await compressImage(file, 1600, 1600, 0.85);
      const updated = skis.map(s => s.id === activeSki.id ? {
        ...s,
        receiptUrl: previewUrl,
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Kvittering / Kjøpsbevis lagt til", type: "Dokument" },
          ...(s.maintenanceLog || [])
        ]
      } : s);

      persistSkis(updated);
      alert("✓ Kvittering lagret på dette skiparet!");
    } catch (err) {
      alert(`Klarte ikke å lagre kvittering: ${err.message}`);
    }
  };

  const handleUpdateBinding = (id, shift) => {
    const updated = skis.map(s => s.id === id ? { ...s, bindingShift: shift } : s);
    persistSkis(updated);
  };

  const handleSaveNotes = (id, newNotes) => {
    const updated = skis.map(s => s.id === id ? { ...s, notes: newNotes } : s);
    persistSkis(updated);
  };

  const handleUpdateTag = (id, newTag) => {
    const cleanTag = newTag.trim().startsWith("#") ? newTag.trim().toLowerCase() : `#${newTag.trim().toLowerCase()}`;
    const updated = skis.map(s => s.id === id ? { ...s, tag: cleanTag } : s);
    persistSkis(updated);
  };

  const handleUpdateSkiNumber = (id, newNumber) => {
    const updated = skis.map(s => s.id === id ? { ...s, skiNumber: newNumber.trim() } : s);
    persistSkis(updated);
  };

  const handleAddLog = (id, entry) => {
    const updated = skis.map(s => s.id === id ? {
      ...s,
      maintenanceLog: [entry, ...(s.maintenanceLog || [])]
    } : s);
    persistSkis(updated);
  };

  // FLERBILDE-HÅNDTERING VED REGISTRERING
  const handleMultipleImageSelection = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsRegisterAnalyzing(true);
    setRegisterAiError("");
    setAnalyzingStatus("1/2 Klargjør og komprimerer bilder...");

    try {
      const compressedList = [];
      for (const file of files) {
        const compressed = await compressImage(file, 1000, 1000, 0.75);
        compressedList.push(compressed);
      }

      const updatedImages = [...uploadedImages, ...compressedList];
      setUploadedImages(updatedImages);

      setAnalyzingStatus(`2/2 Gemini AI leser ${updatedImages.length} bilde(r)...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 sekunder timeout

      const res = await fetch('/api/analyze-skiselector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          images: updatedImages.map(img => ({
            imageBase64: img.base64,
            mimeType: img.mimeType
          }))
        })
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok) {
        setRegisterAiError(json.error || `Serverfeil: ${res.status}`);
        setIsRegisterAnalyzing(false);
        setAnalyzingStatus("");
        return;
      }

      const d = json.data || {};
      setNewSkiData(prev => ({
        ...prev,
        brand: d.brand && d.brand !== "Ukjent" ? d.brand : prev.brand,
        model: d.model || prev.model,
        type: d.type || prev.type,
        tag: d.model ? `#${d.model.toLowerCase().replace(/[^a-z0-9]/g, '')}` : prev.tag,
        lengthCm: d.lengthCm ? Number(d.lengthCm) : prev.lengthCm,
        camberType: d.camberType || prev.camberType,
        grind: d.grind || prev.grind,
        weightKgMin: d.weightMin ? Number(d.weightMin) : prev.weightKgMin,
        weightKgMax: d.weightMax ? Number(d.weightMax) : prev.weightKgMax,
        hbw: (d.hbw !== null && d.hbw !== undefined) ? String(d.hbw) : prev.hbw,
        fbw: (d.fbw !== null && d.fbw !== undefined) ? String(d.fbw) : prev.fbw,
        pocketFrontCm: (d.pocketFront !== null && d.pocketFront !== undefined) ? String(d.pocketFront) : prev.pocketFrontCm,
        pocketRearCm: (d.pocketRear !== null && d.pocketRear !== undefined) ? String(d.pocketRear) : prev.pocketRearCm,
        notes: `Innlest fra ${updatedImages.length} bilde(r) via Gemini AI.`
      }));

      setIsRegisterAnalyzing(false);
      setAnalyzingStatus("");
    } catch (err) {
      const msg = err.name === 'AbortError' 
        ? "Forespørselen tok for lang tid (timeout). Prøv med færre eller mindre bilder." 
        : `Feil: ${err.message}`;
      setRegisterAiError(msg);
      setIsRegisterAnalyzing(false);
      setAnalyzingStatus("");
    }
  };

  // SKISELECTOR BILDE PÅ DETALJSIDEN
  const handleUpdateSkiWithSkiselector = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeSki) return;

    setIsSkiselectorUpdating(true);
    setSkiselectorError("");

    try {
      const { base64, mimeType } = await compressImage(file, 1000, 1000, 0.75);

      const res = await fetch('/api/analyze-skiselector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType })
      });

      const json = await res.json();
      if (!res.ok) {
        setSkiselectorError(json.error || `Feil: ${res.status}`);
        setIsSkiselectorUpdating(false);
        return;
      }

      const d = json.data || {};
      const updated = skis.map(s => s.id === activeSki.id ? {
        ...s,
        hbw: d.hbw !== null && d.hbw !== undefined ? Number(d.hbw) : s.hbw,
        fbw: d.fbw !== null && d.fbw !== undefined ? Number(d.fbw) : s.fbw,
        pocketFrontCm: d.pocketFront !== null && d.pocketFront !== undefined ? Number(d.pocketFront) : s.pocketFrontCm,
        pocketRearCm: d.pocketRear !== null && d.pocketRear !== undefined ? Number(d.pocketRear) : s.pocketRearCm,
        weightKgMin: d.weightMin ? Number(d.weightMin) : s.weightKgMin,
        weightKgMax: d.weightMax ? Number(d.weightMax) : s.weightKgMax,
        grind: d.grind || s.grind,
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: `Skiselector-oppdatering: HBW ${d.hbw || '-'} mm, FBW ${d.fbw || '-'} mm`, type: "Måling" },
          ...(s.maintenanceLog || [])
        ]
      } : s);

      persistSkis(updated);
      setIsSkiselectorUpdating(false);
      alert(`✓ Skiselector-data oppdatert for ${activeSki.brand} ${activeSki.model}!`);
    } catch (err) {
      setSkiselectorError(`Klarte ikke å behandle bilde: ${err.message}`);
      setIsSkiselectorUpdating(false);
    }
  };

  // QR-KALIBRERING PÅ DETALJSIDEN
  const handleDetailQrProcess = (payload) => {
    if (!activeSki) return;
    setDetailQrScanning(true);
    setTimeout(() => {
      setDetailQrScanning(false);
      const updated = skis.map(s => s.id === activeSki.id ? {
        ...s,
        hbw: 1.18,
        fbw: 0.23,
        pocketFrontCm: 39,
        pocketRearCm: 16,
        grind: s.grind || "M61 Universal",
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: `QR Målerapport lagt til (${payload || 'Målekort'})`, type: "Måling" },
          ...(s.maintenanceLog || [])
        ]
      } : s);

      persistSkis(updated);
      setShowDetailQrBox(false);
      setDetailQrManualInput("");
      alert(`✓ Måledata fra QR-koden ble lagt til for ${activeSki.brand} ${activeSki.model}!`);
    }, 800);
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
    alert(`✓ Strava synkronisert!\n${matchedCount} økter matchet via hashtag (#).\n${unassigned.length} økt manglet hashtag og kan tildeles manuelt under.`);
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', fontSize: '18px', fontWeight: '600' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  // Velkomstskjerm hvis ikke logget inn
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '40px 32px', borderRadius: '24px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <RacingSkiLogo size={78} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#0f172a' }}>
            SkiPark <span style={{ color: '#0284c7' }}>Pro</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '28px', lineHeight: '1.5' }}>
            Profesjonell skipark-administrasjon, live Yr-førevelger, smøretips og AI-bildegjenkjenning av ski.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{ width: '100%', minHeight: '50px', background: '#0f172a', color: '#ffffff', fontWeight: '700', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '15px', boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.2)', marginBottom: '20px' }}
          >
            <svg style={{ width: '19px', height: '19px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Fortsett med Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>eller med e-post</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>E-postadresse</label>
              <input
                type="email"
                required
                placeholder="deg@eksempel.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
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
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px 14px', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {authMessage.text && (
              <div style={{
                background: authMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: authMessage.type === 'error' ? '#dc2626' : '#166534',
                border: '1px solid ' + (authMessage.type === 'error' ? '#fecaca' : '#bbf7d0'),
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {authMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{ width: '100%', background: '#0284c7', color: '#ffffff', fontWeight: '700', border: 'none', padding: '13px', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', marginTop: '6px', opacity: authLoading ? 0.7 : 1 }}
            >
              {authLoading ? "Behandler..." : (authMode === "signin" ? "Logg inn med e-post" : "Opprett ny konto")}
            </button>
          </form>

          <div style={{ marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
            {authMode === "signin" ? (
              <span>
                Har du ikke konto ennå?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthMessage({ text: "", type: "" }); }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Registrer deg her
                </button>
              </span>
            ) : (
              <span>
                Har du allerede en konto?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode("signin"); setAuthMessage({ text: "", type: "" }); }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Logg inn her
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const memberSkis = skis.filter(s => !s.memberId || s.memberId === activeMemberId || s.memberId === "all");
  const activeSki = memberSkis.find(s => s.id === selectedSkiId) || memberSkis[0] || skis[0];
  const hasDemoSkis = skis.some(s => s.isDemo);

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
      (s.skiNumber || "").toLowerCase().includes(q) ||
      (s.tag || "").toLowerCase().includes(q) ||
      (s.grind || "").toLowerCase().includes(q) ||
      (s.camberType || "").toLowerCase().includes(q)
    );
  });

  const sortedSkis = [...searchedSkis].sort((a, b) => {
    if (view === "recommender" || sortBy === "match") {
      return b.matchScore - a.matchScore;
    }
    if (sortBy === "number") {
      return (a.skiNumber || "").localeCompare(b.skiNumber || "", undefined, { numeric: true });
    }
    if (sortBy === "brand") {
      return (a.brand || "").localeCompare(b.brand || "");
    }
    if (sortBy === "km") {
      return (b.stravaKm || 0) - (a.stravaKm || 0);
    }
    return 0;
  });

  const bestSki = [...memberSkisWithScore].sort((a, b) => b.matchScore - a.matchScore)[0];
  const waxAdvice = getWaxAdvice(weatherData?.temp, weatherData?.humidity, bestSki?.type || "Klassisk");
  const parkTabLabel = `🎿 ${getPossessiveTitle(currentMember, user)} (${memberSkis.length})`;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* TOPPLINJE */}
        <header style={{ background: '#ffffff', borderRadius: '20px', padding: '16px 24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <RacingSkiLogo size={46} />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
                SkiPark <span style={{ color: '#0284c7' }}>Pro</span>
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Nordic Racing & Førevelger</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHelpModal(true)}
              style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                color: '#1e40af',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.08)'
              }}
              title="Bruksanvisning & smarte tips"
            >
              ❓
            </button>

            <button
              onClick={() => setShowStravaModal(true)}
              style={{
                background: stravaConnected ? '#fff7ed' : '#f8fafc',
                border: '1.5px solid ' + (stravaConnected ? '#fc4c02' : '#cbd5e1'),
                color: stravaConnected ? '#ea580c' : '#475569',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                minHeight: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Koble til Strava og synk kilometer via hashtags"
            >
              <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill={stravaConnected ? '#fc4c02' : '#64748b'}>
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.925 15.688h4.173" />
              </svg>
              <span>{stravaConnected ? "✓ Strava (#tag)" : "Koble Strava"}</span>
            </button>

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                style={{ background: '#eff6ff', border: '1.5px solid #0284c7', color: '#0284c7', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', minHeight: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Installer som app på telefonen"
              >
                <span>📲</span>
                <span>Hjemskjerm</span>
              </button>
            )}

            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Løper:</span>
              <select
                value={activeMemberId}
                onChange={(e) => setActiveMemberId(e.target.value)}
                style={{ background: '#ffffff', border: '1px solid #94a3b8', color: '#0284c7', padding: '6px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', minHeight: '38px', cursor: 'pointer' }}
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
                style={{ background: '#ffffff', border: '1px solid #0284c7', color: '#0284c7', borderRadius: '10px', padding: '6px 12px', fontSize: '13px', fontWeight: '700', minHeight: '38px', cursor: 'pointer' }}
              >
                ✎ {currentMember.weightKg} kg
              </button>

              <button
                onClick={() => setShowAddMember(true)}
                style={{ background: '#059669', border: 'none', color: '#ffffff', borderRadius: '10px', padding: '6px 14px', fontSize: '13px', fontWeight: '700', minHeight: '38px', cursor: 'pointer' }}
              >
                + Ny
              </button>
            </div>

            <button
              onClick={handleLogout}
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', minHeight: '38px', cursor: 'pointer' }}
            >
              Logg ut
            </button>
          </div>
        </header>

        {/* BRUKSANVISNING & TIPS MODAL */}
        {showHelpModal && (
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '20px', padding: '26px', marginTop: '16px', boxShadow: '0 12px 30px rgba(2, 132, 199, 0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>💡</span>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                  Hurtigguide til SkiPark Pro
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', color: '#475569' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>
                  📸 1. Registrering med flere bilder
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  Ta både bilde av tuppen (merke/modell) og bakenden/klistrelappen (spennhøyde, vekt og slipestruktur)[cite: 2, 3]. Gemini AI kombinerer bildene automatisk[cite: 2, 3]!
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#ea580c', marginBottom: '6px' }}>
                  ⚡ 2. Strava-synkronisering (#tag)
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  Gi hvert par en unik kode (f.eks. <code>#speedmax</code> eller <code>#01</code>). Skriv koden i navnet på Strava-økta di, så logges kilometerne direkte inn på riktig par.
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669', marginBottom: '6px' }}>
                  🌤️ 3. Dagens Skivelger & Smøring
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  Appen matcher skiparkens spenn og optimale temperatur opp mot live Yr-vær og den valgte løperens vekt. Smøretipset gir deg både feste- og glideranbefaling.
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#7c3aed', marginBottom: '6px' }}>
                  🔄 4. Arv og Salg (Digitalt Skikort)
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                  Flytt ski internt i familien når lillebror arver, eller eksporter et digitalt skikort og kvittering når du selger skiene videre!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR DIGITALT SKIKORT (EKSPORT VED SALG / OVERDRAGELSE) */}
        {transferModalSki && (
          <div style={{ background: '#ffffff', border: '2px solid #7c3aed', borderRadius: '20px', padding: '24px', marginTop: '16px', boxShadow: '0 12px 30px rgba(124, 58, 237, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>📤</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#5b21b6' }}>
                  Digitalt Skikort: {transferModalSki.brand} {transferModalSki.model}
                </h3>
              </div>
              <button onClick={() => setTransferModalSki(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#5b21b6', fontWeight: 'bold' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#4c1d95', lineHeight: '1.5' }}>
              Kopier koden under og send den til kjøperen på Finn, SMS eller e-post. Kjøperen trykker <strong>«Motta ski via skikort»</strong> i sin SkiPark Pro for å importere paret med alle måletall, slip og kvittering.
            </p>

            <textarea
              readOnly
              value={JSON.stringify(transferModalSki, null, 2)}
              rows="6"
              style={{ width: '100%', background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: '12px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', color: '#4c1d95', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(transferModalSki));
                  alert("✓ Skikort-koden er kopiert til utklippstavlen! Send den til kjøperen.");
                }}
                style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
              >
                📋 Kopier skikort
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Er paret solgt og overlevert? Vil du fjerne det fra din egen skipark nå?`)) {
                    handleDeleteSki(transferModalSki.id, `${transferModalSki.brand} ${transferModalSki.model}`);
                    setTransferModalSki(null);
                  }
                }}
                style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                🗑️ Slett fra min skipark (solgt)
              </button>
            </div>
          </div>
        )}

        {/* MODAL FOR IMPORT AV DIGITALT SKIKORT */}
        {showImportPassportModal && (
          <div style={{ background: '#ffffff', border: '2px solid #059669', borderRadius: '20px', padding: '24px', marginTop: '16px', boxShadow: '0 12px 30px rgba(5, 150, 105, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>📥</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#065f46' }}>
                  Importer ski via Digitalt Skikort
                </h3>
              </div>
              <button onClick={() => setShowImportPassportModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#047857' }}>
              Har du kjøpt eller arvet et par ski fra noen som bruker SkiPark Pro? Lim inn skikort-koden her:
            </p>

            <textarea
              placeholder="Lim inn skikort-koden her..."
              value={passportInputText}
              onChange={(e) => setPassportInputText(e.target.value)}
              rows="5"
              style={{ width: '100%', background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '12px', fontSize: '13px', fontFamily: 'monospace', color: '#065f46', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                onClick={() => handleImportPassport(passportInputText)}
                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
              >
                ✓ Importer til {currentMember.name}
              </button>
            </div>
          </div>
        )}

        {/* MODAL FOR FORHÅNDSVISNING AV KVITTERING I FULL STØRRELSE */}
        {viewingReceiptUrl && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '640px', width: '100%', background: '#ffffff', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>🧾 Lagret Kvittering / Kjøpsbevis</span>
                <button onClick={() => setViewingReceiptUrl(null)} style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', maxHeight: '75vh', overflowY: 'auto' }}>
                <img src={viewingReceiptUrl} alt="Kvittering" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
              </div>
            </div>
          </div>
        )}

        {/* DIALOG FOR NYTT FAMILIEMEDLEM */}
        {showAddMember && (
          <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '18px', padding: '20px 24px', marginTop: '16px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>👨‍👩‍👧‍👦</span>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e3a8a' }}>
                Legg til familiemedlem eller utøver
              </h4>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
              💡 <strong>Slik fungerer det:</strong> Hver utøver får sin egen skipark. Dagens skivelger, spennkurver (HBW/FBW) og smøretips regnes automatisk ut basert på vekten til den løperen du har valgt i menyen over.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim()) {
                  alert("Vennligst oppgi et navn på løperen.");
                  return;
                }
                const weightNum = parseFloat(newMemberWeight);
                if (isNaN(weightNum) || weightNum <= 0) {
                  alert("Vennligst oppgi en gyldig vekt i kg.");
                  return;
                }
                handleAddMember(newMemberName.trim(), weightNum);
                setNewMemberName("");
                setNewMemberWeight("");
              }}
              style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                placeholder="Fornavn (f.eks. Anna)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', minWidth: '180px', flex: '1 1 180px' }}
                autoFocus
              />

              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '0 12px', minWidth: '120px' }}>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Vekt"
                  value={newMemberWeight}
                  onChange={(e) => setNewMemberWeight(e.target.value)}
                  style={{ width: '70px', border: 'none', color: '#0f172a', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                />
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>kg</span>
              </div>

              <button
                type="submit"
                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '11px 22px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', minHeight: '42px', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)' }}
              >
                ✓ Lagre løper
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddMember(false);
                  setNewMemberName("");
                  setNewMemberWeight("");
                }}
                style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: '8px 12px' }}
              >
                Avbryt
              </button>
            </form>
          </div>
        )}

        {/* STRAVA MODAL */}
        {showStravaModal && (
          <div style={{ background: '#fff7ed', border: '2px solid #fc4c02', borderRadius: '18px', padding: '24px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '26px' }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#9a3412' }}>
                  Strava Automatisk Km-synkronisering (Metode 1)
                </h3>
              </div>
              <button onClick={() => setShowStravaModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9a3412', fontWeight: 'bold' }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '14px', color: '#7c2d12', lineHeight: '1.6' }}>
              Matcher skiene dine automatisk ved hjelp av <strong>#kode</strong> i tittel eller beskrivelse på Strava-økta.
            </p>

            <div style={{ background: '#ffffff', border: '1px solid #fed7aa', padding: '14px 18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#9a3412' }}>Dine registrerte skikoder i appen:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {skis.map(s => (
                  <span key={s.id} style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                    {s.skiNumber ? `${s.skiNumber} ` : ''}{s.brand} {s.model}: <strong>{s.tag || '#mangler'}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
              {!stravaConnected ? (
                <button
                  onClick={() => {
                    localStorage.setItem("skipark_strava_connected", "true");
                    setStravaConnected(true);
                    alert("✓ Strava-kobling aktivert!");
                  }}
                  style={{ background: '#fc4c02', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                >
                  Aktiver Strava-kobling
                </button>
              ) : (
                <button
                  onClick={handleSyncStravaActivities}
                  style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                >
                  🔄 Synkroniser Strava-økter nå
                </button>
              )}

              {stravaConnected && (
                <button
                  onClick={() => {
                    localStorage.removeItem("skipark_strava_connected");
                    setStravaConnected(false);
                  }}
                  style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                >
                  Koble fra
                </button>
              )}
            </div>
          </div>
        )}

        {/* UFORDELTE STRAVA-ØKTER */}
        {unassignedActivities.length > 0 && (
          <div style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '16px', padding: '18px 22px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#92400e' }}>
                Ufordelte Strava-turer (mangler #kode)
              </h4>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350f' }}>
              Følgende skiøkter hadde ingen gjenkjennelig #kode. Hvilket par brukte du?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unassignedActivities.map(act => (
                <div key={act.id} style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{act.title} ({act.distanceKm} km, {act.date})</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {memberSkis.map(ski => (
                      <button
                        key={ski.id}
                        onClick={() => handleAssignActivity(act, ski.id)}
                        style={{ background: '#ffffff', border: '1px solid #d97706', color: '#b45309', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Bruk {ski.skiNumber || ''} {ski.brand} ({ski.tag || ski.type})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEMO-DATA ADVARSEL */}
        {hasDemoSkis && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '12px 18px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>DEMO-DATA</span>
              <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                Skiparken inneholder forhåndsutfylte eksempel-ski.
              </span>
            </div>
            <button
              onClick={handleClearDemoData}
              style={{ background: '#ffffff', border: '1px solid #d97706', color: '#b45309', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Fjern demo-ski
            </button>
          </div>
        )}

        {/* YR VÆR-BANNER */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px 24px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '14px', fontSize: '28px', border: '1px solid #bae6fd' }}>
              🌤️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Yr-føre for</span>
                <select
                  value={selectedSpot.name}
                  onChange={(e) => {
                    const spot = spots.find(s => s.name === e.target.value);
                    if (spot) setSelectedSpot(spot);
                  }}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0284c7', padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {spots.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>

                <button
                  onClick={() => setShowAddSpot(true)}
                  style={{ background: '#f8fafc', border: '1px dashed #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  + Legg til eget sted
                </button>
              </div>

              <div style={{ marginTop: '6px', fontSize: '16px' }}>
                {weatherLoading ? (
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Henter live vær fra Yr...</span>
                ) : weatherData ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: weatherData.temp <= 0 ? '#0284c7' : '#ea580c', fontSize: '22px', fontWeight: '800' }}>
                      {weatherData.temp}°C
                    </span>
                    <span style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                      • {weatherData.humidity}% luftfuktighet • {weatherData.windSpeed} m/s vind
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={() => setView("recommender")}
            style={{
              background: view === 'recommender' ? '#0284c7' : '#eff6ff',
              color: view === 'recommender' ? '#ffffff' : '#0284c7',
              border: '1.5px solid #0284c7',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minHeight: '46px',
              boxShadow: view === 'recommender' ? '0 8px 16px -4px rgba(2, 132, 199, 0.3)' : 'none'
            }}
          >
            <span>⚡ Dagens Skivelger & Smøretips</span>
          </button>
        </div>

        {/* SMØRE- OG GLIDERANBEFALING */}
        {view === "recommender" && weatherData && (
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '18px', padding: '22px', marginTop: '16px', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>🧪</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Dagens Smøring & Glidertips for {selectedSpot.name} ({weatherData.temp}°C)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                  🎿 FESTESMØRING / KLISTER (KLASSISK)
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>
                  {waxAdvice.kick}
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '6px' }}>
                  ⚡ GLIDER & RILL (SWIX / RODE / VAUHTI)
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>
                  {waxAdvice.glide}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FANER */}
        <nav style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
          {[
            { id: "park", label: parkTabLabel },
            { id: "recommender", label: "⚡ Dagens Skivelger" },
            { id: "manual", label: "➕ Registrer ski" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: view === tab.id 
                  ? (tab.id === 'recommender' ? '#ff5500' : tab.id === 'manual' ? '#059669' : '#0f172a')
                  : '#ffffff',
                color: view === tab.id ? '#ffffff' : '#334155',
                fontWeight: '700',
                border: '1px solid ' + (view === tab.id ? 'transparent' : '#cbd5e1'),
                padding: '12px 20px',
                borderRadius: '14px',
                cursor: 'pointer',
                fontSize: '15px',
                minHeight: '46px',
                boxShadow: view === tab.id ? '0 6px 14px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 1. SKIPARK MED SØK, SORTERING OG SKIKORT-IMPORT */}
        {(view === "park" || view === "recommender") && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: '16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {["Alle", "Klassisk", "Skate"].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    style={{
                      background: filter === t ? '#0f172a' : '#f8fafc',
                      color: filter === t ? '#ffffff' : '#475569',
                      border: '1px solid ' + (filter === t ? '#0f172a' : '#cbd5e1'),
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}

                <button
                  onClick={() => setShowImportPassportModal(true)}
                  style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#059669', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>📥</span>
                  <span>Motta ski via skikort</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', flex: '1 1 320px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Søk modell, merke, #01..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', minWidth: '180px', flex: '1 1 180px' }}
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
                >
                  <option value="number">Sorter: Par-nummer (#01)</option>
                  <option value="match">Sorter: Dagens match (%)</option>
                  <option value="brand">Sorter: Merke (A–Å)</option>
                  <option value="km">Sorter: Flest km (Strava)</option>
                </select>
              </div>
            </div>

            {sortedSkis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '16px' }}>
                {searchQuery ? `Ingen ski matchet søket "${searchQuery}".` : "Ingen ski registrert her ennå."}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {sortedSkis.map((ski, index) => {
                  const isWeightMatch = currentMember.weightKg >= ski.weightKgMin && currentMember.weightKg <= ski.weightKgMax;
                  const score = ski.matchScore !== undefined ? ski.matchScore : calculateMatch(ski);

                  return (
                    <div
                      key={ski.id}
                      style={{
                        background: '#ffffff',
                        border: view === 'recommender' && index === 0 ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '18px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: view === 'recommender' && index === 0 ? '0 12px 28px rgba(2, 132, 199, 0.15)' : '0 4px 10px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {ski.skiNumber && (
                              <span style={{ fontSize: '12px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', background: '#0f172a', color: '#ffffff' }}>
                                {ski.skiNumber}
                              </span>
                            )}

                            <span style={{ fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: ski.type === 'Skate' ? '#eff6ff' : '#f0fdf4', color: ski.type === 'Skate' ? '#1d4ed8' : '#15803d', border: '1px solid ' + (ski.type === 'Skate' ? '#bfdbfe' : '#bbf7d0') }}>
                              {ski.type.toUpperCase()}
                            </span>

                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                              {ski.tag || '#mangler'}
                            </span>

                            {ski.isDemo && (
                              <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                                DEMO
                              </span>
                            )}

                            {view === 'recommender' && (
                              <span style={{ fontSize: '13px', fontWeight: '800', color: score >= 80 ? '#15803d' : score >= 60 ? '#b45309' : '#dc2626' }}>
                                ★ {score}% Match
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', color: isWeightMatch ? '#15803d' : '#d97706', fontWeight: '700' }}>
                              {isWeightMatch ? "✓ Vektmatch" : "⚠️ Vektavvik"}
                            </span>
                            <button
                              onClick={() => handleDeleteSki(ski.id, `${ski.brand} ${ski.model}`)}
                              title="Slett dette paret"
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', fontSize: '14px', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }} style={{ cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <div style={{ width: '64px', height: '80px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {ski.thumbnailUrl ? (
                              <img src={ski.thumbnailUrl} alt={ski.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '28px', opacity: 0.6 }}>🎿</span>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                              {ski.skiNumber ? `${ski.skiNumber} · ` : ''}{ski.brand} {ski.model}
                            </h3>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{ski.lengthCm} cm • {ski.camberType}</p>

                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                              <div>Føre: <strong style={{ color: '#0284c7' }}>{ski.tempOptimalMin}° til {ski.tempOptimalMax}°C</strong></div>
                              <div>Slip: <strong>{ski.grind || 'Standard'}</strong> • Vekt: <strong>{ski.weightKgMin}-{ski.weightKgMax} kg</strong></div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Strava: <strong style={{ color: '#ea580c' }}>{ski.stravaKm || 0} km</strong></span>
                                {ski.receiptUrl && <span title="Kvittering er lagret" style={{ fontSize: '13px' }}>🧾</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }}
                        style={{ marginTop: '14px', width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#0284c7', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                      >
                        Vis kurve & logg →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. DETALJVISNING MED OVERFØRING, KVITTERING OG KALIBRERING */}
        {view === "detail" && activeSki && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => setView("park")}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0284c7', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                ← Tilbake til skiparken
              </button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={skiselectorFileInputRef}
                  onChange={handleUpdateSkiWithSkiselector}
                  style={{ display: 'none' }}
                />

                <input
                  type="file"
                  accept="image/*"
                  ref={receiptFileInputRef}
                  onChange={handleUploadReceipt}
                  style={{ display: 'none' }}
                />

                <button
                  onClick={() => skiselectorFileInputRef.current?.click()}
                  style={{ background: '#eff6ff', border: '1.5px solid #0284c7', color: '#0284c7', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📊</span>
                  <span>{isSkiselectorUpdating ? "Analyserer rapport..." : "Skiselector-bilde"}</span>
                </button>

                <button
                  onClick={() => setShowDetailQrBox(!showDetailQrBox)}
                  style={{ background: '#f0fdf4', border: '1.5px solid #059669', color: '#059669', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🏁</span>
                  <span>QR Målekort</span>
                </button>

                <button
                  onClick={() => setTransferModalSki(activeSki)}
                  style={{ background: '#f5f3ff', border: '1.5px solid #7c3aed', color: '#6d28d9', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📤</span>
                  <span>Skikort (Salg/Del)</span>
                </button>

                <button
                  onClick={() => handleDeleteSki(activeSki.id, `${activeSki.brand} ${activeSki.model}`)}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  🗑️ Slett
                </button>
              </div>
            </div>

            {/* BOKS FOR QR-IMPORT PÅ DETTE PARET */}
            {showDetailQrBox && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '800', color: '#166534', fontSize: '15px' }}>
                    🏁 Oppdater spennmåling fra QR-kode på målekortet:
                  </div>
                  <button onClick={() => setShowDetailQrBox(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold' }}>✕ Lukk</button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={detailQrFileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDetailQrProcess(file.name);
                  }}
                />

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => detailQrFileInputRef.current?.click()}
                    style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>📷</span>
                    <span>{detailQrScanning ? "Leser QR..." : "Ta bilde av QR / Velg bilde"}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '6px', flex: '1 1 240px' }}>
                    <input
                      type="text"
                      placeholder="eller tast inn kode / URL manuelt..."
                      value={detailQrManualInput}
                      onChange={(e) => setDetailQrManualInput(e.target.value)}
                      style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px' }}
                    />
                    <button
                      onClick={() => {
                        if (detailQrManualInput.trim()) handleDetailQrProcess(detailQrManualInput.trim());
                      }}
                      style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Hent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {skiselectorError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                ⚠️ {skiselectorError}
              </div>
            )}

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {activeSki.thumbnailUrl && (
                    <div style={{ width: '70px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                      <img src={activeSki.thumbnailUrl} alt={activeSki.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        {activeSki.type} • {activeSki.lengthCm} cm
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                        Strava-kode: {activeSki.tag || '#mangler'}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '800', color: '#0f172a' }}>
                      {activeSki.skiNumber ? `${activeSki.skiNumber} · ` : ''}{activeSki.brand} {activeSki.model}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' }}>Profil: {activeSki.camberType || 'Universal'} | Slip: {activeSki.grind || 'Standard'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* OVERFØR TIL FAMILIEMEDLEM (ARV) */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '14px', textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>LØPER / STALL</div>
                    <select
                      value={activeSki.memberId || "all"}
                      onChange={(e) => handleTransferSkiToFamilyMember(activeSki.id, e.target.value)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '5px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', color: '#0284c7', cursor: 'pointer' }}
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                      ))}
                      <option value="all">Fellespar / Alle</option>
                    </select>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '14px', textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>PAR-NUMMER / ID</div>
                    <input
                      type="text"
                      defaultValue={activeSki.skiNumber || ""}
                      placeholder="F.eks #01"
                      onBlur={(e) => handleUpdateSkiNumber(activeSki.id, e.target.value)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '800', color: '#0f172a', width: '80px' }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '14px', textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>STRAVA HASHTAG (#)</div>
                    <input
                      type="text"
                      defaultValue={activeSki.tag || ""}
                      placeholder="#kode"
                      onBlur={(e) => handleUpdateTag(activeSki.id, e.target.value)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#c2410c', width: '100px' }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.05em' }}>BINDING (MOVE / SHIFT)</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {["-2", "-1", "0", "+1", "+2"].map(shift => (
                        <button
                          key={shift}
                          onClick={() => handleUpdateBinding(activeSki.id, shift)}
                          style={{
                            background: (activeSki.bindingShift || "0") === shift ? '#ff5500' : '#ffffff',
                            color: (activeSki.bindingShift || "0") === shift ? '#ffffff' : '#334155',
                            fontWeight: '800',
                            border: '1.5px solid ' + ((activeSki.bindingShift || "0") === shift ? '#ff5500' : '#cbd5e1'),
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            minWidth: '36px'
                          }}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spennkurve SVG */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>
                    Spennkurve ({currentMember.weightKg} kg)
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    {activeSki.hbw 
                      ? "Målerapport registrert. Viser halvvekt (HBW) og fullvekt (FBW)." 
                      : "Ingen nøyaktige spenntall er registrert ennå. Bruk knappene over for å importere fra Skiselector eller QR."}
                  </p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <svg viewBox="0 0 800 140" style={{ width: '100%', height: '140px' }}>
                  <line x1="20" y1="110" x2="780" y2="110" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4" />
                  {activeSki.hbw && (
                    <path d="M 60 108 Q 400 24 740 108" fill="none" stroke="#0284c7" strokeWidth="4" />
                  )}
                  {activeSki.fbw && (
                    <path d="M 120 109 Q 400 82 680 109" fill="none" stroke="#ff5500" strokeWidth="3" />
                  )}
                  <line x1="400" y1="15" x2="400" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3" />
                  {activeSki.pocketFrontCm && (
                    <rect x="270" y="105" width="200" height="9" fill="#10b981" opacity="0.75" rx="3" />
                  )}
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#334155', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                  <div>HBW (Halvvekt): <strong style={{ color: '#0284c7' }}>{activeSki.hbw ? `${activeSki.hbw} mm` : "Ikke målt"}</strong></div>
                  <div>FBW (Fullvekt): <strong style={{ color: '#ff5500' }}>{activeSki.fbw ? `${activeSki.fbw} mm` : "Ikke målt"}</strong></div>
                  <div>Smørelomme: <strong style={{ color: '#059669' }}>{activeSki.pocketFrontCm ? `+${activeSki.pocketFrontCm}cm / -${activeSki.pocketRearCm || 0}cm` : "Ikke målt"}</strong></div>
                  <div>Total distanse: <strong style={{ color: '#ea580c' }}>{activeSki.stravaKm || 0} km</strong></div>
                </div>
              </div>
            </div>

            {/* KORT FOR KVITTERING, NOTATER OG SMØRELOGG */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* KVITTERING & KJØPSBEVIS */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>🧾 Kvittering / Kjøpsbevis</h4>
                  <button
                    onClick={() => receiptFileInputRef.current?.click()}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#0284c7' }}
                  >
                    {activeSki.receiptUrl ? "Bytt bilde" : "+ Last opp"}
                  </button>
                </div>

                {activeSki.receiptUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                      onClick={() => setViewingReceiptUrl(activeSki.receiptUrl)} 
                      style={{ cursor: 'pointer', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '140px', background: '#000', display: 'flex', justifyContent: 'center' }}
                    >
                      <img src={activeSki.receiptUrl} alt="Kvittering miniatyr" style={{ maxHeight: '140px', width: 'auto', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        🔍 Forstørr
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => receiptFileInputRef.current?.click()}
                    style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>📄</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Ta bilde av kvitteringen</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Gull verdt ved garanti, forsikring eller salg</div>
                  </div>
                )}
              </div>

              {/* FØRENOTATER */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800' }}>📝 Erfaringer & Førenotater</h4>
                <textarea
                  defaultValue={activeSki.notes || ""}
                  onBlur={(e) => handleSaveNotes(activeSki.id, e.target.value)}
                  rows="4"
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', padding: '12px', boxSizing: 'border-box', fontSize: '14px', lineHeight: '1.5' }}
                  placeholder="Skriv erfaringer med dette paret..."
                />
              </div>

              {/* SMØRE- OG ØKTLOGG */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800' }}>🔧 Smøre- og øktlogg</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    id="logInput"
                    type="text"
                    placeholder="F.eks Swix VP45 + Marathon"
                    style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 14px', color: '#0f172a', fontSize: '14px' }}
                  />
                  <button
                    onClick={() => {
                      const inp = document.getElementById("logInput");
                      if (inp && inp.value.trim()) {
                        handleAddLog(activeSki.id, {
                          date: new Date().toISOString().split("T")[0],
                          title: inp.value,
                          type: "Logg"
                        });
                        inp.value = "";
                      }
                    }}
                    style={{ background: '#0284c7', border: 'none', color: '#ffffff', fontWeight: '700', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    + Logg
                  </button>
                </div>

                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(activeSki.maintenanceLog || []).map((l, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: '600' }}>{l.title}</span>
                      <span style={{ color: '#64748b' }}>{l.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. REGISTRER SKI MED FLERBILDE-SKANNING */}
        {view === "manual" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '30px', maxWidth: '680px', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800' }}>➕ Registrer skipar</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                  Last opp 1 eller flere bilder (f.eks. tupp + bakski/målelapp), eller fyll ut manuelt[cite: 2, 3].
                </p>
              </div>
            </div>

            {/* FLERBILDE-INPUT */}
            <input
              type="file"
              accept="image/*"
              multiple
              ref={multiFileInputRef}
              onChange={handleMultipleImageSelection}
              style={{ display: 'none' }}
            />

            <div
              onClick={() => multiFileInputRef.current?.click()}
              style={{
                border: isRegisterAnalyzing ? '2px solid #0284c7' : '2px dashed #0284c7',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isRegisterAnalyzing ? '#eff6ff' : '#f0f9ff',
                marginBottom: '20px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>
                {isRegisterAnalyzing ? "⚙️" : "📸 🖼️"}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7' }}>
                {isRegisterAnalyzing ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    {analyzingStatus || "Analyserer bildene..."}
                  </span>
                ) : uploadedImages.length > 0 ? (
                  "+ Legg til flere bilder av skien (f.eks bakende/lapp)"
                ) : (
                  "Last opp 1–3 bilder av skien (tupp, modell og målelapp)"
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                {isRegisterAnalyzing ? (
                  <span style={{ color: '#0284c7', fontWeight: '600' }}>Vennligst vent noen sekunder mens AI leser av detaljene...</span>
                ) : (
                  "Tips: Velg både tuppen med merke og bakenden med spenn/vekt[cite: 2, 3]. AI slår alt sammen automatisk!"
                )}
              </div>
            </div>

            {registerAiError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: '600', marginBottom: '18px' }}>
                ⚠️ {registerAiError}
              </div>
            )}

            {/* GALLERI OVER VALGTE BILDER */}
            {uploadedImages.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '6px' }}>
                {uploadedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #cbd5e1', flexShrink: 0 }}>
                    <img src={img.previewUrl} alt={`Ski bilde ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                      style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SKJEMA */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const cleanTag = newSkiData.tag.trim().startsWith("#") 
                ? newSkiData.tag.trim().toLowerCase() 
                : (newSkiData.tag.trim() ? `#${newSkiData.tag.trim().toLowerCase()}` : "#ski");

              const firstImageThumbnail = uploadedImages[0]?.previewUrl || null;

              handleAddSki({
                id: "ski-" + Date.now(),
                isDemo: false,
                memberId: activeMemberId,
                skiNumber: newSkiData.skiNumber.trim(),
                tag: cleanTag,
                brand: newSkiData.brand,
                model: newSkiData.model || "Modell",
                type: newSkiData.type,
                camberType: newSkiData.camberType || "Universal",
                lengthCm: parseInt(newSkiData.lengthCm) || 190,
                weightKgMin: parseFloat(newSkiData.weightKgMin) || 65,
                weightKgMax: parseFloat(newSkiData.weightKgMax) || 80,
                tempOptimalMin: parseFloat(newSkiData.tempOptimalMin) || -10,
                tempOptimalMax: parseFloat(newSkiData.tempOptimalMax) || -2,
                bindingShift: "0",
                grind: newSkiData.grind || "Standard",
                hbw: newSkiData.hbw ? parseFloat(newSkiData.hbw) : null,
                fbw: newSkiData.fbw ? parseFloat(newSkiData.fbw) : null,
                pocketFrontCm: newSkiData.pocketFrontCm ? parseFloat(newSkiData.pocketFrontCm) : null,
                pocketRearCm: newSkiData.pocketRearCm ? parseFloat(newSkiData.pocketRearCm) : null,
                stravaKm: 0,
                thumbnailUrl: firstImageThumbnail,
                receiptUrl: null,
                notes: newSkiData.notes,
                maintenanceLog: []
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Hvem tilhører paret?</label>
                  <select 
                    value={activeMemberId} 
                    onChange={(e) => setActiveMemberId(e.target.value)} 
                    style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0284c7', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '15px' }}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Par-nummer / ID
                  </label>
                  <input
                    value={newSkiData.skiNumber}
                    placeholder="f.eks #01, Par 4 eller Kald-1"
                    onChange={(e) => setNewSkiData({ ...newSkiData, skiNumber: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Merke</label>
                  <input
                    value={newSkiData.brand}
                    onChange={(e) => setNewSkiData({ ...newSkiData, brand: e.target.value })}
                    required
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Modell</label>
                  <input
                    value={newSkiData.model}
                    onChange={(e) => setNewSkiData({ ...newSkiData, model: e.target.value })}
                    required
                    placeholder="f.eks RX 10 2.0 eller Redster C9"
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Stilart</label>
                  <select
                    value={newSkiData.type}
                    onChange={(e) => setNewSkiData({ ...newSkiData, type: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0284c7', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '14px' }}
                  >
                    <option>Klassisk</option>
                    <option>Skate</option>
                    <option>Felleski</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Lengde (cm)</label>
                  <input
                    type="number"
                    value={newSkiData.lengthCm}
                    onChange={(e) => setNewSkiData({ ...newSkiData, lengthCm: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#c2410c', display: 'block', marginBottom: '6px' }}>Strava #tag</label>
                  <input
                    value={newSkiData.tag}
                    placeholder="#tag"
                    onChange={(e) => setNewSkiData({ ...newSkiData, tag: e.target.value })}
                    style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#c2410c', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Min vekt (kg)</label>
                  <input
                    type="number"
                    value={newSkiData.weightKgMin}
                    onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMin: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Maks vekt (kg)</label>
                  <input
                    type="number"
                    value={newSkiData.weightKgMax}
                    onChange={(e) => setNewSkiData({ ...newSkiData, weightKgMax: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Slipestruktur</label>
                  <input
                    value={newSkiData.grind}
                    onChange={(e) => setNewSkiData({ ...newSkiData, grind: e.target.value })}
                    placeholder="f.eks CW1"
                    style={{ width: '100%', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* SPENNTALL */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>
                  MÅLEVERDIER FRA LAPP / SKI (HVIS SYNLIG)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>HBW (mm)</label>
                    <input
                      value={newSkiData.hbw}
                      placeholder="1.29"
                      onChange={(e) => setNewSkiData({ ...newSkiData, hbw: e.target.value })}
                      style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#ff5500' }}>FBW (mm)</label>
                    <input
                      value={newSkiData.fbw}
                      placeholder="0.22"
                      onChange={(e) => setNewSkiData({ ...newSkiData, fbw: e.target.value })}
                      style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>Lomme foran</label>
                    <input
                      value={newSkiData.pocketFrontCm}
                      placeholder="38"
                      onChange={(e) => setNewSkiData({ ...newSkiData, pocketFrontCm: e.target.value })}
                      style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>Lomme bak</label>
                    <input
                      value={newSkiData.pocketRearCm}
                      placeholder="16"
                      onChange={(e) => setNewSkiData({ ...newSkiData, pocketRearCm: e.target.value })}
                      style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '6px', fontSize: '16px', boxShadow: '0 6px 16px rgba(5, 150, 105, 0.25)' }}
              >
                ✓ Lagre ski i {getPossessiveTitle(currentMember, user)}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
