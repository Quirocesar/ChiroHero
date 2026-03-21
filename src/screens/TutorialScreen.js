import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import BackHeader from '../components/BackHeader';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import PixelCard from '../components/PixelCard';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    icon: '🎓',
    titleKey: 'tutWelcomeTitle',
    title: 'WALMER UNIVERSITY',
    subtitle: 'Chiropractic School',
    content: 'Welcome, future chiropractor! You are about to begin your career treating patients with spinal problems. Let\'s learn the basics.',
    contentEs: '¡Bienvenido, futuro quiropráctico! Estás a punto de comenzar tu carrera tratando pacientes con problemas de espalda. Aprendamos lo básico.',
    color: COLORS.gold,
  },
  {
    icon: '📋',
    title: 'SOAP REPORT',
    subtitle: 'Diagnose your patients',
    content: 'Each patient brings a SOAP report:\n\n[S] Subjective - What the patient tells you\n[O] Objective - What you observe\n[A] Assessment - Your diagnosis\n[P] Plan - Treat or refer?\n\nRead carefully for RED FLAGS!',
    contentEs: 'Cada paciente trae un informe SOAP:\n\n[S] Subjetivo - Lo que dice el paciente\n[O] Objetivo - Lo que observas\n[A] Evaluación - Tu diagnóstico\n[P] Plan - ¿Tratar o derivar?\n\n¡Busca BANDERAS ROJAS!',
    color: COLORS.accent,
  },
  {
    icon: '⚠️',
    title: 'RED FLAGS',
    subtitle: 'Know when to refer',
    content: 'Some patients have DANGEROUS conditions:\n\n🔴 Cauda Equina Syndrome\n🔴 Suspected fractures\n🔴 Myelopathy\n🔴 Tumors\n🔴 Infections\n🔴 Vascular pathology\n\nALWAYS refer these to a specialist! Check the Pathology Manual.',
    contentEs: 'Algunos pacientes tienen condiciones PELIGROSAS:\n\n🔴 Síndrome de Cauda Equina\n🔴 Fracturas sospechadas\n🔴 Mielopatía\n🔴 Tumores\n🔴 Infecciones\n🔴 Patología vascular\n\n¡SIEMPRE deriva estos al especialista! Consulta el Manual de Patologías.',
    color: COLORS.red,
  },
  {
    icon: '🤲',
    title: 'TREATMENT',
    subtitle: 'Heal your patients',
    content: 'When treating:\n\n✕ Red dots = Subluxations (tap to adjust)\n● Orange dots = Contractures (tap multiple times)\n\n✅ Tap correct zones → bones crack, muscles release\n❌ Tap wrong zones → patient complains!\n\nBuild COMBOS for bonus rewards!',
    contentEs: 'Al tratar:\n\n✕ Puntos rojos = Subluxaciones (toca para ajustar)\n● Puntos naranjas = Contracturas (toca varias veces)\n\n✅ Toca zonas correctas → huesos crujen, músculos se liberan\n❌ Toca zonas incorrectas → ¡el paciente se queja!\n\n¡Haz COMBOS para bonificaciones!',
    color: COLORS.green,
  },
  {
    icon: '💰',
    title: 'GROW YOUR CLINIC',
    subtitle: 'Build your empire',
    content: 'With money earned:\n\n🔧 Buy tools (Activator, TENS, Ultrasound...)\n🏥 Upgrade your clinic\n📚 Study new techniques\n👥 Hire staff & assistants\n✈️ Travel to international events\n\nBecome the best chiropractor in the world!',
    contentEs: 'Con el dinero ganado:\n\n🔧 Compra herramientas (Activador, TENS, Ultrasonido...)\n🏥 Mejora tu clínica\n📚 Estudia nuevas técnicas\n👥 Contrata personal y asistentes\n✈️ Viaja a eventos internacionales\n\n¡Conviértete en el mejor quiropráctico del mundo!',
    color: COLORS.secondary,
  },
];

export default function TutorialScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
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
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
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

  const step = TUTORIAL_STEPS[currentStep];
  const isSpanish = lang === 'es' || lang === 'pt' || lang === 'it' || lang === 'fr';
  const content = isSpanish && step.contentEs ? step.contentEs : step.content;

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
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: step.color }]} />
        </View>
      </View>

      {/* Step content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.stepContainer, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          {/* Step icon */}
          <View style={[styles.iconContainer, { borderColor: step.color }]}>
            <PixelText size="giant" center>{step.icon}</PixelText>
          </View>

          {/* Step title */}
          <PixelText size="large" color={step.color} center glow>
            {step.title}
          </PixelText>
          <PixelText size="small" color={COLORS.gray} center style={styles.subtitle}>
            {step.subtitle}
          </PixelText>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: step.color }]} />

          {/* Content card */}
          <PixelCard color={COLORS.dark} borderColor={step.color}>
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
                    backgroundColor: i === currentStep ? step.color : i < currentStep ? COLORS.green : COLORS.grayDark,
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
              color={step.color}
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
