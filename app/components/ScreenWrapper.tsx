import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import colors from "../theme/colors";

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
});