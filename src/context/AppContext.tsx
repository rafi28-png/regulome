/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { AppMode, DemoPersona } from '@/types';
import { AUTH_TOKEN_STORAGE_KEY, MODE_STORAGE_KEY, PERSONA_STORAGE_KEY, readStorageItem, writeStorageItem } from '@/lib/storage';
import { clearUploadedGenomicVariants } from '@/hooks/useRegulatoryProfile';

/** Separate key to persist the last-used demo persona even while in real mode. */
const LAST_DEMO_PERSONA_KEY = 'regulome:last-demo-persona';
const USER_NAME_KEY = 'regulome:user-name';
const USER_EMAIL_KEY = 'regulome:user-email';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  currentPersona: DemoPersona | null;
  setCurrentPersona: (persona: DemoPersona | null) => void;

  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;

  /** Logged-in user identity (available in real mode) */
  userName: string | null;
  userEmail: string | null;
  setUserIdentity: (name: string, email: string) => void;
  clearUserIdentity: () => void;

  /** Track if the user has uploaded/analyzed data in Real Mode */
  hasUploadedData: boolean;
  setHasUploadedData: (hasData: boolean) => void;
  clearUploadedData: () => void;

  /** Sign out: clears all auth state and returns to demo mode */
  logout: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultPersona: DemoPersona = {
  id: 'inflammatory-immune',
  name: 'Alex Rivera',
  label: 'Inflammatory Immune-Skewed',
  description: 'Profile with elevated inflammatory and immune dysregulation markers across multiple regulatory networks.',
  profileType: 'inflammatory',
  age: 38,
  genomeBuild: 'GRCh38',
  variantCount: 2847,
  color: '#ef4444',
  icon: 'DNA',
};

function readStoredMode(): AppMode {
  const storedMode = readStorageItem(MODE_STORAGE_KEY);
  return storedMode === 'real' || storedMode === 'demo' ? storedMode : 'demo';
}

function parseStoredPersona(raw: string | null): DemoPersona | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    // Guard: must be an object with an `id` string field (not a bare persona ID string)
    if (parsed && typeof parsed === 'object' && 'id' in parsed && typeof (parsed as Record<string, unknown>).id === 'string') {
      return parsed as DemoPersona;
    }
    return null;
  } catch {
    return null;
  }
}

function readStoredPersona(): DemoPersona | null {
  // Try the active persona key first, then fall back to the last-used demo persona
  const active = parseStoredPersona(readStorageItem(PERSONA_STORAGE_KEY));
  if (active) return active;
  const last = parseStoredPersona(readStorageItem(LAST_DEMO_PERSONA_KEY));
  if (last) return last;
  // Clear any stale non-parseable value
  writeStorageItem(PERSONA_STORAGE_KEY, null);
  return defaultPersona;
}

function readStoredAuthState() {
  return Boolean(readStorageItem(AUTH_TOKEN_STORAGE_KEY));
}

function writeStoredMode(mode: AppMode) {
  writeStorageItem(MODE_STORAGE_KEY, mode);
}

function writeStoredPersona(persona: DemoPersona | null) {
  writeStorageItem(PERSONA_STORAGE_KEY, persona ? JSON.stringify(persona) : null);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => readStoredMode());
  // Always load a persona — real mode uses it as seed data for charts/tables
  const [currentPersona, setCurrentPersonaState] = useState<DemoPersona | null>(() => readStoredPersona());
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => readStoredAuthState());
  const [userName, setUserNameState] = useState<string | null>(() => readStorageItem(USER_NAME_KEY));
  const [userEmail, setUserEmailState] = useState<string | null>(() => readStorageItem(USER_EMAIL_KEY));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Tracks the last explicitly selected demo persona so toggling REAL↔DEMO restores it
  const lastDemoPersonaRef = useRef<DemoPersona | null>(
    parseStoredPersona(readStorageItem(LAST_DEMO_PERSONA_KEY)) ??
    parseStoredPersona(readStorageItem(PERSONA_STORAGE_KEY)) ??
    defaultPersona
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const setUserIdentity = useCallback((name: string, email: string) => {
    setUserNameState(name);
    setUserEmailState(email);
    writeStorageItem(USER_NAME_KEY, name);
    writeStorageItem(USER_EMAIL_KEY, email);
  }, []);

  const clearUserIdentity = useCallback(() => {
    setUserNameState(null);
    setUserEmailState(null);
    writeStorageItem(USER_NAME_KEY, null);
    writeStorageItem(USER_EMAIL_KEY, null);
  }, []);

  const [hasUploadedData, setHasUploadedDataState] = useState<boolean>(() => {
    return readStorageItem('regulome:has-uploaded-data') === 'true';
  });

  const setHasUploadedData = useCallback((hasData: boolean) => {
    setHasUploadedDataState(hasData);
    writeStorageItem('regulome:has-uploaded-data', hasData ? 'true' : 'false');
  }, []);

  const clearUploadedData = useCallback(() => {
    setHasUploadedDataState(false);
    writeStorageItem('regulome:has-uploaded-data', 'false');
    clearUploadedGenomicVariants();
  }, []);

  const setMode = useCallback((nextMode: AppMode) => {
    setModeState(nextMode);
    writeStoredMode(nextMode);
    if (nextMode === 'demo') {
      // Restore the last explicitly chosen demo persona
      const restoredPersona = lastDemoPersonaRef.current ?? defaultPersona;
      writeStoredPersona(restoredPersona);
      setCurrentPersonaState(restoredPersona);
    } else {
      // Switch to real mode: KEEP persona as seed data for charts/tables
      // The persona is just data — the user's real identity is in userName/userEmail
      const keepPersona = currentPersona ?? lastDemoPersonaRef.current ?? defaultPersona;
      writeStoredPersona(keepPersona);
      setCurrentPersonaState(keepPersona);
    }
  }, [currentPersona]);

  const setCurrentPersona = useCallback((persona: DemoPersona | null) => {
    setCurrentPersonaState(persona);
    writeStoredPersona(persona);
    if (persona) {
      // Persist as the last-used demo persona for restoration on mode toggle
      lastDemoPersonaRef.current = persona;
      writeStorageItem(LAST_DEMO_PERSONA_KEY, JSON.stringify(persona));
    }
  }, []);

  const setIsAuthenticated = useCallback((auth: boolean) => {
    setIsAuthenticatedState(auth);
  }, []);

  /** Full logout: clear all auth state, return to demo mode */
  const logout = useCallback(() => {
    // Clear auth token
    writeStorageItem(AUTH_TOKEN_STORAGE_KEY, null);
    setIsAuthenticatedState(false);
    // Clear user identity
    setUserNameState(null);
    setUserEmailState(null);
    writeStorageItem(USER_NAME_KEY, null);
    writeStorageItem(USER_EMAIL_KEY, null);
    // Clear upload data flag & uploaded genomic variants
    setHasUploadedDataState(false);
    writeStorageItem('regulome:has-uploaded-data', 'false');
    clearUploadedGenomicVariants();
    // Return to demo mode
    setModeState('demo');
    writeStoredMode('demo');
    // Restore demo persona
    const restoredPersona = lastDemoPersonaRef.current ?? defaultPersona;
    writeStoredPersona(restoredPersona);
    setCurrentPersonaState(restoredPersona);
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        currentPersona,
        setCurrentPersona,
        isAuthenticated,
        setIsAuthenticated,
        userName,
        userEmail,
        setUserIdentity,
        clearUserIdentity,
        hasUploadedData,
        setHasUploadedData,
        clearUploadedData,
        logout,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

/** Alias for useApp — used by spec components */
export const useAppContext = useApp;
