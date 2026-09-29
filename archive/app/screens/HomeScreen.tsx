import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NeonButton } from '../components/NeonButton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withRepeat,
  interpolateColor,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const glow = useSharedValue(0);
  const panelOpacity = useSharedValue(0);
  const panelTranslateY = useSharedValue(-20);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    panelOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    panelTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [glow, panelOpacity, panelTranslateY]);

  const titleStyle = useAnimatedStyle(() => {
    const color = interpolateColor(glow.value, [0, 1], ['#86f0ff', '#f9d976']);
    return {
      color,
      textShadowColor: 'rgba(255,255,255,0.08)',
      textShadowRadius: 6,
      textShadowOffset: { width: 0, height: 1 },
    };
  });

  const panelStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(glow.value, [0, 1], ['rgba(255,255,255,0.12)', 'rgba(129, 238, 255, 0.18)']);
    return {
      borderColor,
      shadowColor: borderColor,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      opacity: panelOpacity.value,
      transform: [{ translateY: panelTranslateY.value }],
    };
  });

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.screenContent}>
        <View style={styles.background}>
          <View style={styles.gradientOverlay} />
          <View style={styles.gradientOverlaySecondary} />
          <View style={styles.orb} />
          <View style={[styles.orb, styles.orbSecondary]} />

          <Animated.View style={[styles.panel, panelStyle]}>
          <View style={styles.accentLine} />
          <View style={styles.titleContainer}>
            <Animated.Text style={[styles.title, titleStyle]}>Gemlocks</Animated.Text>
            <Text style={styles.subtitle}>Prototipo #1</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <NeonButton title="Partida demo" onPress={() => navigation.navigate('DemoMatch')} />
            <NeonButton
              title="Configuración"
              onPress={() => navigation.navigate('DemoSettings')}
              color={theme.colors.secondary}
              variant="secondary"
            />
          </View>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04070f',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050913',
    opacity: 1,
  },
  gradientOverlaySecondary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0b1830',
    opacity: 0.8,
    transform: [{ skewX: '-18deg' }],
  },
  orb: {
    position: 'absolute',
    top: '11%',
    left: '10%',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(96, 219, 255, 0.1)',
  },
  orbSecondary: {
    top: '70%',
    left: '60%',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(249, 217, 118, 0.08)',
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(8, 14, 28, 0.95)',
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  accentLine: {
    width: 48,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(134, 240, 255, 0.8)',
    marginBottom: 18,
    alignSelf: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
    zIndex: 2,
  },
});
