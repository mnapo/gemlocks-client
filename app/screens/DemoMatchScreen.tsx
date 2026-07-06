import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSettings } from '../context/SettingsContext';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type DemoPhaseKey = 'codeSelection' | 'playerTurn' | 'enemyTurn' | 'final';

type DemoPhase = {
  key: DemoPhaseKey;
  title: string;
  subtitle: string;
  hint: string;
};

const phaseOrder: DemoPhase[] = [
  {
    key: 'codeSelection',
    title: 'Elección de código',
    subtitle: 'Define el patrón inicial.',
    hint: 'Esta fase es única y marca el comienzo de la partida.',
  },
  {
    key: 'playerTurn',
    title: 'Turno del jugador',
    subtitle: 'Tu oportunidad de actuar.',
    hint: 'Aquí se mostrará el contenido del turno del jugador.',
  },
  {
    key: 'enemyTurn',
    title: 'Turno del enemigo',
    subtitle: 'El rival responde.',
    hint: 'Aquí se mostrará la respuesta automática del enemigo.',
  },
  {
    key: 'final',
    title: 'Final',
    subtitle: 'Se revela el resultado.',
    hint: 'Aquí se mostrará el ganador y el cierre de la demo.',
  },
];

export default function DemoMatchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette, t } = useSettings();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [pendingPhaseIndex, setPendingPhaseIndex] = useState<number | null>(null);

  const introOpacity = useSharedValue(0);
  const introTranslateY = useSharedValue(-24);
  const outgoingOpacity = useSharedValue(1);
  const outgoingTranslateX = useSharedValue(0);
  const incomingOpacity = useSharedValue(0);
  const incomingTranslateX = useSharedValue(24);

  useEffect(() => {
    introOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    introTranslateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [introOpacity, introTranslateY]);

  const activePhase = phaseOrder[phaseIndex];
  const pendingPhase = pendingPhaseIndex !== null ? phaseOrder[pendingPhaseIndex] : null;

  const handleNext = () => {
    if (transitioning || phaseIndex >= phaseOrder.length - 1) {
      return;
    }

    const nextIndex = phaseIndex + 1;
    setPendingPhaseIndex(nextIndex);
    setTransitioning(true);

    outgoingOpacity.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    outgoingTranslateX.value = withTiming(-28, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    incomingOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    incomingTranslateX.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    setTimeout(() => {
      setPhaseIndex(nextIndex);
      setPendingPhaseIndex(null);
      setTransitioning(false);
      outgoingOpacity.value = 1;
      outgoingTranslateX.value = 0;
      incomingOpacity.value = 0;
      incomingTranslateX.value = 24;
    }, 800);
  };

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const introStyle = useAnimatedStyle(() => ({
    opacity: introOpacity.value,
    transform: [{ translateY: introTranslateY.value }],
  }));

  const outgoingStyle = useAnimatedStyle(() => ({
    opacity: outgoingOpacity.value,
    transform: [{ translateX: outgoingTranslateX.value }],
  }));

  const incomingStyle = useAnimatedStyle(() => ({
    opacity: incomingOpacity.value,
    transform: [{ translateX: incomingTranslateX.value }],
  }));

  const content = useMemo(() => {
    return (
      <View style={styles.innerCard}>
        <View style={styles.phaseHeader}>
          <Text style={[styles.phaseLabel, { color: palette.primary }]}>Demo</Text>
          <Text style={[styles.phaseTitle, { color: palette.text }]}>{activePhase.title}</Text>
        </View>

        <Text style={[styles.phaseSubtitle, { color: palette.textDim }]}>{activePhase.subtitle}</Text>
        <Text style={[styles.phaseHint, { color: palette.text }]}>{activePhase.hint}</Text>

        <View style={[styles.placeholderBox, { borderColor: palette.panelBorder }]}> 
          <Text style={[styles.placeholderText, { color: palette.textDim }]}>Contenido de fase placeholder</Text>
          <Text style={[styles.placeholderText, { color: palette.textDim }]}>Aquí luego irá el contenido real de esta etapa.</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: palette.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, { color: palette.background }]}>
            {phaseIndex === phaseOrder.length - 1 ? 'Volver al inicio' : 'Siguiente fase'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [activePhase, handleNext, palette, phaseIndex]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}> 
      <View style={styles.screenContent}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={[styles.exitText, { color: palette.text }]}>✕</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.container, introStyle]}>
          {transitioning && pendingPhase ? (
            <>
              <Animated.View style={[styles.phaseCard, outgoingStyle]}>
                <View style={styles.innerCard}>
                  <View style={styles.phaseHeader}>
                    <Text style={[styles.phaseLabel, { color: palette.primary }]}>Demo</Text>
                    <Text style={[styles.phaseTitle, { color: palette.text }]}>{activePhase.title}</Text>
                  </View>
                  <Text style={[styles.phaseSubtitle, { color: palette.textDim }]}>{activePhase.subtitle}</Text>
                  <Text style={[styles.phaseHint, { color: palette.text }]}>{activePhase.hint}</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.phaseCard, incomingStyle]}>
                <View style={styles.innerCard}>
                  <View style={styles.phaseHeader}>
                    <Text style={[styles.phaseLabel, { color: palette.primary }]}>Demo</Text>
                    <Text style={[styles.phaseTitle, { color: palette.text }]}>{pendingPhase.title}</Text>
                  </View>
                  <Text style={[styles.phaseSubtitle, { color: palette.textDim }]}>{pendingPhase.subtitle}</Text>
                  <Text style={[styles.phaseHint, { color: palette.text }]}>{pendingPhase.hint}</Text>
                </View>
              </Animated.View>
            </>
          ) : (
            content
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  exitButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  exitText: {
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  phaseCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  innerCard: {
    gap: 12,
  },
  phaseHeader: {
    gap: 4,
  },
  phaseLabel: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'Orbitron_700Bold',
  },
  phaseTitle: {
    fontSize: 24,
    fontFamily: 'Orbitron_700Bold',
  },
  phaseSubtitle: {
    fontSize: 14,
    fontFamily: 'Orbitron_400Regular',
  },
  phaseHint: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Orbitron_400Regular',
  },
  placeholderBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    minHeight: 120,
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Orbitron_400Regular',
  },
  nextButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
  },
});
