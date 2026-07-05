import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export interface NeonButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'secondary';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  onPress,
  color = theme.colors.primary,
  variant = 'primary',
}) => {
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={[
        styles.button,
        {
          borderColor: isSecondary ? 'rgba(255,255,255,0.16)' : 'rgba(0, 224, 255, 0.24)',
          backgroundColor: isSecondary ? 'rgba(255,255,255,0.04)' : 'rgba(0, 224, 255, 0.1)',
          shadowColor: color,
          shadowOpacity: isSecondary ? 0.08 : 0.14,
          shadowRadius: 8,
          elevation: 2,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
