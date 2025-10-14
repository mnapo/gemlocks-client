import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
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

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Particle = ({ x, y, size }: { x: number; y: number; size: number }) => {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withTiming(1, { duration: 4000 + Math.random() * 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: y + anim.value * 20,
    left: x,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: interpolateColor(anim.value, [0, 1], ['#00ffff88', '#ffdd0088']),
    opacity: 0.7 + 0.3 * anim.value,
  }));

  return <Animated.View style={style} />;
};

export default function HomeScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => {
    const color = interpolateColor(glow.value, [0, 1], ['#00ffff', '#ffdd00']);
    const shadowColor = interpolateColor(glow.value, [0, 1], ['#00ffff88', '#ffdd0088']);
    return { color, textShadowColor: shadowColor, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } };
  });

  const buttonStyle = useAnimatedStyle(() => {
    const shadowColor = interpolateColor(glow.value, [0, 1], ['#00ffff88', '#ffdd0088']);
    return { shadowColor, shadowOpacity: 0.7, shadowRadius: 20, borderRadius: 14, shadowOffset: { width: 0, height: 0 } };
  });

  const numParticles = 15;
  const particlesArray = Array.from({ length: numParticles }).map((_, i) => {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.5;
    const size = 4 + Math.random() * 6;
    return <Particle key={i} x={x} y={y} size={size} />;
  });

  return (
    <ScreenWrapper scrollable={false}>
      <ImageBackground
        source={require('../../assets/lobby_background.png')}
        style={styles.background}
        resizeMode="cover"
        imageStyle={{ opacity: 0.4 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

          {particlesArray}

          <Animated.View style={styles.titleContainer}>
            <Animated.Text style={[styles.title, titleStyle]}>Gemlocks</Animated.Text>
            <Text style={styles.subtitle}>Think fast, crack codes, unlock gems!</Text>
          </Animated.View>


          <View style={styles.buttonsContainer}>
            <Animated.View style={buttonStyle}>
              <NeonButton title="Quick Match" onPress={() => navigation.navigate('Match')} />
            </Animated.View>
            <Animated.View style={buttonStyle}>
              <NeonButton title="Instructions" onPress={() => navigation.navigate('Instructions')} />
            </Animated.View>
            <Animated.View style={buttonStyle}>
              <NeonButton title="Settings" onPress={() => navigation.navigate('Settings')} />
            </Animated.View>
            <Animated.View style={buttonStyle}>
              <NeonButton
                title="Logout"
                onPress={async () => {
                  await logout();
                  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                }}
              />
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width, height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 2,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 48,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '80%',
    gap: 20,
    zIndex: 2,
  },
});