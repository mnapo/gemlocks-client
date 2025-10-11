import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import ScreenWrapper from "../components/ScreenWrapper";
import colors from "../theme/colors";

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Welcome, {user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Match")}>
        <Text style={styles.buttonText}>🎮 New Match</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Instructions")}>
        <Text style={styles.buttonText}>📘 How to Play</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.buttonText}>⚙️ Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Exit</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "600", color: colors.primary, marginBottom: 40, textAlign: "center" },
  button: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: colors.text, fontSize: 18 },
  logout: { marginTop: 40, alignSelf: "center" },
  logoutText: { color: colors.dimmed },
});