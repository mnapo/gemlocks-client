import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { NeonButton } from '../components/NeonButton';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <ScreenWrapper title="Gemlocks" centered>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor={theme.colors.textDim} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} placeholderTextColor={theme.colors.textDim} secureTextEntry style={styles.input} />
      <NeonButton title="Login" onPress={handleLogin} />
      <NeonButton
        title="Signup"
        onPress={() => { navigation.navigate("Signup") }}
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