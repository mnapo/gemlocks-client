import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { NeonButton } from '../components/NeonButton';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper title="GEMLOCKS" centered>
      <NeonButton
        title="New Match"
        onPress={() => navigation.navigate('Match')}
        color={theme.colors.primary}
      />
      <NeonButton
        title="Instructions"
        onPress={() => navigation.navigate('Instructions')}
        color={theme.colors.secondary}
      />
      <NeonButton
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </ScreenWrapper>
  );
}