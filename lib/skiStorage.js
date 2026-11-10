import fs from 'fs';
import path from 'path';

// Memory cache på globalThis slik at den overlever mellom API-kall under samme prosess
if (!global._sharedSkisStore) {
  global._sharedSkisStore = new Map();
}

const STORE_FILE = path.join('/tmp', 'skipark_shared_skis.json');

// Initialiser standard skis slik at ski-1 og ski-2 alltid finnes
const DEFAULT_SKIS = [
  {
    id: "ski-1",
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
    pocketFrontCm: 32,
    pocketRearCm: 18,
    stravaKm: 142.5,
    notes: "Stabil og god birkenski. P5-1 slip som går spesielt godt i faste, kalde spor.",
    transferActive: false,
    transferCode: null,
    maintenanceLog: [
      { date: "2025-01-15", title: "Mettet med Swix Marathon", type: "Glid" }
    ]
  },
  {
    id: "ski-2",
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
    notes: "Tørrvoksski med fantastisk slipp og sikkert feste. Godt egnet for -2°C til -12°C.",
    transferActive: false,
    transferCode: null,
    maintenanceLog: [
      { date: "2025-02-02", title: "Rode B17 + Swix VP45", type: "Feste" }
    ]
  }
];

function loadFromFile() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(ski => {
          if (ski && ski.id) global._sharedSkisStore.set(ski.id, ski);
        });
      }
    }
  } catch (err) {
    // ignoreres dersom /tmp ikke er tilgjengelig
  }

  // Legg inn defaults hvis de mangler
  DEFAULT_SKIS.forEach(ski => {
    if (!global._sharedSkisStore.has(ski.id)) {
      global._sharedSkisStore.set(ski.id, ski);
    }
  });
}

function persistToFile() {
  try {
    const list = Array.from(global._sharedSkisStore.values());
    fs.writeFileSync(STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {}
}

// Initial last
loadFromFile();

export function getSharedSki(id) {
  loadFromFile();
  return global._sharedSkisStore.get(id) || null;
}

export function saveSharedSki(skiData) {
  if (!skiData || !skiData.id) return null;
  loadFromFile();
  const existing = global._sharedSkisStore.get(skiData.id) || {};
  const updated = {
    ...existing,
    ...skiData,
    updatedAt: new Date().toISOString()
  };
  global._sharedSkisStore.set(skiData.id, updated);
  persistToFile();
  return updated;
}

export function setTransferStatus(id, active, code = null) {
  loadFromFile();
  const ski = global._sharedSkisStore.get(id);
  if (!ski) return null;

  ski.transferActive = Boolean(active);
  ski.transferCode = active ? (code || String(Math.floor(1000 + Math.random() * 9000))) : null;
  ski.transferUpdatedAt = new Date().toISOString();

  global._sharedSkisStore.set(id, ski);
  persistToFile();
  return {
    transferActive: ski.transferActive,
    transferCode: ski.transferCode
  };
}

export function claimSkiWithCode(id, code) {
  loadFromFile();
  const ski = global._sharedSkisStore.get(id);
  if (!ski) {
    return { success: false, error: "Fant ikke skiparet." };
  }

  if (!ski.transferActive) {
    return { success: false, error: "Eier har ikke aktivert overføring for dette paret ennå." };
  }

  const cleanProvided = String(code || "").trim();
  const cleanExpected = String(ski.transferCode || "").trim();

  if (!cleanProvided || cleanProvided !== cleanExpected) {
    return { success: false, error: "Ugyldig overføringskode. Sjekk koden du fikk fra selger." };
  }

  // Overføring godkjent! Nullstill overføringskoden slik at den ikke kan gjenbrukes
  ski.transferActive = false;
  ski.transferCode = null;
  ski.transferredAt = new Date().toISOString();

  global._sharedSkisStore.set(id, ski);
  persistToFile();

  return {
    success: true,
    ski: ski
  };
}
