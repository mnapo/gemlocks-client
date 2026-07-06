import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { NeonButton } from '../components/NeonButton';
import { theme } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const tokenSets = ['Números', 'Horóscopo', 'Emojis', 'Runas'];
const tokenCounts = ['4', '5', '6'];

export default function DemoSettingsScreen({ navigation }: Props) {
  const [playerName, setPlayerName] = useState('Jugador');
  const [selectedSet, setSelectedSet] = useState(tokenSets[0]);
  const [selectedCount, setSelectedCount] = useState(tokenCounts[0]);
  const [showSetPicker, setShowSetPicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false);

  return (
    <ScreenWrapper title="Demo Settings" scrollable>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={playerName}
          onChangeText={setPlayerName}
          style={styles.input}
          placeholder="Ingresa tu nombre"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <Text style={styles.label}>Fichas</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowSetPicker((prev) => !prev)}
        >
          <Text style={styles.selectorText}>{selectedSet}</Text>
        </TouchableOpacity>
        {showSetPicker && (
          <View style={styles.pickerList}>
            {tokenSets.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionItem}
                onPress={() => {
                  setSelectedSet(option);
                  setShowSetPicker(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Cantidad</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowCountPicker((prev) => !prev)}
        >
          <Text style={styles.selectorText}>{selectedCount}</Text>
        </TouchableOpacity>
        {showCountPicker && (
          <View style={styles.pickerList}>
            {tokenCounts.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionItem}
                onPress={() => {
                  setSelectedCount(option);
                  setShowCountPicker(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <NeonButton title="Volver al inicio" onPress={() => navigation.navigate('Home')} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: theme.colors.text,
    fontFamily: 'Orbitron_400Regular',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectorText: {
    color: theme.colors.text,
    fontFamily: 'Orbitron_400Regular',
  },
  pickerList: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optionText: {
    color: theme.colors.text,
    fontFamily: 'Orbitron_400Regular',
  },
});
