'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicSkiPage() {
  const params = useParams();
  const router = useRouter();
  const skiId = params?.id;

  const [ski, setSki] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Eierskifte / Overtakelse
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!skiId) return;

    async function loadSki() {
      setLoading(true);
      setError(null);
      try {
        // Hent fra API (med eventuell query param hvis tilstede i url)
        const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
        const dParam = currentUrl ? currentUrl.searchParams.get('d') : null;
        let apiUrl = `/api/ski/${encodeURIComponent(skiId)}`;
        if (dParam) apiUrl += `?d=${encodeURIComponent(dParam)}`;

        const res = await fetch(apiUrl);
        if (!res.ok) {
          // Prøv fallback fra lokal localStorage hvis vi er på samme enhet
          if (typeof window !== 'undefined') {
            const localSkis = localStorage.getItem("skipark_skis_data");
            if (localSkis) {
              const parsed = JSON.parse(localSkis);
              const found = parsed.find(s => s.id === skiId);
              if (found) {
                setSki(found);
                setLoading(false);
                return;
              }
            }
          }
          throw new Error("Fant ikke dette skiparet. Kontroller lenken.");
        }
        const data = await res.json();
        setSki(data.ski);
      } catch (err) {
        setError(err.message || "Kunne ikke laste skikortet");
      } finally {
        setLoading(false);
      }
    }

    loadSki();
  }, [skiId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleClaimSki = async (e) => {
    e.preventDefault();
    if (!claimCode.trim()) {
      alert("Vennligst skriv inn den 4-sifrede koden du fikk fra selger.");
      return;
    }

    setClaimLoading(true);
    try {
      const res = await fetch('/api/ski/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skiId: ski.id,
          code: claimCode.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Overføringen feilet. Sjekk koden.");
      }

      // 1. Lagre skien i mottakerens lokale stall i localStorage
      if (typeof window !== 'undefined') {
        const existingSkisRaw = localStorage.getItem("skipark_skis_data");
        let existingSkis = [];
        if (existingSkisRaw) {
          try { existingSkis = JSON.parse(existingSkisRaw); } catch(e) {}
        }

        const claimedSki = {
          ...data.ski,
          id: data.ski.id || ("ski-" + Date.now()),
          isDemo: false,
          transferActive: false,
          transferCode: null,
          maintenanceLog: [
            {
              date: new Date().toISOString().split("T")[0],
              title: "Eierskifte: Overtatt via SkiPark Pro digitalt skikort",
              type: "Overtakelse"
            },
            ...(data.ski.maintenanceLog || [])
          ]
        };

        // Fjern eventuell eksisterende med samme ID og legg til den nye
        const updatedSkis = [claimedSki, ...existingSkis.filter(s => s.id !== claimedSki.id)];
        localStorage.setItem("skipark_skis_data", JSON.stringify(updatedSkis));
      }

      setClaimSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '36px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎿</div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Laster digitalt skikort...</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Henter spennverdier og Skiselector-data</p>
        </div>
      </div>
    );
  }

  if (error || !ski) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '520px', margin: '40px auto', background: '#fff', padding: '36px', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🔍</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Fant ikke skiparet</h2>
          <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>{error || "Skikortet kan ha blitt slettet eller lenken er feil."}</p>
          <Link
            href="/"
            style={{ background: '#0284c7', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', display: 'inline-block', fontSize: '14px' }}
          >
            ← Gå til SkiPark Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* TOPP-BAR */}
        <header style={{ background: '#ffffff', borderRadius: '20px', padding: '14px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🎿</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Digitalt Skikort & Spesifikasjoner</div>
              <h1 style={{ fontSize: '17px', fontWeight: '900', margin: 0, color: '#0f172a' }}>SkiPark <span style={{ color: '#0284c7' }}>Pro</span></h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleCopyLink}
              style={{ background: copiedLink ? '#dcfce7' : '#f1f5f9', color: copiedLink ? '#15803d' : '#334155', border: '1px solid ' + (copiedLink ? '#86efac' : '#cbd5e1'), padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{copiedLink ? '✓' : '🔗'}</span>
              <span>{copiedLink ? 'Lenke kopiert!' : 'Kopier delingslenke'}</span>
            </button>
            <Link
              href="/"
              style={{ background: '#0284c7', color: '#ffffff', textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
            >
              Åpne SkiPark Pro →
            </Link>
          </div>
        </header>

        {/* HOVEDKORT MED SKI-INFO */}
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ background: '#0f172a', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontWeight: '900', fontSize: '14px', letterSpacing: '0.04em' }}>
                  {ski.skiNumber || '#01'}
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                  {ski.brand} {ski.model}
                </h2>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#64748b', fontWeight: '600' }}>
                {ski.type} • {ski.lengthCm} cm • Spennprofil: {ski.camberType || 'Universal'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>Anbefalt løpervekt</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7' }}>
                  {ski.weightKgMin} – {ski.weightKgMax} kg
                </div>
              </div>
            </div>
          </div>

          {/* SPESIFIKASJONSGRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>HBW (HALVVEKT)</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{ski.hbw ? `${ski.hbw} mm` : 'Ikke målt'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Stakestilling / Glid</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>FBW (FULLVEKT)</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ea580c' }}>{ski.fbw ? `${ski.fbw} mm` : 'Ikke målt'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Fraspark / Feste</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>SLIP / STRUKTUR</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{ski.grind || 'Standard'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Strukturtype</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>SMØRELOMME</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>
                +{ski.pocketFrontCm || 30} / -{ski.pocketRearCm || 15} cm
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Fra balansepunkt</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>OPTIMAL TEMPERATUR</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                {ski.tempOptimalMin}°C til {ski.tempOptimalMax}°C
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Føreområde</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '4px' }}>STRAVA DISTANSE</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#fc4c02' }}>{ski.stravaKm ? `${ski.stravaKm} km` : '0 km'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Loggført løpslengde</div>
            </div>
          </div>

          {/* SPENNPROFIL KURVE */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>📈 Skiselector spennkurve</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Lengde: {ski.lengthCm} cm</div>
            </div>
            <svg viewBox="0 0 800 130" style={{ width: '100%', height: '110px' }}>
              <line x1="20" y1="105" x2="780" y2="105" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4" />
              {ski.hbw && <path d="M 60 102 Q 400 24 740 102" fill="none" stroke="#0284c7" strokeWidth="4" />}
              {ski.fbw && <path d="M 120 104 Q 400 80 680 104" fill="none" stroke="#ea580c" strokeWidth="3" />}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', paddingTop: '10px', fontSize: '12px', fontWeight: '700' }}>
              <span style={{ color: '#0284c7' }}>● HBW (Halvvekt / Staking): {ski.hbw || '-'} mm</span>
              <span style={{ color: '#ea580c' }}>● FBW (Fullvekt / Tråkk): {ski.fbw || '-'} mm</span>
            </div>
          </div>

          {/* NOTATER / KOMMENTAR FRA EIER */}
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#92400e', marginBottom: '6px' }}>
              <span>📝</span>
              <span>KOMMENTAR / NOTATER / TILSTAND</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {ski.notes || "Ingen spesifikke notater registrert for dette paret."}
            </p>
          </div>

          {/* VEDLIKEHOLDS- OG SMØRELOGG */}
          {(ski.maintenanceLog || []).length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                🔧 Registrert vedlikeholds- og smørehistorikk
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(ski.maintenanceLog || []).slice(0, 6).map((log, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600' }}>{log.title}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIKKER OVERFØRING AV EIERSKAP / IMPORT SEKSJON */}
          <div style={{ background: ski.transferActive ? '#f0fdf4' : '#f8fafc', border: '2px solid ' + (ski.transferActive ? '#86efac' : '#e2e8f0'), borderRadius: '20px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{ski.transferActive ? '🎉' : '🔒'}</span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: ski.transferActive ? '#166534' : '#0f172a' }}>
                    {ski.transferActive ? 'Klar for eierskifte / import' : 'Sikker overføring av eierskap'}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: ski.transferActive ? '#15803d' : '#64748b', lineHeight: 1.5, maxWidth: '480px' }}>
                  {ski.transferActive
                    ? 'Selger har aktivert overføring for dette paret. Trykk på knappen til høyre og tast inn den 4-sifrede koden du fikk fra selger for å importere paret inn i din egen stall.'
                    : 'Dette paret er registrert i en stall. For å forhindre uautorisert overføring må selger først aktivere overføring fra sin SkiPark Pro-konto og oppgi en engangskode til kjøper.'}
                </p>
              </div>

              {ski.transferActive && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                >
                  <span>🔑</span>
                  <span>Overta / Importer ski nå</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* MODAL FOR Å TASTE INN OVERFØRINGSKODE */}
        {showClaimModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1.5px solid #bbf7d0' }}>
              
              {!claimSuccess ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>🔑</span>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#166534' }}>
                        Bekreft overtagelse av ski
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowClaimModal(false)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', fontSize: '15px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    Oppgi den <strong>4-sifrede overføringskoden</strong> du har mottatt fra selger for å overføre <strong>{ski.brand} {ski.model}</strong> ({ski.skiNumber}) til din egen skipark.
                  </p>

                  <form onSubmit={handleClaimSki} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                        Overføringskode (PIN fra selger)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="F.eks. 4829"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '2px solid #86efac', fontSize: '20px', fontWeight: '900', textAlign: 'center', letterSpacing: '0.2em', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="submit"
                        disabled={claimLoading}
                        style={{ flex: 1, background: '#16a34a', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: claimLoading ? 'wait' : 'pointer' }}
                      >
                        {claimLoading ? 'Verifiserer kode...' : '✓ Fullfør eierskifte'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClaimModal(false)}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '14px 18px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Avbryt
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: '#166534' }}>Gratulerer med nytt skipar!</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569' }}>
                    <strong>{ski.brand} {ski.model}</strong> er nå lagt til i din stall i SkiPark Pro med full målehistorikk.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', width: '100%' }}
                  >
                    Åpne min skipark nå →
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
