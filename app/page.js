'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const INITIAL_SKIS = [
  {
    id: "ski-1",
    brand: "Fischer",
    model: "Speedmax 3D Skate Plus",
    type: "Skate",
    camberType: "Cold / Hard Track (610)",
    lengthCm: 191,
    weightKgMin: 72,
    weightKgMax: 78,
    grind: "P5-1 Allround Minus",
    hbw: null,
    fbw: null,
    notes: "Går fantastisk på -2 til -7 med litt fastere såle. Bør settes opp med finkornet struktur til Birken.",
    maintenanceLog: [
      { date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" },
      { date: "2024-11-20", title: "Planslipet hos Milslukern", type: "Slip" }
    ],
    splayTipMm: 3.2,
    splayTailMm: 2.1
  },
  {
    id: "ski-2",
    brand: "Madshus",
    model: "Redline 3.0 Classic Cold",
    type: "Klassisk",
    camberType: "Tørrvoks / Kald",
    lengthCm: 207,
    weightKgMin: 74,
    weightKgMax: 80,
    grind: "M61 Kald",
    hbw: 1.15,
    fbw: 0.22,
    pocketFrontCm: 38,
    pocketRearCm: 16,
    notes: "Nydelig tørrvoksski. Null motstand i framføring. Tråkkes lett ned på hard voks.",
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  },
  {
    id: "ski-3",
    brand: "Rossignol",
    model: "X-IUM R-Skin Premium",
    type: "Felleski",
    camberType: "Integrert Mohair",
    lengthCm: 203,
    weightKgMin: 70,
    weightKgMax: 77,
    grind: "K7 Universal",
    hbw: 1.35,
    fbw: 0.38,
    pocketFrontCm: 32,
    pocketRearCm: 12,
    notes: "Perfekt treningsski. Fellen subber ikke ved staking i lett terreng.",
    maintenanceLog: [
      { date: "2025-01-10", title: "Impregnert fell med Swix Skin Care", type: "Fell" }
    ]
  }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userWeight, setUserWeight] = useState(76);
  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park"); // 'park', 'manual', 'camera', 'qr', 'detail'
  const [selectedSkiId, setSelectedSkiId] = useState("ski-2");
  const [filter, setFilter] = useState("Alle");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handleAddSki = (newSki) => {
    setSkis([newSki, ...skis]);
    setSelectedSkiId(newSki.id);
    setView("detail");
  };

  const handleSaveNotes = (id, newNotes) => {
    setSkis(skis.map(s => s.id === id ? { ...s, notes: newNotes } : s));
  };

  const handleAddLog = (id, entry) => {
    setSkis(skis.map(s => s.id === id ? {
      ...s,
      maintenanceLog: [entry, ...(s.maintenanceLog || [])]
    } : s));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  // Ikke innlogget visning
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '36px', borderRadius: '20px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⛷️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SkiPark Pro</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
            Digital skipark, spennkurver, sliprapporter og vedlikeholdslogg.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{ width: '100%', background: '#fff', color: '#0f172a', fontWeight: 'bold', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
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

  const activeSki = skis.find(s => s.id === selectedSkiId) || skis[0];
  const filteredSkis = skis.filter(s => {
    if (filter === "Klassisk") return s.type === "Klassisk" || s.type === "Felleski";
    if (filter === "Skate") return s.type === "Skate";
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '24px 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Topplinje */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '30px' }}>⛷️</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>SkiPark Pro</h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Digital skipark, spennkurver & målelogger</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
              <span>{user.user_metadata?.full_name || user.email}</span>
              <span style={{ background: '#082f49', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {userWeight} kg
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Logg ut
            </button>
          </div>
        </header>

        {/* Navigasjon */}
        <nav style={{ display: 'flex', gap: '8px', margin: '20px 0', flexWrap: 'wrap' }}>
          {[
            { id: "park", label: `🎿 Min Skipark (${skis.length})` },
            { id: "manual", label: "➕ Legg til ski (Manuell)" },
            { id: "camera", label: "📸 AI Bildegjenkjenning" },
            { id: "qr", label: "🏁 QR Målerapport" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: view === tab.id ? (tab.id === 'manual' ? '#10b981' : '#0ea5e9') : '#0f172a',
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

        {/* 1. HOVEDVISNING: SKIPARK LISTE */}
        {view === "park" && (
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
              <button
                onClick={() => setView("manual")}
                style={{ background: '#10b981', color: '#020617', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Nytt skipar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredSkis.map(ski => {
                const isMatch = userWeight >= ski.weightKgMin && userWeight <= ski.weightKgMax;
                return (
                  <div
                    key={ski.id}
                    onClick={() => { setSelectedSkiId(ski.id); setView("detail"); }}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: ski.type === 'Skate' ? '#1e3a8a' : '#064e3b', color: '#93c5fd' }}>
                          {ski.type}
                        </span>
                        <span style={{ fontSize: '11px', color: isMatch ? '#4ade80' : '#f59e0b', fontFamily: 'monospace' }}>
                          {isMatch ? "✓ Perfekt match" : "⚠️ Vektavvik"}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff' }}>{ski.brand} {ski.model}</h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8' }}>{ski.lengthCm} cm • {ski.camberType}</p>

                      <div style={{ background: '#020617', padding: '10px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div>Slip: <strong>{ski.grind}</strong></div>
                        <div>Vektintervall: <strong>{ski.weightKgMin}-{ski.weightKgMax} kg</strong></div>
                        {ski.hbw && <div>HBW / FBW: <strong style={{ color: '#38bdf8' }}>{ski.hbw} / {ski.fbw} mm</strong></div>}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '8px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>
                      Vis spennkurve & logg →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DETALJVISNING AV SKI (SPENNKURVE & NOTATER) */}
        {view === "detail" && activeSki && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button
              onClick={() => setView("park")}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '13px' }}
            >
              ← Tilbake til skiparken
            </button>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '11px', background: '#082f49', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {activeSki.type} • {activeSki.lengthCm} cm
              </span>
              <h2 style={{ fontSize: '22px', margin: '10px 0 4px 0' }}>{activeSki.brand} {activeSki.model}</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Profil: {activeSki.camberType} | Slip: {activeSki.grind}</p>
            </div>

            {/* Spennkurve SVG */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>Spennkurve & Smørelomme</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>Viser spennets profil ved halvvekt (HBW) og full tråkkvekt (FBW).</p>

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
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📝 Notater for dette paret</h4>
                <textarea
                  defaultValue={activeSki.notes || ""}
                  onBlur={(e) => handleSaveNotes(activeSki.id, e.target.value)}
                  rows="4"
                  style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', padding: '10px', boxSizing: 'border-box', fontSize: '12px' }}
                  placeholder="Skriv erfaringer med dette paret..."
                />
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🔧 Vedlikeholds- og smøringslogg</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    id="logInput"
                    type="text"
                    placeholder="F.eks Swix Marathon + Rill 1mm"
                    style={{ flex: 1, background: '#020617', border: '1px solid #1e293b', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }}
                  />
                  <button
                    onClick={() => {
                      const inp = document.getElementById("logInput");
                      if (inp && inp.value.trim()) {
                        handleAddLog(activeSki.id, { date: new Date().toISOString().split("T")[0], title: inp.value, type: "Glid" });
                        inp.value = "";
                      }
                    }}
                    style={{ background: '#0ea5e9', border: 'none', color: '#020617', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Legg til
                  </button>
                </div>

                <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

        {/* 3. MANUELL REGISTRERING */}
        {view === "manual" && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>➕ Manuell registrering av skipar</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleAddSki({
                id: "ski-" + Date.now(),
                brand: fd.get("brand"),
                model: fd.get("model"),
                type: fd.get("type"),
                camberType: fd.get("camber"),
                lengthCm: parseInt(fd.get("length")) || 190,
                weightKgMin: parseFloat(fd.get("wMin")) || 70,
                weightKgMax: parseFloat(fd.get("wMax")) || 80,
                grind: fd.get("grind") || "Universal",
                hbw: parseFloat(fd.get("hbw")) || 1.15,
                fbw: parseFloat(fd.get("fbw")) || 0.22,
                pocketFrontCm: 35,
                pocketRearCm: 15,
                notes: fd.get("notes") || "",
                maintenanceLog: []
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  <input name="wMin" type="number" defaultValue="72" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Maks vekt (kg)</label>
                  <input name="wMax" type="number" defaultValue="78" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Slip / Struktur</label>
                  <input name="grind" placeholder="f.eks SP21" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Føre / Spennprofil</label>
                  <input name="camber" placeholder="Kald / Plus" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', color: '#fff', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ background: '#10b981', color: '#020617', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Lagre ski i samlingen
              </button>
            </form>
          </div>
        )}

        {/* 4. AI-KAMERA & 5. QR-SKANNING */}
        {(view === "camera" || view === "qr") && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{view === 'camera' ? '📸' : '🏁'}</div>
            <h3 style={{ margin: '0 0 8px 0' }}>{view === 'camera' ? 'AI Bildegjenkjenning' : 'QR Måleskanning'}</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              {view === 'camera' ? 'Tar bilde av skitupp eller grafikk for automatisk modelltolking.' : 'Skanner QR-etikett fra f.eks Skiplukkern for direkte import av kurver.'}
            </p>
            <button
              onClick={() => {
                alert("Kamera/QR-simulering aktivert. Et test-par legges til i skiparken din.");
                handleAddSki({
                  id: "ski-" + Date.now(),
                  brand: "Madshus",
                  model: view === 'camera' ? "Redline Skate (AI Funnet)" : "Redline Classic (QR Skiplukkern)",
                  type: "Skate",
                  camberType: "Universal",
                  lengthCm: 192,
                  weightKgMin: 74,
                  weightKgMax: 80,
                  grind: "SP21",
                  hbw: 1.20,
                  fbw: 0.25,
                  notes: "Importert via " + (view === 'camera' ? 'kamera' : 'QR'),
                  maintenanceLog: []
                });
              }}
              style={{ background: '#0ea5e9', color: '#020617', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Start skanning
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
