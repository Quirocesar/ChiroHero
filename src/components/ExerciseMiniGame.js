import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import soundManager from '../utils/soundManager';
import { getExercisesForZone } from '../data/exercises';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 8;
const GRID_PADDING = 12;
const CARD_WIDTH = (Math.min(SCREEN_WIDTH, 375) - GRID_PADDING * 2 - CARD_GAP) / 2;
const MAX_SELECTIONS = 3;

export default function ExerciseMiniGame({ condition, onComplete, onSkip }) {
  const [exercises, setExercises] = useState([]);
  const [correctIds, setCorrectIds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState('selecting'); // 'selecting' | 'results'
  const [results, setResults] = useState(null);

  // Animated values for each card
  const cardScales = useRef([]);
  const cardBorderColors = useRef([]);
  const resultOpacities = useRef([]);

  useEffect(() => {
    const zone = condition?.zones?.[0] || 'lumbar';
    const data = getExercisesForZone(zone);
    setExercises(data.exercises);
    setCorrectIds(data.correctIds);

    // Initialize animated values for 6 cards
    cardScales.current = data.exercises.map(() => new Animated.Value(1));
    cardBorderColors.current = data.exercises.map(() => new Animated.Value(0));
    resultOpacities.current = data.exercises.map(() => new Animated.Value(0));
  }, [condition]);

  const toggleSelect = useCallback((exerciseId) => {
    if (phase !== 'selecting') return;

    setSelected((prev) => {
      const idx = prev.indexOf(exerciseId);
      if (idx >= 0) {
        // Deselect
        const cardIdx = exercises.findIndex((e) => e.id === exerciseId);
        if (cardIdx >= 0 && cardScales.current[cardIdx]) {
          Animated.spring(cardScales.current[cardIdx], {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
          }).start();
        }
        soundManager.playClick?.();
        return prev.filter((id) => id !== exerciseId);
      }
      if (prev.length >= MAX_SELECTIONS) return prev;

      // Select
      const cardIdx = exercises.findIndex((e) => e.id === exerciseId);
      if (cardIdx >= 0 && cardScales.current[cardIdx]) {
        Animated.sequence([
          Animated.spring(cardScales.current[cardIdx], {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
        ]).start();
      }
      soundManager.playClick?.();
      return [...prev, exerciseId];
    });
  }, [phase, exercises]);

  const handleConfirm = useCallback(() => {
    if (selected.length !== MAX_SELECTIONS) return;
    soundManager.playClick?.();

    let correctCount = 0;
    const cardResults = exercises.map((ex) => {
      const wasSelected = selected.includes(ex.id);
      const isCorrect = correctIds.includes(ex.id);
      if (wasSelected && isCorrect) correctCount++;
      return {
        id: ex.id,
        wasSelected,
        isCorrect,
        isContraindicated: !!ex.contraindicated,
      };
    });

    setResults({ cardResults, correctCount });
    setPhase('results');

    // Animate results reveal
    resultOpacities.current.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 150,
        useNativeDriver: true,
      }).start();
    });

    // Play sound based on results
    if (correctCount === MAX_SELECTIONS) {
      soundManager.play?.('perfect') || soundManager.playSuccess?.();
    } else if (correctCount > 0) {
      soundManager.playSuccess?.();
    } else {
      soundManager.playError?.();
    }
  }, [selected, exercises, correctIds]);

  const handleContinue = useCallback(() => {
    if (!results) return;
    const { correctCount } = results;
    const bonus = correctCount === MAX_SELECTIONS ? 30 : correctCount * 10;
    const satisfactionMult = 1.0 + correctCount * 0.066;

    onComplete?.({
      correct: correctCount,
      total: MAX_SELECTIONS,
      bonus,
      satisfactionMult: Math.min(satisfactionMult, 1.2),
    });
  }, [results, onComplete]);

  const getSelectionNumber = (exerciseId) => {
    const idx = selected.indexOf(exerciseId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const getCardResultStyle = (exercise) => {
    if (!results) return null;
    const r = results.cardResults.find((cr) => cr.id === exercise.id);
    if (!r) return null;

    if (r.wasSelected && r.isCorrect) {
      return { borderColor: COLORS.green, backgroundColor: COLORS.green + '15' };
    }
    if (r.wasSelected && !r.isCorrect) {
      if (r.isContraindicated) {
        return { borderColor: COLORS.red, backgroundColor: COLORS.red + '20' };
      }
      return { borderColor: COLORS.red, backgroundColor: COLORS.red + '10' };
    }
    if (!r.wasSelected && r.isCorrect) {
      return { borderColor: COLORS.green + '60', backgroundColor: COLORS.green + '08' };
    }
    return { opacity: 0.5 };
  };

  const getCardResultBadge = (exercise) => {
    if (!results) return null;
    const r = results.cardResults.find((cr) => cr.id === exercise.id);
    if (!r) return null;

    if (r.wasSelected && r.isCorrect) return { text: '\u2713', color: COLORS.green };
    if (r.wasSelected && !r.isCorrect && r.isContraindicated) return { text: '\u26A0\uFE0F', color: COLORS.red, label: 'CONTRAINDICADO' };
    if (r.wasSelected && !r.isCorrect) return { text: '\u2717', color: COLORS.red };
    if (!r.wasSelected && r.isCorrect) return { text: '\u2713', color: COLORS.green + '80', missed: true };
    return null;
  };

  const renderCard = (exercise, index) => {
    const selNum = getSelectionNumber(exercise.id);
    const isSelected = selNum > 0;
    const scale = cardScales.current[index] || new Animated.Value(1);
    const resultOpacity = resultOpacities.current[index] || new Animated.Value(0);
    const resultStyle = getCardResultStyle(exercise);
    const resultBadge = getCardResultBadge(exercise);

    return (
      <Animated.View
        key={exercise.id}
        style={[
          styles.cardWrapper,
          { transform: [{ scale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isSelected && phase === 'selecting' && styles.cardSelected,
            phase === 'results' && resultStyle,
          ]}
          onPress={() => toggleSelect(exercise.id)}
          disabled={phase === 'results'}
          activeOpacity={0.8}
        >
          {/* Selection badge */}
          {isSelected && phase === 'selecting' && (
            <View style={styles.selectionBadge}>
              <PixelText size="small" color={COLORS.ink} shadow={false}>
                {selNum}
              </PixelText>
            </View>
          )}

          {/* Exercise icon */}
          <PixelText size="large" center shadow={false}>
            {exercise.icon}
          </PixelText>

          {/* Exercise name */}
          <PixelText
            size="small"
            color={COLORS.ink}
            center
            shadow={false}
            style={styles.cardName}
          >
            {exercise.name}
          </PixelText>

          {/* Description */}
          <PixelText
            size="tiny"
            color={COLORS.inkLight}
            center
            shadow={false}
            style={styles.cardDesc}
          >
            {exercise.description}
          </PixelText>

          {/* Result overlay */}
          {phase === 'results' && resultBadge && (
            <Animated.View
              style={[
                styles.resultOverlay,
                { opacity: resultOpacity },
              ]}
            >
              <PixelText
                size="large"
                color={resultBadge.color}
                center
                shadow={false}
              >
                {resultBadge.text}
              </PixelText>
              {resultBadge.label && (
                <PixelText
                  size="tiny"
                  color={COLORS.red}
                  center
                  shadow={false}
                  style={styles.contraindicatedLabel}
                >
                  {resultBadge.label}
                </PixelText>
              )}
              {resultBadge.missed && (
                <PixelText
                  size="tiny"
                  color={COLORS.green + '80'}
                  center
                  shadow={false}
                >
                  (correcta)
                </PixelText>
              )}
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPrescriptionSlot = (slotIndex) => {
    const exerciseId = selected[slotIndex];
    const exercise = exerciseId
      ? exercises.find((e) => e.id === exerciseId)
      : null;

    return (
      <View key={slotIndex} style={styles.prescriptionSlot}>
        {exercise ? (
          <View style={styles.slotFilled}>
            <PixelText size="tiny" color={COLORS.ink} shadow={false}>
              {exercise.icon} {exercise.name}
            </PixelText>
          </View>
        ) : (
          <View style={styles.slotEmpty}>
            <PixelText size="tiny" color={COLORS.grayLight} shadow={false}>
              Ejercicio {slotIndex + 1}
            </PixelText>
          </View>
        )}
      </View>
    );
  };

  const renderResultsSummary = () => {
    if (!results) return null;
    const { correctCount } = results;
    const isPerfect = correctCount === MAX_SELECTIONS;
    const bonus = isPerfect ? 30 : correctCount * 10;

    return (
      <View style={styles.resultsSummary}>
        {isPerfect ? (
          <PixelText size="medium" color={COLORS.gold} center glow>
            {'\u2B50'} Prescripci{'\u00F3'}n Perfecta {'\u2B50'}
          </PixelText>
        ) : (
          <PixelText size="medium" color={COLORS.paper} center>
            {correctCount}/{MAX_SELECTIONS} correctos
          </PixelText>
        )}
        <View style={styles.bonusRow}>
          <PixelText size="small" color={COLORS.primaryLight} center>
            +${bonus} bonus
          </PixelText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <PixelText size="medium" color={COLORS.primary} center>
            PRESCRIBIR EJERCICIOS
          </PixelText>
          {condition?.name && (
            <PixelText
              size="small"
              color={COLORS.paperDark}
              center
              style={styles.conditionName}
            >
              Paciente: {condition.name}
            </PixelText>
          )}
        </View>

        {/* Instruction */}
        {phase === 'selecting' && (
          <View style={styles.instruction}>
            <PixelText size="small" color={COLORS.grayLight} center shadow={false}>
              Selecciona 3 ejercicios apropiados para este paciente
            </PixelText>
          </View>
        )}

        {/* Exercise grid */}
        <View style={styles.grid}>
          {exercises.map((ex, i) => renderCard(ex, i))}
        </View>

        {/* Prescription pad */}
        <View style={styles.prescriptionPad}>
          <View style={styles.padHeader}>
            <PixelText size="small" color={COLORS.ink} shadow={false}>
              {'\uD83D\uDCCB'} Receta de Ejercicios
            </PixelText>
          </View>
          <View style={styles.padBody}>
            {[0, 1, 2].map(renderPrescriptionSlot)}
          </View>
        </View>

        {/* Results summary */}
        {phase === 'results' && renderResultsSummary()}

        {/* Action buttons */}
        <View style={styles.actions}>
          {phase === 'selecting' && (
            <>
              <PixelButton
                title="CONFIRMAR"
                variant="primary"
                onPress={handleConfirm}
                disabled={selected.length !== MAX_SELECTIONS}
              />
              <PixelButton
                title="SALTAR"
                variant="secondary"
                onPress={onSkip}
                small
                style={styles.skipButton}
              />
            </>
          )}

          {phase === 'results' && (
            <PixelButton
              title="CONTINUAR"
              variant="primary"
              onPress={handleContinue}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark + 'F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: GRID_PADDING,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    marginTop: 4,
  },
  instruction: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
  card: {
    backgroundColor: COLORS.paper,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2.5,
    backgroundColor: COLORS.primaryLight + '15',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  selectionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    zIndex: 10,
  },
  cardName: {
    marginTop: 4,
  },
  cardDesc: {
    marginTop: 2,
    lineHeight: 13,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contraindicatedLabel: {
    marginTop: 2,
    fontWeight: 'bold',
  },
  prescriptionPad: {
    backgroundColor: COLORS.paperLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  padHeader: {
    backgroundColor: COLORS.paperDark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  padBody: {
    padding: 10,
  },
  prescriptionSlot: {
    marginBottom: 6,
  },
  slotFilled: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.primary + '60',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  slotEmpty: {
    borderWidth: 1.5,
    borderColor: COLORS.grayLight + '50',
    borderStyle: 'dashed',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  resultsSummary: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
  },
  bonusRow: {
    marginTop: 6,
  },
  actions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 8,
  },
});
