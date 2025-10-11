import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export interface NeonButtonProps {
    title: string;
    onPress: () => void;
    color?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, color = theme.colors.primary }) => (
  <TouchableOpacity style={[styles.button, { borderColor: color }]} onPress={onPress}>
    <Text style={[styles.text, { color }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
  },
});