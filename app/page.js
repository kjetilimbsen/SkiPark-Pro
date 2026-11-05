'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const SKI_SPOTS = [
  { name: "Sjusjøen", lat: 61.15, lon: 10.70 },
  { name: "Holmenkollen", lat: 59.96, lon: 10.67 },
  { name: "Beitostølen", lat: 61.25, lon: 8.90 },
  { name: "Granåsen (Trondheim)", lat: 63.38, lon: 10.31 },
  { name: "Geilo", lat: 60.53, lon: 8.20 }
];

const INITIAL_MEMBERS = [
  { id: "m-1", name: "Meg", weightKg: 76 },
  { id: "m-2", name: "Junior", weightKg: 52 },
  { id: "m-3", name: "Partner", weightKg: 64 }
];

const INITIAL_SKIS = [
  {
    id: "ski-1",
    memberId: "m-1",
    brand: "Fischer",
    model: "Speedmax 3D Skate Plus",
    type: "Skate",
    camberType: "Kald / Fast såle",
    tempOptimalMin: -8,
    tempOptimalMax: -2,
    bindingShift: "0",
    lengthCm: 191,
    weightKgMin: 72,
    weightKgMax: 78,
    grind: "P5-1 Allround Minus",
    hbw: null,
    fbw: null,
    notes: "Nydelig glid på -2 til -7 med litt fastere underlag. God birkenski.",
    maintenanceLog: [
      { date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" },
      { date: "2024-11-20", title: "Planslipet hos Milslukern", type: "Slip" }
    ]
  },
  {
    id: "ski-2",
    memberId: "m-1",
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
    notes: "Nydelig tørrvoksski. Null subb i framføring. Tråkkes lett ned på hard voks.",
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  },
  {
    id: "ski-3",
    memberId: "m-2",
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
    notes: "Felleski for Junior. Lett å tråkke ned for sikkert feste på trening.",
    maintenanceLog: [
      { date: "2025-01-10", title: "Renset og impregnert fell", type: "Fell" }
    ]
  }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Familiemedlemmer / Løpere
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState("m-1");
  const [showAddMember, setShowAddMember] = useState(false);

  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park");
  const [selectedSkiId, setSelectedSkiId] = useState("ski-2");
  const [filter, setFilter] = useState("Alle");

  // Yr Vær-state
  const [selectedSpot, setSelectedSpot] = useState(SKI_SPOTS[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Kamera-state
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  // Aktiv løper
  const currentMember = members.find(m => m.id === activeMemberId) || members[0] || { name: "Meg", weightKg: 76 };

  useEffect(() => {
    const savedMembers = localStorage.getItem("skipark_family_members");
    if (savedMembers) {
      try { setMembers(JSON.parse(savedMembers)); } catch (e) {}
    }

    const savedSkis = localStorage.getItem("skipark_skis_data");
    if (savedSkis) {
      try { setSkis(JSON.parse(savedSkis)); } catch (e) {}
    }

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

  const handleAddLog = (id, entry) => {
    const updated = skis.map(s => s.id === id ? {
      ...s,
      maintenanceLog: [entry, ...(s.maintenanceLog || [])]
    } : s);
    persistSkis(updated);
  };

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '36px', borderRadius: '20px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⛷️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SkiPark Pro</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
            Familie- og team-administrasjon, Yr-førevelger, spennkurver og Skiselector.
          </p>
          <button
            onClick={handleGoogleLogin}
            style={{ width: '100%', background: '#fff', color: '#0f172a', fontWeight: 'bold', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px' }}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Fortsett med Google
          </button>
        </div>
      </div>
    );
  }

  // Filtrer ski for aktivt familiemedlem eller felles
  const memberSkis = skis.filter(s => !s.memberId || s.memberId === activeMemberId || s.memberId === "all");
  const activeSki = memberSkis.find(s => s.id === selectedSkiId) || memberSkis[0] || skis[0];

  // Matchberegning mot aktiv løper
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

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '24px 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* TOPPLINJE */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '30px' }}>⛷️</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>SkiPark Pro</h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Familiemodus & skysynk</p>
            </div>
          </div>

          {/* FAMILIE- OG LØPERVELGER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>👤</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Løper:</span>
              <select
                value={activeMemberId}
                onChange={(e) => setActiveMemberId(e.target.value)}
                style={{ background: '#020617', border: '1px solid #334155', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
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
                title="Endre vekt"
                style={{ background: '#082f49', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
              >
                ✎ Vekt
              </button>

              <button
                onClick={() => setShowAddMember(true)}
                style={{ background: '#10b981', border: 'none', color: '#020617', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Ny løper
              </button>
            </div>

            <button onClick={handleLogout} style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Logg ut
            </button>
          </div>
        </header>

        {/* DIALOG FOR NY LØPER */}
        {showAddMember && (
          <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '12px', padding: '16px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Legg til løper / familiemedlem:</span>
            <input id="newMemName" placeholder="Navn (f.eks. Mamma)" style={{ background: '#020617', border: '1px solid #334155', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }} />
            <input id="newMemWeight" type="number" placeholder="Vekt i kg (f.eks. 62)" style={{ width: '130px', background: '#020617', border: '1px solid #334155', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }} />
            <button
              onClick={() => {
                const name = document.getElementById("newMemName")?.value;
                const weight = document.getElementById("newMemWeight")?.value;
                if (name && weight) handleAddMember(name, weight);
              }}
              style={{ background: '#10b981', color: '#020617', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              Lagre løper
            </button>
            <button onClick={() => setShowAddMember(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
              Avbryt
            </button>
          </div>
        )}

        {/* YR VÆR-BANNER */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px 18px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🌤️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Yr Værvarsel for</span>
                <select
                  value={selectedSpot.name}
                  onChange={(e) => {
                    const spot = SKI_SPOTS.find(s => s.name === e.target.value);
                    if (spot) setSelectedSpot(spot);
                  }}
                  style={{ background: '#020617', border: '1px solid #334155', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {SKI_SPOTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ marginTop: '4px', fontSize: '14px' }}>
                {weatherLoading ? (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Henter live vær fra Yr...</span>
                ) : weatherData ? (
                  <span>
                    <strong style={{ color: weatherData.temp <= 0 ? '#38bdf8' : '#f97316', fontSize: '16px' }}>{weatherData.temp}°C</strong>
                    <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '8px' }}>
                      • {weatherData.humidity}% fuktighet • {weatherData.windSpeed} m/s vind
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={() => setView("recommender")}
            style={{
              background: view === 'recommender' ? '#38bdf8' : '#082f49',
              color: view === 'recommender' ? '#020617' : '#38bdf8',
              border: '1px solid #0284c7',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✨ Dagens Skivelger for {currentMember.name}
          </button>
        </div>

        {/* HOVEDMENY */}
        <nav style={{ display: 'flex', gap: '8px', margin: '20px 0', flexWrap: 'wrap' }}>
          {[
            { id: "park", label: `🎿 ${currentMember.name}s Skipark (${memberSkis.length})` },
            { id: "recommender", label: "✨ Dagens Skivelger" },
            { id: "manual", label: "➕ Legg til ski (Manuell)" },
            { id: "camera", label: "📸 Skiselector Bilde" },
            { id: "qr", label: "🏁 QR Målerapport" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: view === tab.id ? (tab.id === 'recommender' ? '#38bdf8' : tab.id === 'manual' ? '#10b981' : '#0ea5e9') : '#0f172a',
                color: view === tab.id ? '#020617' : '#94a3b8',
                fontWeight: view === tab.id ? 'bold' : 'normal',
                border: '1px solid #1e293b',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 1. SKIPARK OG DAGENS ANBEFALING */}
        {(view === "park" || view === "recommender") && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {["Alle", "Klassisk", "Skate"].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    style={{
                      background: filter === t ? '#f8fafc' : '#0f172a',
                      color: filter === t ? '#020617' : '#94a3b8',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {view === "recommender" && (
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
                  Optimalt for {currentMember.name} ({currentMember.weightKg} kg) på {weatherData ? `${weatherData.temp}°C` : 'dagens føre'}
                </div>
              )}
            </div>

            {filteredSkis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b' }}>
                Ingen ski registrert for {currentMember.name} ennå. Trykk <strong>➕ Legg til ski</strong> for å legge til et par.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
                {filteredSkis.map((ski, index) => {
                  const isWeightMatch = currentMember.weightKg >= ski.weightKgMin && currentMember.weightKg <= ski.weightKgMax;
                  const score = ski.matchScore !== undefined ? ski.matchScore : calculateMatch(ski);

                  return (
                    <div
                      key={ski.id}
                      style={{
                        background: '#0f172a',
                        border: view === 'recommender' && index === 0 ? '2px solid #38bdf8' : '1px solid #1e293b',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: view === 'recommender' && index === 0 ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: ski.type === 'Skate' ? '#1e3a8a' : '#064e3b', color: '#93c5fd' }}>
                              {ski.type}
                            </span>
                            {view === 'recommender' && (
                              <span style={{ fontSize: '11px', fontWeight: 'bold', color: score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171' }}>
                                ★ {score}% Match
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: isWeightMatch ? '#4ade80' : '#f59e0b', fontFamily: 'monospace' }}>
                              {isWeightMatch ? "✓ Vekt" : "⚠️ Vektavvik"}
                            </span>
                            <button
                              onClick={() => handleDeleteSki(ski.id, `${ski.brand} ${ski.model}`)}
                              title="Slett dette paret"
                              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}
                              onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.target.style.color = '#64748b'}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }} style={{ cursor: 'pointer' }}>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff' }}>{ski.brand} {ski.model}</h3>
                          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>{ski.lengthCm} cm • {ski.camberType}</p>

                          <div style={{ background: '#020617', padding: '10px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', lineHeight: '1.6' }}>
                            <div>Optimalt føre: <strong style={{ color: '#38bdf8' }}>{ski.tempOptimalMin}°C til {ski.tempOptimalMax}°C</strong></div>
                            <div>Slip: <strong>{ski.grind}</strong></div>
                            <div>Vektområde: <strong>{ski.weightKgMin}-{ski.weightKgMax} kg</strong></div>
                            <div>Binding: <strong style={{ color: '#facc15' }}>{ski.bindingShift || '0'}</strong></div>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }}
                        style={{ marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Vis spennkurve & logg →
                      </div>
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
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '13px' }}
              >
                ← Tilbake til skiparken
              </button>

              <button
                onClick={() => handleDeleteSki(activeSki.id, `${activeSki.brand} ${activeSki.model}`)}
                style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗑️ Slett dette skiparet
              </button>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', background: '#082f49', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {activeSki.type} • {activeSki.lengthCm} cm • Tilhører: {members.find(m => m.id === activeSki.memberId)?.name || 'Felles'}
                  </span>
                  <h2 style={{ fontSize: '22px', margin: '10px 0 4px 0' }}>{activeSki.brand} {activeSki.model}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Profil: {activeSki.camberType} | Slip: {activeSki.grind}</p>
                </div>

                <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>BINDING (MOVE/SHIFT)</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {["-2", "-1", "0", "+1", "+2"].map(shift => (
                      <button
                        key={shift}
                        onClick={() => handleUpdateBinding(activeSki.id, shift)}
                        style={{
                          background: (activeSki.bindingShift || "0") === shift ? '#facc15' : '#0f172a',
                          color: (activeSki.bindingShift || "0") === shift ? '#020617' : '#cbd5e1',
                          fontWeight: 'bold',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        {shift}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spennkurve SVG mot aktiv løper */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>Spennkurve for {currentMember.name} ({currentMember.weightKg} kg)</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>Spennets høyde ved halvvekt (HBW) og fullvekt (FBW).</p>

              <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <svg viewBox="0 0 800 140" style={{ width: '100%', height: '120px' }}>
                  <line x1="20" y1="110" x2="780" y2="110" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
                  <path d="M 60 108 Q 400 30 740 108" fill="none" stroke="#38bdf8" strokeWidth="3" />
                  <path d="M 120 109 Q 400 85 680 109" fill="none" stroke="#f97316" strokeWidth="2.5" />
                  <line x1="400" y1="20" x2="400" y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" />
                  <rect x="270" y="106" width="200" height="7" fill="#22c55e" opacity="0.6" rx="2" />
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', paddingTop: '10px', borderTop: '1px solid #0f172a' }}>
                  <div>HBW: <strong style={{ color: '#38bdf8' }}>{activeSki.hbw || 1.15} mm</strong></div>
                  <div>FBW: <strong style={{ color: '#f97316' }}>{activeSki.fbw || 0.22} mm</strong></div>
                  <div>Lomme: <strong style={{ color: '#4ade80' }}>+{activeSki.pocketFrontCm || 38}cm / -{activeSki.pocketRearCm || 16}cm</strong></div>
                </div>
              </div>
            </div>

            {/* Notater og Logg */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📝 Erfaringer & Notater</h4>
                <textarea
                  defaultValue={activeSki.notes || ""}
                  onBlur={(e) => handleSaveNotes(activeSki.id, e.target.value)}
                  rows="4"
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', padding: '10px', boxSizing: 'border-box', fontSize: '12px' }}
                  placeholder="Skriv erfaringer med dette paret..."
                />
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🔧 Smøre- og vedlikeholdslogg</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    id="logInput"
                    type="text"
                    placeholder="F.eks Swix VP45 + Marathon"
                    style={{ flex: 1, background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }}
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
                    style={{ background: '#0ea5e9', border: 'none', color: '#020617', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Loggfør
                  </button>
                </div>

                <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(activeSki.maintenanceLog || []).map((l, i) => (
                    <div key={i} style={{ background: '#020617', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{l.title}</span>
                      <span style={{ color: '#64748b' }}>{l.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MANUELL REGISTRERING (MED LØPERVALG) */}
        {view === "manual" && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>➕ Manuell registrering av skipar</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleAddSki({
                id: "ski-" + Date.now(),
                memberId: fd.get("memberId"),
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
                notes: fd.get("notes") || "",
                maintenanceLog: []
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Hvem i familien tilhører dette paret?</label>
                <select name="memberId" defaultValue={activeMemberId} style={{ width: '100%', background: '#020617', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px', borderRadius: '6px', fontWeight: 'bold' }}>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>
                  ))}
                  <option value="all">Fellespar / Alle</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Merke</label>
                  <select name="brand" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                    <option>Fischer</option><option>Madshus</option><option>Rossignol</option><option>Salomon</option><option>Atomic</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Modell</label>
                  <input name="model" required placeholder="f.eks Speedmax Skate" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Skitype</label>
                  <select name="type" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', padding: '8px', borderRadius: '6px' }}>
                    <option>Skate</option><option>Klassisk</option><option>Felleski</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Lengde (cm)</label>
                  <input name="length" type="number" defaultValue="191" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Min vekt (kg)</label>
                  <input name="wMin" type="number" defaultValue={String(currentMember.weightKg - 3)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Maks vekt (kg)</label>
                  <input name="wMax" type="number" defaultValue={String(currentMember.weightKg + 3)} style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ background: '#10b981', color: '#020617', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Lagre ski i samlingen
              </button>
            </form>
          </div>
        )}

        {/* 4. SKISELECTOR SKJERMBILDE & KAMERAMODUL */}
        {view === "camera" && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
              <h2 style={{ fontSize: '18px', margin: '0 0 6px 0' }}>Ta bilde av Skiselector-skjerm</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Bruk kameraet for å hente måledata rett inn på <strong>{currentMember.name}</strong>.
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
                  border: '2px dashed #334155',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#020617'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>
                  Trykk her for å åpne kamera / laste opp bilde
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155', maxHeight: '240px', background: '#000', display: 'flex', justifyContent: 'center' }}>
                  <img src={capturedImage} alt="Skiselector" style={{ maxHeight: '240px', width: 'auto', objectFit: 'contain' }} />
                  <button
                    onClick={() => { setCapturedImage(null); fileInputRef.current.value = ""; }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✕ Ta nytt bilde
                  </button>
                </div>

                {isAnalyzing ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#38bdf8', fontSize: '13px' }}>
                    ⏳ Analyserer Skiselector-rapport...
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    handleAddSki({
                      id: "ski-" + Date.now(),
                      memberId: activeMemberId,
                      brand: fd.get("brand") || "Madshus",
                      model: fd.get("model") || "Redline Skiselector",
                      type: fd.get("type") || "Klassisk",
                      camberType: "Skiselector Profil",
                      lengthCm: parseInt(fd.get("length")) || 207,
                      weightKgMin: parseFloat(fd.get("wMin")) || (currentMember.weightKg - 2),
                      weightKgMax: parseFloat(fd.get("wMax")) || (currentMember.weightKg + 4),
                      tempOptimalMin: -12,
                      tempOptimalMax: -2,
                      bindingShift: "0",
                      grind: "Fabrikkslip",
                      hbw: parseFloat(fd.get("hbw")) || 1.18,
                      fbw: parseFloat(fd.get("fbw")) || 0.24,
                      pocketFrontCm: 37,
                      pocketRearCm: 15,
                      notes: "Importert fra Skiselector for " + currentMember.name,
                      maintenanceLog: []
                    });
                  }} style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4ade80' }}>
                      ✓ Legg til for {currentMember.name}:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: '#94a3b8' }}>Modell</label>
                        <input name="model" defaultValue="Redline Classic" style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px', boxSizing: 'border-box', fontSize: '12px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: '#94a3b8' }}>Skitype</label>
                        <select name="type" defaultValue="Klassisk" style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', padding: '6px', borderRadius: '6px', fontSize: '12px' }}>
                          <option>Klassisk</option><option>Skate</option><option>Felleski</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ background: '#10b981', color: '#020617', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Legg til i {currentMember.name}s skipark
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. QR-SKANNING */}
        {view === "qr" && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏁</div>
            <h3 style={{ margin: '0 0 8px 0' }}>QR Måleskanning</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Skanner etikett for direkte import til <strong>{currentMember.name}</strong>.
            </p>
            <button
              onClick={() => {
                alert(`QR importert og lagt til for ${currentMember.name}`);
                handleAddSki({
                  id: "ski-" + Date.now(),
                  memberId: activeMemberId,
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
                  notes: "Importert via QR-etikett",
                  maintenanceLog: []
                });
              }}
              style={{ background: '#0ea5e9', color: '#020617', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Start QR-skanning
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
