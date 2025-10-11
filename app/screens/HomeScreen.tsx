import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email}</Text>
      <Button title="Search Match" onPress={() => navigation.navigate("Game")} />
      <Button title="Settings" onPress={() => navigation.navigate("Settings")} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  title: { fontSize: 24, marginBottom: 20 },
});