import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { NeonButton } from '../components/NeonButton';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Match'>;

export default function MatchScreen({ navigation }: Props) {
  return (
    <ScreenWrapper title="Match" centered>
      <Text style={styles.info}>Your Turn</Text>
      <View style={styles.codeBox}>
        <Text style={styles.code}>_ _ _ _</Text>
      </View>
      <NeonButton title="Try" onPress={() => {}} />
      <NeonButton title="Help" color={theme.colors.secondary} onPress={() => {}} />
      <NeonButton
        title="Back to Lobby"
        onPress={() => navigation.navigate('Home')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  info: {
    color: theme.colors.textDim,
    marginBottom: 16,
    fontFamily: 'Orbitron_700Bold',
  },
  codeBox: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  code: {
    color: theme.colors.primary,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    textAlign: 'center',
  },
});
