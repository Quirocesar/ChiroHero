import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import BackHeader from '../components/BackHeader';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import PixelCard from '../components/PixelCard';
import TutorialOverlay from '../components/TutorialOverlay';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    id: 'step1',
    targetId: 'playButton',
    title: '¡Bienvenido a ChiroHero!',
    text: 'Pulsa JUGAR para abrir tu clínica quiropráctica y empezar a atender pacientes.',
  },
  {
    id: 'step2',
    targetId: 'openClinicBtn',
    title: 'Abre tu clínica',
    text: 'Toca ABRIR CONSULTA para comenzar el día. La sala de espera se llenará de pacientes.',
  },
  {
    id: 'step3',
    targetId: null,
    title: 'Elige tu estilo',
    text: 'Sala Cerrada: atención personalizada, más herramientas, más ingresos por paciente. Sala Abierta: más volumen, vista aérea, hasta 6 camillas.',
  },
  {
    id: 'step4',
    targetId: 'soapCard',
    title: 'Informe SOAP del paciente',
    text: 'Lee la ficha: Subjetivo (motivo), Objetivo (exploración), Evaluación (diagnóstico), Plan (tratamiento).',
  },
  {
    id: 'step5',
    targetId: 'treatBtn',
    title: 'Tratar al paciente',
    text: 'ATENDER AUTOMÁTICAMENTE es rápido. TRATAR MANUALMENTE activa un minijuego y te da hasta 1.5× de recompensa.',
  },
  {
    id: 'step6',
    targetId: null,
    title: 'Minijuego: Palpación',
    text: 'Toca las zonas dolorosas en el mapa de columna. Cada zona correcta suma puntos. ¡La precisión importa!',
  },
  {
    id: 'step7',
    targetId: null,
    title: 'Resultado',
    text: 'Al terminar ves tus ganancias y cambio de reputación. Más reputación = más pacientes mañana.',
  },
  {
    id: 'step8',
    targetId: null,
    title: '¡Listo para empezar!',
    text: 'Atiende pacientes, gana dinero, mejora tu clínica en la Tienda, y desbloquea logros. ¡Mucho éxito, Doctor!',
  },
];

export default function TutorialScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lang = gameState.get('language') || 'es';

  useEffect(() => {
    soundManager.init();
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 15, friction: 6, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: (currentStep + 1) / TUTORIAL_STEPS.length, duration: 300, useNativeDriver: false }),
    ]).start();

    // Play a note for each step
    const notes = [440, 523, 587, 659, 784];
    soundManager.playTone(notes[currentStep] || 440, 0.15, 'triangle', 0.08);
  };

  const handleNext = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Tutorial complete
      gameState.set({ tutorialStep: 9, hasCompletedTutorial: true });
      navigation.navigate('ClinicModeSelector');
    }
  };

  const handleSkip = () => {
    gameState.set({ tutorialStep: 9, hasCompletedTutorial: true });
    navigation.navigate('ClinicModeSelector');
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    soundManager.playSuccess();
    gameState.set({ hasCompletedTutorial: true });
    gameState.save();
    navigation.replace('ClinicView');
  };

  const step = TUTORIAL_STEPS[currentStep] || TUTORIAL_STEPS[0];
  const stepColor = step.color || COLORS.primary;
  const isSpanish = lang === 'es' || lang === 'pt' || lang === 'it' || lang === 'fr';
  const content = (isSpanish && step.contentEs) ? step.contentEs : (step.content || step.text || '');

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <BackHeader title="TUTORIAL" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <PixelText size="medium" color={COLORS.gold} glow>
            🎓 WALMER UNIVERSITY
          </PixelText>
          <PixelText size="tiny" color={COLORS.gray}>
            {currentStep + 1}/{TUTORIAL_STEPS.length}
          </PixelText>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: stepColor }]} />
        </View>
      </View>

      {/* Step content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.stepContainer, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          {/* Step icon */}
          <View style={[styles.iconContainer, { borderColor: stepColor }]}>
            <PixelText size="giant" center>{step.icon || '🎓'}</PixelText>
          </View>

          {/* Step title */}
          <PixelText size="large" color={stepColor} center glow>
            {step.title}
          </PixelText>
          {step.subtitle ? (
            <PixelText size="small" color={COLORS.gray} center style={styles.subtitle}>
              {step.subtitle}
            </PixelText>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: stepColor }]} />

          {/* Content card */}
          <PixelCard color={COLORS.dark} borderColor={stepColor}>
            <PixelText size="small" color={COLORS.white} style={styles.contentText}>
              {content}
            </PixelText>
          </PixelCard>

          {/* Step indicator dots */}
          <View style={styles.dots}>
            {TUTORIAL_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentStep ? stepColor : i < currentStep ? COLORS.green : COLORS.grayDark,
                    width: i === currentStep ? 14 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        <View style={styles.navButtons}>
          {currentStep > 0 && (
            <PixelButton
              title="← PREV"
              color={COLORS.dark}
              onPress={handlePrev}
              small
              style={styles.navBtn}
            />
          )}
          <View style={{ flex: 1 }} />
          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <PixelButton
              title="NEXT →"
              color={stepColor}
              onPress={handleNext}
              style={styles.navBtn}
            />
          ) : (
            <PixelButton
              title="🎓 START!"
              color={COLORS.green}
              onPress={handleComplete}
              size="large"
              style={styles.navBtn}
            />
          )}
        </View>
        <PixelButton
          title="SKIP TUTORIAL"
          color={COLORS.grayDark}
          onPress={handleComplete}
          small
          style={styles.skipBtn}
        />
      </View>
      <TutorialOverlay
        step={TUTORIAL_STEPS[stepIndex]}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.gold,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.bgDark,
    borderWidth: 2,
    borderColor: COLORS.grayDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  stepContainer: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    backgroundColor: COLORS.dark,
    marginBottom: 4,
  },
  subtitle: {
    letterSpacing: 2,
    marginTop: -4,
  },
  divider: {
    width: 60,
    height: 3,
    opacity: 0.5,
    marginVertical: 4,
  },
  contentText: {
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    height: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  footer: {
    padding: 12,
    backgroundColor: COLORS.dark,
    borderTopWidth: 3,
    borderTopColor: COLORS.grayDark,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    minWidth: 120,
  },
  skipBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
