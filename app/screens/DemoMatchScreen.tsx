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
  const [showGuide, setShowGuide] = useState(false);
  const [phaseEntered, setPhaseEntered] = useState(false);
  const [guideReady, setGuideReady] = useState(false);

  const introOpacity = useSharedValue(0);
  const introTranslateY = useSharedValue(-24);
  const phaseOpacity = useSharedValue(0);
  const phaseTranslateY = useSharedValue(-20);
  const guideOpacity = useSharedValue(0);
  const outgoingOpacity = useSharedValue(1);
  const outgoingTranslateX = useSharedValue(0);
  const incomingOpacity = useSharedValue(0);
  const incomingTranslateX = useSharedValue(24);

  useEffect(() => {
    introOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    introTranslateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    phaseOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    phaseTranslateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      setGuideReady(true);
      setShowGuide(true);
      guideOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      setPhaseEntered(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [introOpacity, introTranslateY, phaseOpacity, phaseTranslateY, guideOpacity]);

  const activePhase = phaseOrder[phaseIndex];
  const pendingPhase = pendingPhaseIndex !== null ? phaseOrder[pendingPhaseIndex] : null;

  const handleNext = () => {
    if (transitioning || phaseIndex >= phaseOrder.length - 1) {
      return;
    }

    const nextIndex = phaseIndex + 1;
    handlePhaseChange(nextIndex);
  };

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const handleAdvance = () => {
    if (!phaseEntered) {
      setPhaseEntered(true);
      guideOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      setShowGuide(true);
      return;
    }

    if (showGuide) {
      setShowGuide(false);
      guideOpacity.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    handleNext();
  };

  const handlePhaseChange = (nextIndex: number) => {
    setPendingPhaseIndex(nextIndex);
    setTransitioning(true);
    setShowGuide(false);
    setPhaseEntered(false);
    setGuideReady(false);

    outgoingOpacity.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    outgoingTranslateX.value = withTiming(-16, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    incomingOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    incomingTranslateX.value = withTiming(0, {
      duration: 220,
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
    }, 220);
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

  const phaseCardStyle = useAnimatedStyle(() => ({
    opacity: phaseOpacity.value,
    transform: [{ translateY: phaseTranslateY.value }],
  }));

  const guideStyle = useAnimatedStyle(() => ({
    opacity: guideOpacity.value,
  }));

  const content = useMemo(() => {
    return (
      <View style={styles.realPhaseContainer}>
        <Animated.View style={[styles.phaseCard, { borderColor: palette.panelBorder, backgroundColor: palette.panel }, phaseCardStyle]}> 
          <View style={styles.innerCard}>
            <View style={styles.phaseHeader}>
              <Text style={[styles.phaseLabel, { color: palette.primary }]}>Demo</Text>
              <Text style={[styles.phaseTitle, { color: palette.text }]}>{activePhase.title}</Text>
            </View>

            <View style={[styles.placeholderBox, { borderColor: palette.panelBorder }]}> 
              <Text style={[styles.placeholderText, { color: palette.textDim }]}>Contenido real de la fase</Text>
              <Text style={[styles.placeholderText, { color: palette.textDim }]}>Aquí luego irá la interacción propia de esta etapa.</Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: palette.primary }]}
              onPress={handleAdvance}
            >
              <Text style={[styles.nextButtonText, { color: palette.background }]}> 
                {phaseIndex === phaseOrder.length - 1 ? 'Volver al inicio' : 'Siguiente fase'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showGuide && guideReady && (
          <Animated.View style={[styles.guideOverlay, guideStyle]}>
            <TouchableOpacity style={styles.guideCloseButton} onPress={() => setShowGuide(false)}>
              <Text style={[styles.exitText, { color: palette.text }]}>✕</Text>
            </TouchableOpacity>

            <View style={[styles.guideCard, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}> 
              <View style={styles.phaseHeader}>
                <Text style={[styles.phaseLabel, { color: palette.primary }]}>Guía</Text>
                <Text style={[styles.phaseTitle, { color: palette.text }]}>{activePhase.title}</Text>
              </View>
              <Text style={[styles.phaseSubtitle, { color: palette.textDim }]}>{activePhase.subtitle}</Text>
              <Text style={[styles.phaseHint, { color: palette.text }]}>{activePhase.hint}</Text>
              <View style={[styles.placeholderBox, { borderColor: palette.panelBorder }]}> 
                <Text style={[styles.placeholderText, { color: palette.textDim }]}>Este cartel explica la fase actual.</Text>
                <Text style={[styles.placeholderText, { color: palette.textDim }]}>Se cierra con la X para pasar al contenido real.</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    );
  }, [activePhase, handleAdvance, palette, phaseIndex, showGuide]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}> 
      <View style={styles.screenContent}>
        <TouchableOpacity style={styles.finishButton} onPress={handleExit}>
          <Text style={[styles.finishButtonText, { color: palette.background }]}>Finalizar partida</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  finishButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 3,
    backgroundColor: '#ffffff',
  },
  finishButtonText: {
    fontSize: 12,
    fontFamily: 'Orbitron_700Bold',
    textTransform: 'uppercase',
  },
  exitText: {
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    width: '100%',
    maxWidth: 500,
    minHeight: 560,
    alignSelf: 'center',
  },
  realPhaseContainer: {
    position: 'relative',
  },
  phaseCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    minHeight: 560,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 4,
  },
  guideCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  guideCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    minHeight: 180,
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
