import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemeMode = 'dark' | 'light';
type Language = 'es' | 'en';

interface SettingsContextValue {
  themeMode: ThemeMode;
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  palette: {
    background: string;
    panel: string;
    panelBorder: string;
    primary: string;
    secondary: string;
    text: string;
    textDim: string;
    accent: string;
    accentSoft: string;
  };
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const darkPalette = {
  background: '#04070f',
  panel: 'rgba(8, 14, 28, 0.95)',
  panelBorder: 'rgba(255,255,255,0.16)',
  primary: '#00e0ff',
  secondary: '#f7c948',
  text: '#ffffff',
  textDim: 'rgba(255,255,255,0.68)',
  accent: '#86f0ff',
  accentSoft: 'rgba(134, 240, 255, 0.8)',
};

const lightPalette = {
  background: '#f4f7fb',
  panel: 'rgba(255,255,255,0.95)',
  panelBorder: 'rgba(15, 23, 42, 0.15)',
  primary: '#0f766e',
  secondary: '#b45309',
  text: '#0f172a',
  textDim: '#475569',
  accent: '#0f766e',
  accentSoft: '#14b8a6',
};

const translations = {
  es: {
    homeTitle: 'Gemlocks',
    homeSubtitle: 'Prototipo #1',
    homeDemoButton: 'Partida demo',
    homeSettingsButton: 'Configuración',
    demoSettingsTitle: 'Demo Settings',
    demoSettingsName: 'Nombre',
    demoSettingsNamePlaceholder: 'Ingresa tu nombre',
    demoSettingsTokenSet: 'Fichas',
    demoSettingsTokenCount: 'Cantidad',
    demoSettingsBack: 'Volver al inicio',
    settingsTitle: 'Settings',
    settingsSounds: 'Sonidos',
    settingsVibration: 'Vibración',
    settingsDarkMode: 'Modo oscuro',
    settingsLanguage: 'Idioma',
    settingsBack: 'Volver al lobby',
    settingsThemeLabel: 'Modo',
    settingsThemeDark: 'Oscuro',
    settingsThemeLight: 'Claro',
    settingsLangLabel: 'Idioma',
    settingsLangEs: 'Español',
    settingsLangEn: 'Inglés',
    matchTitle: 'Partida',
    matchTurn: 'Tu turno',
    matchTry: 'Probar',
    matchHelp: 'Ayuda',
    matchBack: 'Volver al lobby',
    instructionsTitle: 'Instrucciones',
    instructionsBack: 'Volver al lobby',
    loginTitle: 'Gemlocks',
    loginEmail: 'Email',
    loginPassword: 'Contraseña',
    loginButton: 'Ingresar',
    signupButton: 'Crear cuenta',
    signupTitle: 'Crear cuenta',
    signupBack: 'Volver al login',
  },
  en: {
    homeTitle: 'Gemlocks',
    homeSubtitle: 'Prototype #1',
    homeDemoButton: 'Demo match',
    homeSettingsButton: 'Settings',
    demoSettingsTitle: 'Demo Settings',
    demoSettingsName: 'Name',
    demoSettingsNamePlaceholder: 'Enter your name',
    demoSettingsTokenSet: 'Tokens',
    demoSettingsTokenCount: 'Amount',
    demoSettingsBack: 'Back to home',
    settingsTitle: 'Settings',
    settingsSounds: 'Sounds',
    settingsVibration: 'Vibration',
    settingsDarkMode: 'Dark mode',
    settingsLanguage: 'Language',
    settingsBack: 'Back to lobby',
    settingsThemeLabel: 'Mode',
    settingsThemeDark: 'Dark',
    settingsThemeLight: 'Light',
    settingsLangLabel: 'Language',
    settingsLangEs: 'Spanish',
    settingsLangEn: 'English',
    matchTitle: 'Match',
    matchTurn: 'Your turn',
    matchTry: 'Try',
    matchHelp: 'Help',
    matchBack: 'Back to lobby',
    instructionsTitle: 'Instructions',
    instructionsBack: 'Back to lobby',
    loginTitle: 'Gemlocks',
    loginEmail: 'Email',
    loginPassword: 'Password',
    loginButton: 'Log in',
    signupButton: 'Create account',
    signupTitle: 'Create account',
    signupBack: 'Back to login',
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [language, setLanguage] = useState<Language>('es');

  const palette = useMemo(() => (themeMode === 'dark' ? darkPalette : lightPalette), [themeMode]);

  const t = (key: string) => translations[language][key as keyof (typeof translations)['es']] ?? key;

  const value = useMemo<SettingsContextValue>(
    () => ({
      themeMode,
      language,
      setThemeMode,
      setLanguage,
      palette,
      t,
    }),
    [themeMode, language, palette]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
