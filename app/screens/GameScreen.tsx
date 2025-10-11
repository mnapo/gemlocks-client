import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function GameScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match in progress</Text>
      <Button title="Back to lobby" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20 },
});