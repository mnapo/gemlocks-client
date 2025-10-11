import React from 'react';
import { Text, Switch, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../theme/colors';
import { NeonButton } from '../components/NeonButton';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  return (
    <ScreenWrapper title="Settings" scrollable>
      <View style={styles.option}>
        <Text style={styles.text}>Sounds</Text>
        <Switch thumbColor={theme.colors.primary} />
      </View>
      <View style={styles.option}>
        <Text style={styles.text}>Vibration</Text>
        <Switch thumbColor={theme.colors.secondary} />
      </View>
      <View style={styles.option}>
        <Text style={styles.text}>Dark Mode</Text>
        <Switch thumbColor={theme.colors.primary} />
      </View>
      <NeonButton
        title="Back to Lobby"
        onPress={() => navigation.navigate('Home')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  text: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
  },
});