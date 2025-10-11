import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { NeonButton } from '../components/NeonButton';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <ScreenWrapper title="Gemlocks" centered>
      <TextInput placeholder="Email" placeholderTextColor={theme.colors.textDim} style={styles.input} />
      <TextInput placeholder="Password" placeholderTextColor={theme.colors.textDim} secureTextEntry style={styles.input} />
      <NeonButton title="Login" onPress={() => navigation.navigate('Home')} />
      <NeonButton
        title="Signup"
        onPress={() => {}}
        color={theme.colors.secondary}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    color: theme.colors.text,
    fontSize: 16,
    padding: 12,
    marginVertical: 8,
    width: '80%',
    fontFamily: 'Orbitron_700Bold',
  },
});
