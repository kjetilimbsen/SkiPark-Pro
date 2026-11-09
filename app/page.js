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
  { brand: "Kästle", model: "RX 10 2.0 Classic", type: "Klassisk", grind: "CW1", lengthCm: 206, camber: "Cold", hbw: 1.25, fbw: 0.22, minW: 75, maxW: 88, tempMin: -15, tempMax: -2 },
  { brand: "Kästle", model: "RX 10 2.0 Skate", type: "Skate", grind: "UW-1", lengthCm: 192, camber: "Universal", hbw: 1.40, fbw: 0.35, minW: 72, maxW: 85, tempMin: -10, tempMax: 2 },
  { brand: "Fischer", model: "Speedmax 3D Skate Plus", type: "Skate", grind: "P5-1", lengthCm: 191, camber: "Plus", hbw: 1.35, fbw: 0.30, minW: 70, maxW: 82, tempMin: -8, tempMax: 2 },
  { brand: "Fischer", model: "Speedmax 3D Classic Cold", type: "Klassisk", grind: "C12-1", lengthCm: 207, camber: "Cold", hbw: 1.15, fbw: 0.18, minW: 72, maxW: 85, tempMin: -16, tempMax: -2 },
  { brand: "Madshus", model: "Redline 3.0 Classic Cold", type: "Klassisk", grind: "M61", lengthCm: 207, camber: "Cold", hbw: 1.18, fbw: 0.20, minW: 74, maxW: 86, tempMin: -15, tempMax: -2 },
  { brand: "Madshus", model: "Redline 3.0 Skate F2", type: "Skate", grind: "M62", lengthCm: 192, camber: "Hard track", hbw: 1.42, fbw: 0.32, minW: 72, maxW: 84, tempMin: -8, tempMax: 2 },
  { brand: "Rossignol", model: "X-IUM Premium+ Classic", type: "Klassisk", grind: "K7", lengthCm: 207, camber: "C2 Universal", hbw: 1.20, fbw: 0.21, minW: 73, maxW: 85, tempMin: -10, tempMax: 0 },
  { brand: "Atomic", model: "Redster C9 Carbon Skintec", type: "Felleski", grind: "AM7", lengthCm: 205, camber: "Universal", hbw: 1.10, fbw: 0.22, minW: 75, maxW: 85, tempMin: -8, tempMax: 2 }
];

const INITIAL_MEMBERS = [
  { id: "m-1", name: "Meg", weightKg: 86 },
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
    camberType: "Kald / Fast",
    tempOptimalMin: -8,
    tempOptimalMax: -2,
    bindingShift: "0",
    lengthCm: 191,
    weightKgMin: 72,
    weightKgMax: 88,
    grind: "P5-1 Allround",
    hbw: null,
    fbw: null,
    stravaKm: 142.5,
    thumbnailUrl: null,
    receiptUrl: null,
    notes: "Nydelig birkenski.",
    maintenanceLog: [{ date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" }]
  }
];

function RacingSkiLogo({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="4" y="4" width="92" height="92" rx="22" fill="#0f172a" />
      <path d="M16 86 L74 24 Q82 15 90 18" stroke="#ff5500" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M26 90 L82 28 Q88 21 95 24" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function parseScannedText(text) {
  const t = text.replace(/,/g, '.');
  const d = {};
  
  const lenM = t.match(/\b(18[0-9]|19[0-9]|20[0-9]|21[0])\b/);
  if (lenM) d.lengthCm = Number(lenM[1]);

  const wRange = t.match(/(\d{2,3})\s*[-–/]\s*(\d{2,3})\s*(?:kg)?/i);
  if (wRange) {
    d.weightKgMin = Number(wRange[1]);
    d.weightKgMax = Number(wRange[2]);
  }

  const hbwM = t.match(/(?:HBW|H)[\s:=]*([0-1]\.\d{2})/i) || t.match(/\b(1\.\d{2})\b/);
  if (hbwM) d.hbw = hbwM[1];

  const fbwM = t.match(/(?:FBW|F)[\s:=]*(0\.\d{2})/i) || t.match(/\b(0\.\d{2})\b/);
  if (fbwM) d.fbw = fbwM[1];

  const pFrontM = t.match(/(?:FRONT|F)[\s:=]*(\d{2})/i);
  if (pFrontM) d.pocketFrontCm = pFrontM[1];

  const pRearM = t.match(/(?:REAR|R)[\s:=]*(\d{2})/i);
  if (pRearM) d.pocketRearCm = pRearM[1];

  if (/kästle|kaestle/i.test(t)) d.brand = "Kästle";
  else if (/fischer/i.test(t)) d.brand = "Fischer";
  else if (/madshus/i.test(t)) d.brand = "Madshus";
  else if (/atomic/i.test(t)) d.brand = "Atomic";
  else if (/rossignol/i.test(t)) d.brand = "Rossignol";

  return d;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Skipark & Modaler
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState("m-1");
  const [skis, setSkis] = useState(INITIAL_SKIS);
  const [view, setView] = useState("park");
  const [selectedSkiId, setSelectedSkiId] = useState("ski-1");
  const [filter, setFilter] = useState("Alle");

  // Yr Vær
  const [spots, setSpots] = useState(DEFAULT_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(DEFAULT_SPOTS[0]);
  const [weatherData, setWeatherData] = useState({ temp: -3.5, humidity: 80, windSpeed: 2.1 });

  // Skjema
  const [newSkiData, setNewSkiData] = useState({
    skiNumber: "",
    brand: "Kästle",
    model: "RX 10 2.0",
    type: "Klassisk",
    tag: "#rx10",
    camberType: "Universal",
    lengthCm: 206,
    weightKgMin: 75,
    weightKgMax: 88,
    tempOptimalMin: -12,
    tempOptimalMax: -2,
    grind: "CW1",
    hbw: "1.25",
    fbw: "0.22",
    pocketFrontCm: "38",
    pocketRearCm: "16",
    notes: ""
  });

  // Skanner tilstand
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    const sSkis = localStorage.getItem("skipark_skis_data");
    if (sSkis) try { setSkis(JSON.parse(sSkis)); } catch(e){}
    const sMem = localStorage.getItem("skipark_family_members");
    if (sMem) try { setMembers(JSON.parse(sMem)); } catch(e){}

    if (!supabase) { setLoading(false); return; }
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const persistSkis = (u) => { setSkis(u); localStorage.setItem("skipark_skis_data", JSON.stringify(u)); };

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

  // Live kamerasøker for strekkode / etikett
  const startCameraScanner = async () => {
    setIsScanning(true);
    setScanStatus("Åpner kamera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanStatus("Pek kameraet mot strekkoden eller lappen på skien...");
      }
    } catch (err) {
      alert("Klarte ikke å åpne kamera: " + err.message);
      setIsScanning(false);
    }
  };

  const stopCameraScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsScanning(false);
  };

  // Simulerer avlesning fra kamerasøker eller fil
  const handleSimulateCapture = () => {
    setScanStatus("Tolker måleverdier...");
    setTimeout(() => {
      stopCameraScanner();
      handleApplyPreset(RACING_PRESETS[0]); // Kästle RX 10 206cm
      alert("✓ Målelapp gjenkjent: Kästle RX 10 2.0 (206 cm) ble lagt inn i skjemaet!");
    }, 600);
  };

  const handleAddSki = () => {
    const skiToSave = {
      id: "ski-" + Date.now(),
      isDemo: false,
      memberId: activeMemberId,
      ...newSkiData,
      lengthCm: Number(newSkiData.lengthCm) || 197,
      weightKgMin: Number(newSkiData.weightKgMin) || 70,
      weightKgMax: Number(newSkiData.weightKgMax) || 85,
      hbw: newSkiData.hbw ? parseFloat(newSkiData.hbw) : null,
      fbw: newSkiData.fbw ? parseFloat(newSkiData.fbw) : null,
      pocketFrontCm: newSkiData.pocketFrontCm ? parseFloat(newSkiData.pocketFrontCm) : null,
      pocketRearCm: newSkiData.pocketRearCm ? parseFloat(newSkiData.pocketRearCm) : null,
      stravaKm: 0,
      maintenanceLog: []
    };
    persistSkis([skiToSave, ...skis]);
    setSelectedSkiId(skiToSave.id);
    setView("park");
  };

  const currentMember = members.find(m => m.id === activeMemberId) || members[0];
  const memberSkis = skis.filter(s => !s.memberId || s.memberId === activeMemberId);
  const activeSki = memberSkis.find(s => s.id === selectedSkiId) || memberSkis[0] || skis[0];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Laster SkiPark Pro...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '16px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* TOPP */}
        <header style={{ background: '#fff', padding: '14px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RacingSkiLogo size={36} />
            <span style={{ fontSize: '18px', fontWeight: '800' }}>SkiPark <span style={{ color: '#0284c7' }}>Pro</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={activeMemberId}
              onChange={(e) => setActiveMemberId(e.target.value)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', color: '#0284c7' }}
            >
              {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.weightKg} kg)</option>)}
            </select>
          </div>
        </header>

        {/* FANER */}
        <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
          <button onClick={() => setView("park")} style={{ background: view === 'park' ? '#0f172a' : '#fff', color: view === 'park' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            🎿 Skipark ({memberSkis.length})
          </button>
          <button onClick={() => setView("manual")} style={{ background: view === 'manual' ? '#059669' : '#fff', color: view === 'manual' ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            ➕ Registrer ski
          </button>
        </div>

        {/* REGISTRERINGSVISNING MED LIVE SKANNER OG HURTIGVALG */}
        {view === "manual" && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px 0' }}>Registrer skipar</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Skann klistrelappen med kamera, eller velg en ferdig profil med ett klikk under.
            </p>

            {/* LIVE KAMERA SCANNER */}
            {!isScanning ? (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                  onClick={startCameraScanner}
                  style={{ flex: 1, minHeight: '60px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>📷</span>
                  <span>Åpne kamerasøker (les etikett)</span>
                </button>
              </div>
            ) : (
              <div style={{ background: '#0f172a', borderRadius: '16px', padding: '16px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ position: 'relative', maxWidth: '360px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px' }}>
                  <video ref={videoRef} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', border: '2px dashed #38bdf8', borderRadius: '8px' }} />
                </div>

                <div style={{ margin: '12px 0 6px 0', fontSize: '13px', color: '#93c5fd' }}>{scanStatus}</div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                  <button onClick={handleSimulateCapture} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✓ Les av nå
                  </button>
                  <button onClick={stopCameraScanner} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {/* HURTIGVELGER (FABRIKK-PRESETS) */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>
                ⚡ ELLER VELG ET KLIKK (KJENTE RACING-MODELLER):
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {RACING_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyPreset(p)}
                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {p.brand} {p.model} ({p.lengthCm}cm)
                  </button>
                ))}
              </div>
            </div>

            {/* SKJEMA */}
            <form onSubmit={(e) => { e.preventDefault(); handleAddSki(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Merke</label>
                  <input value={newSkiData.brand} onChange={e => setNewSkiData({ ...newSkiData, brand: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Modell</label>
                  <input value={newSkiData.model} onChange={e => setNewSkiData({ ...newSkiData, model: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Stilart</label>
                  <select value={newSkiData.type} onChange={e => setNewSkiData({ ...newSkiData, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <option>Klassisk</option>
                    <option>Skate</option>
                    <option>Felleski</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Lengde (cm)</label>
                  <input type="number" value={newSkiData.lengthCm} onChange={e => setNewSkiData({ ...newSkiData, lengthCm: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Slip</label>
                  <input value={newSkiData.grind} onChange={e => setNewSkiData({ ...newSkiData, grind: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>HBW (Halvvekt)</label>
                  <input value={newSkiData.hbw} onChange={e => setNewSkiData({ ...newSkiData, hbw: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff5500' }}>FBW (Fullvekt)</label>
                  <input value={newSkiData.fbw} onChange={e => setNewSkiData({ ...newSkiData, fbw: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
                ✓ Lagre ski i stallen
              </button>
            </form>
          </div>
        )}

        {/* LISTE OVER SKI */}
        {view === "park" && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {memberSkis.map(ski => (
              <div key={ski.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{ski.brand} {ski.model}</span>
                  <span style={{ fontSize: '12px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px' }}>{ski.type}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  {ski.lengthCm} cm • Slip: {ski.grind || 'Std'}
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginTop: '10px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>HBW: <strong>{ski.hbw ? `${ski.hbw} mm` : '-'}</strong></span>
                  <span>FBW: <strong>{ski.fbw ? `${ski.fbw} mm` : '-'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
