import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import MatchScreen from "../screens/MatchScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DemoSettingsScreen from "../screens/DemoSettingsScreen";
import InstructionsScreen from "../screens/InstructionsScreen";
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Match" component={MatchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DemoSettings" component={DemoSettingsScreen} />
      <Stack.Screen name="Instructions" component={InstructionsScreen} />
    </Stack.Navigator>
  );
}