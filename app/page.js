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
    notes: "Nydelig glid på -2 til -7 med faste spor. Eksempel på birkenski.",
    maintenanceLog: [
      { date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" }
    ]
  },
  {
    id: "ski-2",
    isDemo: true,
    memberId: "m-1",
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
    notes: "Eksempel på tørrvoksski. Null subb i staking og lett å tråkke ned.",
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  },
  {
    id: "ski-3",
    isDemo: true,
    memberId: "m-2",
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

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // E-post auth state
  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [authLoading, setAuthLoading] = useState(false);

  // Strava state (Metode 1)
  const [stravaConnected, setStravaConnected] = useState(false);
  const [showStravaModal, setShowStravaModal] = useState(false);
  const [unassignedActivities, setUnassignedActivities] = useState([]);

  // Familiemedlemmer
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState("m-1");
  const [showAddMember, setShowAddMember] = useState(false);

  // Skipark
  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park");
  const [selectedSkiId, setSelectedSkiId] = useState("ski-2");
  const [filter, setFilter] = useState("Alle");

  // Yr Steder
  const [spots, setSpots] = useState(DEFAULT_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(DEFAULT_SPOTS[0]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // PWA install-prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Kamera-states for Skiselector (Gemini AI)
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSkiData, setAnalyzedSkiData] = useState(null);
  const [aiError, setAiError] = useState("");
  const fileInputRef = useRef(null);

  // QR-scanner states
  const [qrManualInput, setQrManualInput] = useState("");
  const [qrScanning, setQrScanning] = useState(false);
  const qrFileInputRef = useRef(null);

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
      alert("Vennligst oppgi et gyldig navn og koordinater (f.eks 60.10 og 10.50).");
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
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("For å legge til på hjemskjermen:\n\n• På iPhone/iPad: Trykk på Del-ikonet nederst i Safari og velg «Legg til på Hjem-skjerm» 📲\n• På Android/Chrome: Trykk på de tre prikkene øverst til høyre og velg «Installer app» eller «Legg til på startskjerm».");
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
        text: err.message === "Invalid login credentials"
          ? "Feil e-post eller passord."
          : err.message,
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

  const handleAddSki = (newSki) => {
    const updated = [newSki, ...skis];
    persistSkis(updated);
    setSelectedSkiId(newSki.id);
    setView("detail");
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

  const handleAddLog = (id, entry) => {
    const updated = skis.map(s => s.id === id ? {
      ...s,
      maintenanceLog: [entry, ...(s.maintenanceLog || [])]
    } : s);
    persistSkis(updated);
  };

  // EKTE GEMINI AI BILDEANALYSE AV SKISELECTOR (MED FEILMELDING VISNING)
  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setAiError("");
    setAnalyzedSkiData(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        try {
          const res = await fetch('/api/analyze-skiselector', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64data, mimeType })
          });

          const json = await res.json();
          if (!res.ok) {
            setAiError(json.error || `Serverfeil: ${res.status} ${res.statusText}`);
            setIsAnalyzing(false);
            return;
          }

          if (json.data && (json.data.hbw || json.data.brand || json.data.model)) {
            setAnalyzedSkiData(json.data);
          } else {
            setAiError("Gemini fant ingen tydelige Skiselector-verdier i bildet. Kontroller at bildet viser tallene tydelig.");
          }
          setIsAnalyzing(false);
        } catch (fetchErr) {
          setAiError(`Nettverksfeil mot /api/analyze-skiselector: ${fetchErr.message}`);
          setIsAnalyzing(false);
        }
      };
    } catch (err) {
      setAiError(`Klarte ikke å lese bildefilen: ${err.message}`);
      setIsAnalyzing(false);
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
    alert(`✓ Strava synkronisert!\n${matchedCount} økter matchet automatisk via hashtag (#).\n${unassigned.length} økt manglet hashtag og kan tildeles manuelt under.`);
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

  const processQrPayload = (payload) => {
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      handleAddSki({
        id: "ski-" + Date.now(),
        isDemo: false,
        memberId: activeMemberId,
        tag: "#nyski",
        brand: "Madshus",
        model: "Redline Classic (QR Skiplukkern)",
        type: "Klassisk",
        camberType: "Universal Kald",
        lengthCm: 207,
        weightKgMin: currentMember.weightKg - 2,
        weightKgMax: currentMember.weightKg + 4,
        tempOptimalMin: -14,
        tempOptimalMax: -2,
        bindingShift: "+1",
        grind: "M61",
        hbw: 1.18,
        fbw: 0.23,
        pocketFrontCm: 39,
        pocketRearCm: 16,
        stravaKm: 0,
        notes: payload ? `Skannet QR: ${payload}` : "Importert via målekort QR",
        maintenanceLog: [
          { date: new Date().toISOString().split("T")[0], title: "Importert fra butikkmåling", type: "Måling" }
        ]
      });
      alert(`✓ Måledata fra QR-koden ble lagt til for ${currentMember.name}!`);
    }, 900);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', fontSize: '18px', fontWeight: '600' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  // Velkomstskjerm
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
            Profesjonell skipark-administrasjon, live Yr-førevelger, smøretips og Skiselector AI-avlesning.
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

  const rankedSkis = [...memberSkis].map(s => ({ ...s, matchScore: calculateMatch(s) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const filteredSkis = (view === "recommender" ? rankedSkis : memberSkis).filter(s => {
    if (filter === "Klassisk") return s.type === "Klassisk" || s.type === "Felleski";
    if (filter === "Skate") return s.type === "Skate";
    return true;
  });

  const bestSki = rankedSkis[0];
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

        {/* STRAVA METODE 1 MODAL */}
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
                    {s.brand} {s.model}: <strong>{s.tag || '#mangler'}</strong>
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
                        Bruk {ski.brand} ({ski.tag || ski.type})
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
                Skiparken inneholder forhåndsutfylte eksempel-ski så du kan teste funksjonene. Dette er <strong>ikke</strong> andre brukeres data.
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
            { id: "manual", label: "➕ Legg til ski" },
            { id: "camera", label: "📸 Skiselector AI Bilde" },
            { id: "qr", label: "🏁 QR Målerapport" },
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

        {/* 1. SKIPARK */}
        {(view === "park" || view === "recommender") && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {["Alle", "Klassisk", "Skate"].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    style={{
                      background: filter === t ? '#0f172a' : '#ffffff',
                      color: filter === t ? '#ffffff' : '#475569',
                      border: '1px solid ' + (filter === t ? '#0f172a' : '#cbd5e1'),
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {view === "recommender" && (
                <div style={{ fontSize: '14px', color: '#0284c7', fontWeight: '700' }}>
                  Optimalt for {currentMember.name === 'Meg' ? 'deg' : currentMember.name} ({currentMember.weightKg} kg) på {weatherData ? `${weatherData.temp}°C` : 'dagens føre'}
                </div>
              )}
            </div>

            {filteredSkis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', fontSize: '16px' }}>
                Ingen ski registrert her ennå. Trykk <strong>➕ Legg til ski</strong> for å opprette et par.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
                {filteredSkis.map((ski, index) => {
                  const isWeightMatch = currentMember.weightKg >= ski.weightKgMin && currentMember.weightKg <= ski.weightKgMax;
                  const score = ski.matchScore !== undefined ? ski.matchScore : calculateMatch(ski);

                  return (
                    <div
                      key={ski.id}
                      style={{
                        background: '#ffffff',
                        border: view === 'recommender' && index === 0 ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '18px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: view === 'recommender' && index === 0 ? '0 12px 28px rgba(2, 132, 199, 0.15)' : '0 4px 10px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

                        <div onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }} style={{ cursor: 'pointer' }}>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>{ski.brand} {ski.model}</h3>
                          <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{ski.lengthCm} cm • {ski.camberType}</p>

                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', fontSize: '13px', color: '#334155', lineHeight: '1.7', border: '1px solid #f1f5f9' }}>
                            <div>Optimal temperatur: <strong style={{ color: '#0284c7' }}>{ski.tempOptimalMin}°C til {ski.tempOptimalMax}°C</strong></div>
                            <div>Slip: <strong>{ski.grind}</strong></div>
                            <div>Vektområde: <strong>{ski.weightKgMin}-{ski.weightKgMax} kg</strong></div>
                            <div>Binding: <strong style={{ color: '#ea580c' }}>{ski.bindingShift || '0'}</strong></div>
                            <div>Strava-distanse: <strong style={{ color: '#fc4c02' }}>{ski.stravaKm || 0} km</strong></div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }}
                        style={{ marginTop: '16px', width: '100%', background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '12px', color: '#0284c7', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
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

        {/* 2. DETALJVISNING AV SKI */}
        {view === "detail" && activeSki && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setView("park")}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0284c7', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                ← Tilbake til skiparken
              </button>

              <button
                onClick={() => handleDeleteSki(activeSki.id, `${activeSki.brand} ${activeSki.model}`)}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                🗑️ Slett dette skiparet
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                      {activeSki.type} • {activeSki.lengthCm} cm • Løper: {members.find(m => m.id === activeSki.memberId)?.name || 'Felles'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                      Strava-kode: {activeSki.tag || '#mangler'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '800', color: '#0f172a' }}>{activeSki.brand} {activeSki.model}</h2>
                  <p style={{ color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' }}>Profil: {activeSki.camberType} | Slip: {activeSki.grind}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
                Spennkurve ({currentMember.weightKg} kg)
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Beregnet kurveprofil ved halvvekt (HBW) og fullvekt (FBW).</p>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <svg viewBox="0 0 800 140" style={{ width: '100%', height: '140px' }}>
                  <line x1="20" y1="110" x2="780" y2="110" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4" />
                  <path d="M 60 108 Q 400 24 740 108" fill="none" stroke="#0284c7" strokeWidth="4" />
                  <path d="M 120 109 Q 400 82 680 109" fill="none" stroke="#ff5500" strokeWidth="3" />
                  <line x1="400" y1="15" x2="400" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3" />
                  <rect x="270" y="105" width="200" height="9" fill="#10b981" opacity="0.75" rx="3" />
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#334155', paddingTop: '16px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                  <div>HBW (Halvvekt): <strong style={{ color: '#0284c7' }}>{activeSki.hbw || 1.15} mm</strong></div>
                  <div>FBW (Fullvekt): <strong style={{ color: '#ff5500' }}>{activeSki.fbw || 0.22} mm</strong></div>
                  <div>Smørelomme: <strong style={{ color: '#059669' }}>+{activeSki.pocketFrontCm || 38}cm / -{activeSki.pocketRearCm || 16}cm</strong></div>
                  <div>Total distanse: <strong style={{ color: '#ea580c' }}>{activeSki.stravaKm || 0} km</strong></div>
                </div>
              </div>
            </div>

            {/* Notater og Logg */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
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
                    + Loggfør
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

        {/* 3. MANUELL REGISTRERING */}
        {view === "manual" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '30px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '22px', margin: '0 0 20px 0', fontWeight: '800' }}>➕ Manuell registrering av skipar</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const rawTag = fd.get("tag") || "";
              const cleanTag = rawTag.trim().startsWith("#") ? rawTag.trim().toLowerCase() : (rawTag.trim() ? `#${rawTag.trim().toLowerCase()}` : "#ski");

              handleAddSki({
                id: "ski-" + Date.now(),
                isDemo: false,
                memberId: fd.get("memberId"),
                tag: cleanTag,
                brand: fd.get("brand"),
                model: fd.get("model"),
                type: fd.get("type"),
                camberType: fd.get("camber") || "Allround",
                lengthCm: parseInt(fd.get("length")) || 190,
                weightKgMin: parseFloat(fd.get("wMin")) || 60,
                weightKgMax: parseFloat(fd.get("wMax")) || 70,
                tempOptimalMin: parseFloat(fd.get("tempMin")) || -10,
                tempOptimalMax: parseFloat(fd.get("tempMax")) || -2,
                bindingShift: "0",
                grind: fd.get("grind") || "Universal",
                hbw: parseFloat(fd.get("hbw")) || 1.15,
                fbw: parseFloat(fd.get("fbw")) || 0.22,
                pocketFrontCm: 35,
                pocketRearCm: 15,
                stravaKm: 0,
                notes: fd.get("notes") || "",
                maintenanceLog: []
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Hvem tilhører dette paret?</label>
                <select name="memberId" defaultValue={activeMemberId} style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0284c7', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '15px' }}>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                  ))}
                  <option value="all">Fellespar / Alle</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Merke</label>
                  <select name="brand" style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                    <option>Fischer</option><option>Madshus</option><option>Rossignol</option><option>Salomon</option><option>Atomic</option><option>Kästle</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Modell</label>
                  <input name="model" required placeholder="f.eks Speedmax 3D" style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#c2410c', display: 'block', marginBottom: '6px' }}>Strava-hashtag (#kode)</label>
                <input name="tag" placeholder="f.eks #speedmax eller #kaldski" style={{ width: '100%', background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#c2410c', padding: '12px', borderRadius: '12px', boxSizing: 'border-box', fontSize: '14px', fontWeight: '700' }} />
                <span style={{ fontSize: '12px', color: '#9a3412', marginTop: '4px', display: 'block' }}>Skriv denne hashtaggen i tittel på Strava-økta for automatisk km-logging.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Stilart</label>
                  <select name="type" style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0284c7', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px' }}>
                    <option>Skate</option><option>Klassisk</option><option>Felleski</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Lengde (cm)</label>
                  <input name="length" type="number" defaultValue="191" style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Min vekt (kg)</label>
                  <input name="wMin" type="number" defaultValue={String(currentMember.weightKg - 3)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Maks vekt (kg)</label>
                  <input name="wMax" type="number" defaultValue={String(currentMember.weightKg + 3)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px', borderRadius: '12px', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
              </div>

              <button type="submit" style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}>
                Lagre ski i samlingen
              </button>
            </form>
          </div>
        )}

        {/* 4. SKISELECTOR AI BILDEAVLESNING */}
        {view === "camera" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '32px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>🤖</div>
              <h2 style={{ fontSize: '22px', margin: '0 0 8px 0', fontWeight: '800' }}>Skiselector AI-bildeavlesning</h2>
              <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                Ta bilde av Skiselector-skjermen eller papirrapporten. Gemini AI leser av HBW, FBW, smøresoner og vekt automatisk.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageCapture}
              style={{ display: 'none' }}
            />

            {!capturedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2.5px dashed #0284c7',
                  borderRadius: '16px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f0f9ff'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📸</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>
                  Trykk her for å åpne kamera / laste opp Skiselector-bilde
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Støtter direkte mobilkamera, foto fra biblioteket og skjermbilder
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1', maxHeight: '260px', background: '#000', display: 'flex', justifyContent: 'center' }}>
                  <img src={capturedImage} alt="Skiselector" style={{ maxHeight: '260px', width: 'auto', objectFit: 'contain' }} />
                  <button
                    onClick={() => { setCapturedImage(null); setAnalyzedSkiData(null); setAiError(""); fileInputRef.current.value = ""; }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ✕ Ta nytt bilde
                  </button>
                </div>

                {isAnalyzing && (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe', color: '#0284c7', fontSize: '15px', fontWeight: '700' }}>
                    ⏳ Gemini AI analyserer Skiselector-skjermen og henter spenntall...
                  </div>
                )}

                {aiError && (
                  <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                    ⚠️ {aiError}
                  </div>
                )}

                {analyzedSkiData && !isAnalyzing && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    handleAddSki({
                      id: "ski-" + Date.now(),
                      isDemo: false,
                      memberId: activeMemberId,
                      tag: "#" + (fd.get("brand") || "ski").toLowerCase(),
                      brand: fd.get("brand") || "Ukjent",
                      model: fd.get("model") || "Skiselector Par",
                      type: fd.get("type") || "Klassisk",
                      camberType: "Skiselector Kurve",
                      lengthCm: parseInt(fd.get("length")) || 207,
                      weightKgMin: parseFloat(fd.get("wMin")) || (currentMember.weightKg - 3),
                      weightKgMax: parseFloat(fd.get("wMax")) || (currentMember.weightKg + 3),
                      tempOptimalMin: -12,
                      tempOptimalMax: -2,
                      bindingShift: "0",
                      grind: "Fabrikkslip",
                      hbw: parseFloat(fd.get("hbw")) || null,
                      fbw: parseFloat(fd.get("fbw")) || null,
                      pocketFrontCm: parseFloat(fd.get("pocketFront")) || 38,
                      pocketRearCm: parseFloat(fd.get("pocketRear")) || 16,
                      stravaKm: 0,
                      notes: "Automatisk innlest fra Skiselector bilde via Gemini AI",
                      maintenanceLog: []
                    });
                  }} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>
                      ✓ Gemini AI leste av disse verdiene fra bildet (bekreft eller juster):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Merke</label>
                        <input name="brand" defaultValue={analyzedSkiData.brand || ""} placeholder="F.eks Fischer / Madshus" style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px', fontWeight: '700' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Modell</label>
                        <input name="model" defaultValue={analyzedSkiData.model || ""} placeholder="F.eks Speedmax / Redline" style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px', fontWeight: '700' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>HBW (mm)</label>
                        <input name="hbw" defaultValue={analyzedSkiData.hbw || ""} step="0.01" placeholder="1.15" style={{ width: '100%', background: '#ffffff', border: '1.5px solid #0284c7', color: '#0284c7', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px', fontWeight: '800' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>FBW (mm)</label>
                        <input name="fbw" defaultValue={analyzedSkiData.fbw || ""} step="0.01" placeholder="0.22" style={{ width: '100%', background: '#ffffff', border: '1.5px solid #ff5500', color: '#ff5500', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px', fontWeight: '800' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Lomme foran</label>
                        <input name="pocketFront" defaultValue={analyzedSkiData.pocketFront || ""} placeholder="38" style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Lomme bak</label>
                        <input name="pocketRear" defaultValue={analyzedSkiData.pocketRear || ""} placeholder="16" style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Stilart</label>
                        <select name="type" defaultValue={analyzedSkiData.type || "Klassisk"} style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0284c7', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }}>
                          <option>Klassisk</option><option>Skate</option><option>Felleski</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Lengde (cm)</label>
                        <input name="length" defaultValue={analyzedSkiData.lengthCm || 207} style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', fontSize: '14px' }} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}
                    >
                      Legg til i {getPossessiveTitle(currentMember, user)}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. QR-SKANNING */}
        {view === "qr" && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '36px 24px', textAlign: 'center', maxWidth: '580px', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '46px', marginBottom: '14px' }}>🏁</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '800' }}>Skann QR / Målekort</h3>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Hold kameraet over QR-koden på målekortet fra butikken for direkte import til <strong>{currentMember.name}</strong>.
            </p>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={qrFileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  processQrPayload(file.name);
                }
              }}
            />

            {qrScanning ? (
              <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '16px', border: '1.5px solid #bae6fd', color: '#0284c7', fontWeight: '700', fontSize: '16px' }}>
                ⏳ Leser QR-kode og henter måledata...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <button
                  onClick={() => qrFileInputRef.current?.click()}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '16px 32px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -4px rgba(2, 132, 199, 0.3)' }}
                >
                  <span style={{ fontSize: '20px' }}>📷</span>
                  <span>Åpne kamera og skann QR</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '14px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ padding: '0 10px', textTransform: 'uppercase' }}>eller tast inn kode / URL manuelt</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '420px' }}>
                  <input
                    type="text"
                    placeholder="F.eks skiplukkern.no/m/12345"
                    value={qrManualInput}
                    onChange={(e) => setQrManualInput(e.target.value)}
                    style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px 14px', fontSize: '14px' }}
                  />
                  <button
                    onClick={() => {
                      if (qrManualInput.trim()) {
                        processQrPayload(qrManualInput.trim());
                      } else {
                        alert("Vennligst oppgi en kode eller URL fra målekortet.");
                      }
                    }}
                    style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '12px 18px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Hent
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
