import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
  ModalPresentationIOS,
} from '@react-navigation/stack';

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
import ClinicModeSelectorScreen from './src/screens/ClinicModeSelectorScreen';
import SalaCerradaScreen from './src/screens/SalaCerradaScreen';
import IntroductionStory from './src/screens/IntroductionStory';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { TutorialProvider } from './src/utils/TutorialContext';
import gameState from './src/utils/gameState';
import telemetry from './src/utils/telemetry';
import TELEMETRY_EVENTS from './src/utils/telemetryEvents';

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
  const [appResetKey, setAppResetKey] = useState(0);
  const sessionStartRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  const handleAppCrash = (error, info) => {
    telemetry.logEvent(TELEMETRY_EVENTS.APP_CRASH, {
      message: error?.message || 'Unknown runtime error',
      stack: typeof info?.componentStack === 'string' ? info.componentStack.slice(0, 1200) : '',
      appState: appStateRef.current,
    });
  };

  const handleAppReset = () => {
    sessionStartRef.current = Date.now();
    setAppResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const goingBackground = prevState === 'active' && nextState.match(/inactive|background/);
      if (goingBackground) {
        gameState.save().catch(() => {});
        const durationSec = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
        telemetry.logEvent(TELEMETRY_EVENTS.SESSION_END, {
          reason: nextState,
          durationSec,
        });
      }
    });

    return () => {
      gameState.save().catch(() => {});
      const durationSec = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
      telemetry.logEvent(TELEMETRY_EVENTS.SESSION_END, {
        reason: 'unmount',
        durationSec,
      });
      subscription.remove();
    };
  }, []);

  return (
    <TutorialProvider>
      <>
        <StatusBar style="light" />
        <AppErrorBoundary onError={handleAppCrash} onReset={handleAppReset}>
          <NavigationContainer key={`root-${appResetKey}`}>
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
              name="ClinicModeSelector"
              component={ClinicModeSelectorScreen}
              options={{
                cardStyleInterpolator: forSlideFromRight,
                transitionSpec: {
                  open: { animation: 'timing', config: { duration: 300 } },
                  close: { animation: 'timing', config: { duration: 250 } },
                },
              }}
            />
            <Stack.Screen
              name="SalaCerrada"
              component={SalaCerradaScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                transitionSpec: {
                  open: { animation: 'spring', config: { stiffness: 100, damping: 15 } },
                  close: { animation: 'timing', config: { duration: 300 } },
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
        </AppErrorBoundary>
      </>
    </TutorialProvider>
  );
}
