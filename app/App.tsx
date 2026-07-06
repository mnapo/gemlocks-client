import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import RootNavigator from "./navigation/RootNavigator";
import { StatusBar } from 'expo-status-bar';
import { useFonts, Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';

function AppContent() {
  const { palette } = useSettings();

  return (
    <>
      <StatusBar style={palette.background === '#f4f7fb' ? 'dark' : 'light'} backgroundColor={palette.background} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
  });
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </SettingsProvider>
    </AuthProvider>
  );
}