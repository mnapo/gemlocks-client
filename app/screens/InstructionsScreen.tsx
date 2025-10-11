import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../theme/colors';
import { NeonButton } from '../components/NeonButton';
import type { RootStackParamList } from '../navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Match'>;

interface InstructionItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

const data: InstructionItem[] = [
  {
    id: '1',
    title: 'Elige tu código secreto',
    description: 'Selecciona 4 cifras distintas del 0 al 9. Tu rival intentará adivinarlo.',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '2',
    title: 'Haz tus intentos',
    description: 'Adivina el código del rival. Cada intento revela pistas: Perfectos y Regulares.',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '3',
    title: 'Usa pistas sabiamente',
    description: 'Puedes pedir 4 códigos sugeridos, ¡elige con cuidado!',
    image: require('../../assets/tutorial/placeholder.gif'),
  },
  {
    id: '4',
    title: 'Gana la partida',
    description: 'Obtén 4 perfectos antes que tu oponente. Si empatan, ¡hay gloria compartida!',
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
    fontFamily: 'Audiowide_400Regular',
    fontSize: 15,
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