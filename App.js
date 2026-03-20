import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, ModalPresentationIOS } from '@react-navigation/stack';

import MainMenuScreen from './src/screens/MainMenuScreen';
import ClinicViewScreen from './src/screens/ClinicViewScreen';
import ConsultationScreen from './src/screens/ConsultationScreen';
import TreatmentScreen from './src/screens/TreatmentScreen';
import ShopScreen from './src/screens/ShopScreen';
import EventsScreen from './src/screens/EventsScreen';
import PathologyBookScreen from './src/screens/PathologyBookScreen';
import AerialViewScreen from './src/screens/AerialViewScreen';
import IntroVideoScreen from './src/screens/IntroVideoScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import GameModeSelector from './src/screens/GameModeSelector';
import IntroductionStory from './src/screens/IntroductionStory';

const Stack = createStackNavigator();

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const forSlideFromRight = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
  },
});

const forScale = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  },
});

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="IntroVideo"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0d0d1a' },
            animationEnabled: true,
          }}
        >
          <Stack.Screen 
            name="IntroVideo" 
            component={IntroVideoScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen 
            name="MainMenu" 
            component={MainMenuScreen}
            options={{ 
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 500 } },
                close: { animation: 'timing', config: { duration: 500 } },
              },
            }}
          />
          <Stack.Screen 
            name="ClinicView" 
            component={ClinicViewScreen}
            options={{ 
              cardStyleInterpolator: forSlideFromRight,
              transitionSpec: {
                open: { animation: 'spring', config: { stiffness: 100, damping: 20 } },
                close: { animation: 'timing', config: { duration: 300 } },
              },
            }}
          />
          <Stack.Screen 
            name="Consultation" 
            component={ConsultationScreen}
            options={{ 
              cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
              transitionSpec: {
                open: { animation: 'spring', config: { stiffness: 90, damping: 15 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen 
            name="Treatment" 
            component={TreatmentScreen}
            options={{ 
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              transitionSpec: {
                open: { animation: 'spring', config: { stiffness: 100, damping: 15 } },
                close: { animation: 'timing', config: { duration: 300 } },
              },
            }}
          />
          <Stack.Screen 
            name="Shop" 
            component={ShopScreen}
            options={{ 
              cardStyleInterpolator: forSlideFromRight,
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 300 } },
              },
            }}
          />
          <Stack.Screen 
            name="Events" 
            component={EventsScreen}
            options={{ 
              cardStyleInterpolator: forSlideFromRight,
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 350 } },
                close: { animation: 'timing', config: { duration: 300 } },
              },
            }}
          />
          <Stack.Screen 
            name="PathologyBook" 
            component={PathologyBookScreen}
            options={{ 
              cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
              transitionSpec: {
                open: { animation: 'spring', config: { stiffness: 90, damping: 15 } },
                close: { animation: 'timing', config: { duration: 250 } },
              },
            }}
          />
          <Stack.Screen 
            name="AerialView" 
            component={AerialViewScreen}
            options={{ 
              cardStyleInterpolator: forFade,
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 400 } },
                close: { animation: 'timing', config: { duration: 350 } },
              },
            }}
          />
          <Stack.Screen 
            name="TutorialScreen" 
            component={TutorialScreen}
            options={{ 
              cardStyleInterpolator: forFade,
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 500 } },
                close: { animation: 'timing', config: { duration: 400 } },
              },
            }}
          />
          <Stack.Screen 
            name="Achievements" 
            component={AchievementsScreen}
            options={{ 
              cardStyleInterpolator: forScale,
              transitionSpec: {
                open: { animation: 'spring', config: { stiffness: 80, damping: 12 } },
                close: { animation: 'timing', config: { duration: 200 } },
              },
            }}
          />
          <Stack.Screen 
            name="GameModeSelector" 
            component={GameModeSelector}
            options={{ 
              cardStyleInterpolator: forFade,
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 400 } },
                close: { animation: 'timing', config: { duration: 350 } },
              },
            }}
          />
          <Stack.Screen 
            name="IntroductionStory" 
            component={IntroductionStory}
            options={{ 
              animation: 'fade',
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 500 } },
                close: { animation: 'timing', config: { duration: 400 } },
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
