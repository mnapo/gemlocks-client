import React from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import ScreenWrapper from "../components/ScreenWrapper";
import colors from "../theme/colors";

const width = Dimensions.get("window").width * 0.9;

const slides = [
  {
    title: "Build your code",
    desc: "Pick a secret 4-digit code with unique digits. Your rival will try to guess it!",
    img: require("../../assets/tutorial/placeholder.gif"),
  },
  {
    title: "Make guesses",
    desc: "Try to guess your rival's. After each guess, you'll get feedback.",
    img: require("../../assets/tutorial/placeholder.gif"),
  },
  {
    title: "Win with precision",
    desc: "Get 4 Perfects (correct digit in the correct spot) to win!",
    img: require("../../assets/tutorial/placeholder.gif"),
  },
];

export default function InstructionsScreen() {
  return (
    <ScreenWrapper>
      <Carousel
        loop
        width={width}
        height={400}
        autoPlay
        autoPlayInterval={5000}
        data={slides}
        scrollAnimationDuration={800}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Image source={item.img} style={styles.image} resizeMode="contain" />
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  title: { color: colors.primary, fontSize: 22, fontWeight: "600", marginBottom: 15 },
  image: { width: 220, height: 220, marginBottom: 20 },
  desc: { color: colors.text, textAlign: "center", fontSize: 16, paddingHorizontal: 20 },
});