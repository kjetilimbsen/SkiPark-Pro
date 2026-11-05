'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Oppretter kun klienten hvis nøklene er til stede under kjøring
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [envMissing, setEnvMissing] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setEnvMissing(true);
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        Laster SkiPark Pro...
      </div>
    );
  }

  if (envMissing) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0f172a', border: '1px solid #ef4444', padding: '24px', borderRadius: '16px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#f87171' }}>Mangler miljøvariabler i Vercel</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Appen er bygget og kjører, men mangler <code>NEXT_PUBLIC_SUPABASE_URL</code> og <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> i Vercel Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>⛷️</div>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SkiPark Pro</h1>

        {!user ? (
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              Logg inn med Google for å se og administrere skiparken din
            </p>
            <button
              onClick={handleGoogleLogin}
              style={{ width: '100%', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              Fortsett med Google
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#38bdf8', fontSize: '14px', marginBottom: '4px' }}>Innlogget som:</p>
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>{user.user_metadata?.full_name || user.email}</p>
            <button
              onClick={handleLogout}
              style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
            >
              Logg ut
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
