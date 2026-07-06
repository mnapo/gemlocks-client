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
import { useSettings } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const tokenSets = ['Números', 'Horóscopo', 'Emojis', 'Runas'];
const tokenCounts = ['4', '5', '6'];

export default function DemoSettingsScreen({ navigation }: Props) {
  const { palette, t, themeMode, setThemeMode, language, setLanguage } = useSettings();
  const [playerName, setPlayerName] = useState('Jugador');
  const [selectedSet, setSelectedSet] = useState(tokenSets[0]);
  const [selectedCount, setSelectedCount] = useState(tokenCounts[0]);
  const [showSetPicker, setShowSetPicker] = useState(false);
  const [showCountPicker, setShowCountPicker] = useState(false);

  return (
    <ScreenWrapper title={t('demoSettingsTitle')} scrollable>
      <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}> 
        <Text style={[styles.label, { color: palette.text }]}>{t('demoSettingsName')}</Text>
        <TextInput
          value={playerName}
          onChangeText={setPlayerName}
          style={[styles.input, { borderColor: palette.panelBorder, color: palette.text }]}
          placeholder={t('demoSettingsNamePlaceholder')}
          placeholderTextColor={palette.textDim}
        />

        <Text style={[styles.label, { color: palette.text }]}>{t('demoSettingsTokenSet')}</Text>
        <TouchableOpacity
          style={[styles.selector, { borderColor: palette.panelBorder }]}
          onPress={() => setShowSetPicker((prev) => !prev)}
        >
          <Text style={[styles.selectorText, { color: palette.text }]}>{selectedSet}</Text>
        </TouchableOpacity>
        {showSetPicker && (
          <View style={[styles.pickerList, { borderColor: palette.panelBorder }]}> 
            {tokenSets.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionItem, { backgroundColor: palette.panel }]}
                onPress={() => {
                  setSelectedSet(option);
                  setShowSetPicker(false);
                }}
              >
                <Text style={[styles.optionText, { color: palette.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.label, { color: palette.text }]}>{t('demoSettingsTokenCount')}</Text>
        <TouchableOpacity
          style={[styles.selector, { borderColor: palette.panelBorder }]}
          onPress={() => setShowCountPicker((prev) => !prev)}
        >
          <Text style={[styles.selectorText, { color: palette.text }]}>{selectedCount}</Text>
        </TouchableOpacity>
        {showCountPicker && (
          <View style={[styles.pickerList, { borderColor: palette.panelBorder }]}> 
            {tokenCounts.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionItem, { backgroundColor: palette.panel }]}
                onPress={() => {
                  setSelectedCount(option);
                  setShowCountPicker(false);
                }}
              >
                <Text style={[styles.optionText, { color: palette.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.row}> 
        <TouchableOpacity style={[styles.toggle, { borderColor: palette.panelBorder }]} onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
          <Text style={[styles.toggleText, { color: palette.text }]}>{themeMode === 'dark' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggle, { borderColor: palette.panelBorder }]} onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}>
          <Text style={[styles.toggleText, { color: palette.text }]}>{language === 'es' ? 'ES' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <NeonButton title={t('demoSettingsBack')} onPress={() => navigation.navigate('Home')} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Orbitron_700Bold',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontFamily: 'Orbitron_400Regular',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectorText: {
    fontFamily: 'Orbitron_400Regular',
  },
  pickerList: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionText: {
    fontFamily: 'Orbitron_400Regular',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggle: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 52,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
  },
});
