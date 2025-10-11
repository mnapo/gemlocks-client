import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../theme/colors';
import { NeonButton } from '../components/NeonButton';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Instructions'>;

interface InstructionItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

const data: InstructionItem[] = [
  {
    id: '1',
    title: 'Choose your secret code',
    description: 'Select 4 unique digits from 0 to 9. Your opponent will try to guess it.',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '2',
    title: 'Make your guesses',
    description: 'Try to guess your opponent’s code. Each attempt reveals Perfect and Regular clues.',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '3',
    title: 'Use hints wisely',
    description: 'You can request 4 suggested codes — choose carefully!',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '4',
    title: 'Win the match',
    description: 'Get 4 perfects before your opponent. If both get 4, glory is shared!',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
];

export default function InstructionsScreen({ navigation }: Props) {
  return (
    <ScreenWrapper title="Instrucciones">
      <View style={styles.carouselContainer}>
        <Carousel
          loop
          width={width * 0.85}
          height={420}
          autoPlay={false}
          data={data}
          scrollAnimationDuration={800}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />
      </View>
      <NeonButton
        title="Back to Lobby"
        onPress={() => navigation.navigate('Home')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  slideTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: theme.colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Arial',
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 150,
    marginVertical: 10,
  },
});