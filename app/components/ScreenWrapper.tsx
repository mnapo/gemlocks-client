import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';

export interface ScreenWrapperProps {
  children: ReactNode;
  title?: string;
  centered?: boolean;
  scrollable?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  title,
  centered = false,
  scrollable = false,
}) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe}>
      <Container
        style={[styles.container, centered && styles.centeredContainer]}
        contentContainerStyle={scrollable ? [styles.container, centered && styles.centered] : undefined}
      >
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    padding: 20,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
});