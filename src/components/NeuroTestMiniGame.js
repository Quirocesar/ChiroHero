import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import soundManager from '../utils/soundManager';
import { getNeuroTestResults, REFLEX_OPTIONS, SENSATION_OPTIONS } from '../data/neuroTests';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHASE_DURATION = 5000; // 5 seconds per test

// ─── Pixel Art: Reflex Hammer ────────────────────────────────────────────────
function ReflexHammer({ animValue }) {
  const rotation = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-45deg', '0deg'],
  });
  return (
    <Animated.View style={[styles.hammerWrap, { transform: [{ rotate: rotation }] }]}>
      {/* Handle */}
      <View style={styles.hammerHandle} />
      {/* Head */}
      <View style={styles.hammerHead} />
    </Animated.View>
  );
}

// ─── Pixel Art: Leg outline ──────────────────────────────────────────────────
function LegOutline({ reflexResult }) {
  const reflexColor =
    reflexResult === 'exaggerated' ? COLORS.red :
    reflexResult === 'absent' ? COLORS.grayLight :
    COLORS.green;

  return (
    <View style={styles.limbContainer}>
      {/* Thigh */}
      <View style={[styles.limbSegment, { width: 28, height: 60, backgroundColor: COLORS.skin }]} />
      {/* Knee joint (reflex point) */}
      <View style={[styles.kneeJoint, { backgroundColor: reflexColor }]} />
      {/* Lower leg */}
      <View style={[styles.limbSegment, { width: 24, height: 55, backgroundColor: COLORS.skin, marginTop: -2 }]} />
      {/* Foot */}
      <View style={styles.foot} />
    </View>
  );
}

// ─── Pixel Art: Body outline with dermatome ──────────────────────────────────
function BodyOutline({ sensationResult }) {
  const zoneColor = sensationResult === 'deficit'
    ? COLORS.red + '60'
    : COLORS.green + '60';
  const zoneBorder = sensationResult === 'deficit' ? COLORS.red : COLORS.green;

  return (
    <View style={styles.bodyContainer}>
      {/* Head */}
      <View style={styles.bodyHead} />
      {/* Torso */}
      <View style={styles.bodyTorso}>
        {/* Dermatome zone highlight */}
        <View style={[styles.dermatomeZone, { backgroundColor: zoneColor, borderColor: zoneBorder }]} />
      </View>
      {/* Left arm */}
      <View style={[styles.bodyArm, { left: -14 }]} />
      {/* Right arm */}
      <View style={[styles.bodyArm, { right: -14 }]} />
      {/* Legs */}
      <View style={styles.bodyLegs}>
        <View style={styles.bodyLeg} />
        <View style={[styles.bodyLeg, { marginLeft: 6 }]} />
      </View>
    </View>
  );
}

// ─── Power Meter ─────────────────────────────────────────────────────────────
function PowerMeter({ meterPos, targetStart, targetWidth, stopped, isCorrect }) {
  const meterWidth = SCREEN_WIDTH - 80;

  return (
    <View style={styles.meterContainer}>
      {/* Scale labels */}
      <View style={styles.meterLabels}>
        <PixelText size="tiny" color={COLORS.ink}>0</PixelText>
        <PixelText size="tiny" color={COLORS.ink}>1</PixelText>
        <PixelText size="tiny" color={COLORS.ink}>2</PixelText>
        <PixelText size="tiny" color={COLORS.ink}>3</PixelText>
        <PixelText size="tiny" color={COLORS.ink}>4</PixelText>
        <PixelText size="tiny" color={COLORS.ink}>5</PixelText>
      </View>
      {/* Bar track */}
      <View style={[styles.meterTrack, { width: meterWidth }]}>
        {/* Target zone */}
        <View
          style={[
            styles.meterTarget,
            {
              left: (targetStart / 5) * meterWidth,
              width: (targetWidth / 5) * meterWidth,
            },
          ]}
        />
        {/* Moving indicator */}
        <View
          style={[
            styles.meterIndicator,
            {
              left: meterPos * meterWidth - 3,
              backgroundColor: stopped
                ? (isCorrect ? COLORS.green : COLORS.red)
                : COLORS.primary,
            },
          ]}
        />
      </View>
      {/* Strength label */}
      <PixelText size="small" color={COLORS.ink} center style={{ marginTop: 6 }}>
        Grado de fuerza muscular
      </PixelText>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NeuroTestMiniGame({ condition, onComplete, skillLevel = 1 }) {
  const [phase, setPhase] = useState(0); // 0, 1, 2 = three tests; 3 = results
  const [countdown, setCountdown] = useState(5);
  const [results, setResults] = useState([null, null, null]);
  const [answered, setAnswered] = useState(false);
  const [flashColor, setFlashColor] = useState(null);

  // Power meter state (phase 2)
  const [meterPos, setMeterPos] = useState(0);
  const [meterStopped, setMeterStopped] = useState(false);
  const [meterCorrect, setMeterCorrect] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hammerAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const meterAnimRef = useRef(null);
  const countdownRef = useRef(null);
  const timerRef = useRef(null);

  // Expected results from condition data
  const expected = useRef(getNeuroTestResults(condition)).current;

  // ── Slide transition ────────────────────────────────────────────────────
  const slideToNext = useCallback((nextPhase) => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(SCREEN_WIDTH);
      setPhase(nextPhase);
      setAnswered(false);
      setCountdown(5);
      setFlashColor(null);
      setMeterStopped(false);
      setMeterCorrect(false);
      setMeterPos(0);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnim]);

  // ── Flash feedback ──────────────────────────────────────────────────────
  const showFlash = useCallback((correct) => {
    setFlashColor(correct ? COLORS.green : COLORS.red);
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [flashAnim]);

  // ── Countdown timer per phase ───────────────────────────────────────────
  useEffect(() => {
    if (phase >= 3) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Time ran out — auto-fail if not answered
          if (!answered) {
            handleTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    countdownRef.current = interval;
    return () => clearInterval(interval);
  }, [phase, answered]);

  // Handle timeout (no answer given)
  const handleTimeout = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    showFlash(false);
    soundManager.playError();
    const newResults = [...results];
    newResults[phase] = false;
    setResults(newResults);

    timerRef.current = setTimeout(() => {
      if (phase < 2) {
        slideToNext(phase + 1);
      } else {
        slideToNext(3);
      }
    }, 800);
  }, [phase, answered, results, showFlash, slideToNext]);

  // ── Reflex hammer animation (Phase 0) ──────────────────────────────────
  useEffect(() => {
    if (phase !== 0) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hammerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(hammerAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, hammerAnim]);

  // ── Power meter oscillation (Phase 2) ──────────────────────────────────
  useEffect(() => {
    if (phase !== 2 || meterStopped) return;
    let running = true;
    let pos = 0;
    let direction = 1;
    const speed = 0.012 + skillLevel * 0.002; // faster at higher skill

    const tick = () => {
      if (!running) return;
      pos += direction * speed;
      if (pos >= 1) { pos = 1; direction = -1; }
      if (pos <= 0) { pos = 0; direction = 1; }
      setMeterPos(pos);
      meterAnimRef.current = requestAnimationFrame(tick);
    };
    meterAnimRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);
    };
  }, [phase, meterStopped, skillLevel]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);
    };
  }, []);

  // ── Answer handlers ────────────────────────────────────────────────────
  const handleReflexAnswer = (optionId) => {
    if (answered) return;
    setAnswered(true);
    if (countdownRef.current) clearInterval(countdownRef.current);

    const correct = optionId === expected.reflex ||
      (expected.reflex === 'diminished' && optionId === 'absent');
    showFlash(correct);
    correct ? soundManager.playSuccess() : soundManager.playError();

    const newResults = [...results];
    newResults[0] = correct;
    setResults(newResults);

    timerRef.current = setTimeout(() => slideToNext(1), 800);
  };

  const handleSensationAnswer = (optionId) => {
    if (answered) return;
    setAnswered(true);
    if (countdownRef.current) clearInterval(countdownRef.current);

    const expectedSensation = (expected.sensation === 'normal') ? 'normal' : 'deficit';
    const correct = optionId === expectedSensation;
    showFlash(correct);
    correct ? soundManager.playSuccess() : soundManager.playError();

    const newResults = [...results];
    newResults[1] = correct;
    setResults(newResults);

    timerRef.current = setTimeout(() => slideToNext(2), 800);
  };

  const handleMeterTap = () => {
    if (meterStopped || answered) return;
    setMeterStopped(true);
    setAnswered(true);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);

    const { targetStart, targetWidth } = getMeterTarget();
    const posInScale = meterPos * 5;
    const correct = posInScale >= targetStart && posInScale <= targetStart + targetWidth;

    setMeterCorrect(correct);
    showFlash(correct);
    correct ? soundManager.playSuccess() : soundManager.playError();

    const newResults = [...results];
    newResults[2] = correct;
    setResults(newResults);

    timerRef.current = setTimeout(() => slideToNext(3), 800);
  };

  // ── Meter target calculation ───────────────────────────────────────────
  const getMeterTarget = () => {
    const target = expected.strengthTarget;
    const width = Math.max(0.5, 1.5 - skillLevel * 0.05);
    const start = Math.max(0, target - width / 2);
    return { targetStart: start, targetWidth: Math.min(width, 5 - start) };
  };

  // ── Results calculation ────────────────────────────────────────────────
  const getScoreSummary = () => {
    const testsCorrect = results.filter(Boolean).length;
    let recommendation;
    let recColor;
    let recText;

    if (testsCorrect === 3) {
      recommendation = expected.recommendation || 'safe';
      switch (recommendation) {
        case 'safe':
          recColor = COLORS.green;
          recText = 'Seguro para tratamiento';
          break;
        case 'caution':
          recColor = COLORS.primary;
          recText = 'Tratar con precaucion';
          break;
        case 'refer':
          recColor = COLORS.red;
          recText = 'Derivar a especialista';
          break;
        default:
          recColor = COLORS.green;
          recText = 'Seguro para tratamiento';
      }
    } else if (testsCorrect === 2) {
      recommendation = 'caution';
      recColor = COLORS.primary;
      recText = 'Resultado ambiguo - decide con precaucion';
    } else {
      recommendation = 'caution';
      recColor = COLORS.grayDark;
      recText = 'Resultado no concluyente';
    }

    return { testsCorrect, recommendation, recColor, recText };
  };

  const handleComplete = () => {
    const { testsCorrect, recommendation } = getScoreSummary();
    soundManager.playClick();
    onComplete({
      testsCorrect,
      totalTests: 3,
      recommendation: testsCorrect === 3 ? (expected.recommendation || 'safe') : recommendation,
    });
  };

  // ── Render phases ──────────────────────────────────────────────────────
  const renderPhaseHeader = (num) => (
    <View style={styles.phaseHeader}>
      <PixelText size="small" color={COLORS.ink} shadow={false}>
        PRUEBA {num}/3
      </PixelText>
      {phase < 3 && (
        <View style={styles.countdownBadge}>
          <PixelText size="small" color={countdown <= 2 ? COLORS.red : COLORS.ink} shadow={false}>
            {countdown}s
          </PixelText>
        </View>
      )}
    </View>
  );

  const renderReflexTest = () => (
    <View style={styles.testContent}>
      {renderPhaseHeader(1)}
      <PixelText size="medium" color={COLORS.ink} center shadow={false} style={{ marginBottom: 12 }}>
        Prueba de Reflejos
      </PixelText>

      {/* Visual: Leg + hammer */}
      <View style={styles.reflexVisual}>
        <LegOutline reflexResult={expected.reflex} />
        <ReflexHammer animValue={hammerAnim} />
      </View>

      <PixelText size="small" color={COLORS.inkLight} center shadow={false} style={{ marginBottom: 12 }}>
        Observa el reflejo y selecciona:
      </PixelText>

      {/* Answer buttons */}
      <View style={styles.answerRow}>
        {REFLEX_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.answerButton,
              answered && opt.id === expected.reflex && styles.correctButton,
              answered && opt.id !== expected.reflex && styles.dimButton,
            ]}
            onPress={() => handleReflexAnswer(opt.id)}
            disabled={answered}
            activeOpacity={0.7}
          >
            <PixelText size="small" color={COLORS.ink} center shadow={false}>
              {opt.label}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSensationTest = () => (
    <View style={styles.testContent}>
      {renderPhaseHeader(2)}
      <PixelText size="medium" color={COLORS.ink} center shadow={false} style={{ marginBottom: 12 }}>
        Dermatomas
      </PixelText>

      {/* Visual: Body with highlighted zone */}
      <View style={styles.bodyVisualWrap}>
        <BodyOutline sensationResult={expected.sensation} />
      </View>

      <PixelText size="small" color={COLORS.inkLight} center shadow={false} style={{ marginVertical: 10 }}>
        ¿El paciente siente en esta zona?
      </PixelText>

      {/* Answer buttons */}
      <View style={styles.answerRow}>
        {SENSATION_OPTIONS.map((opt) => {
          const expectedSensation = expected.sensation === 'normal' ? 'normal' : 'deficit';
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.answerButtonWide,
                answered && opt.id === expectedSensation && styles.correctButton,
                answered && opt.id !== expectedSensation && styles.dimButton,
              ]}
              onPress={() => handleSensationAnswer(opt.id)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <PixelText size="small" color={COLORS.ink} center shadow={false}>
                {opt.label}
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStrengthTest = () => {
    const { targetStart, targetWidth } = getMeterTarget();
    return (
      <View style={styles.testContent}>
        {renderPhaseHeader(3)}
        <PixelText size="medium" color={COLORS.ink} center shadow={false} style={{ marginBottom: 12 }}>
          Fuerza Muscular
        </PixelText>

        <PixelText size="small" color={COLORS.inkLight} center shadow={false} style={{ marginBottom: 16 }}>
          Toca para detener en la zona verde
        </PixelText>

        <PowerMeter
          meterPos={meterPos}
          targetStart={targetStart}
          targetWidth={targetWidth}
          stopped={meterStopped}
          isCorrect={meterCorrect}
        />

        <TouchableOpacity
          style={[
            styles.tapButton,
            meterStopped && { backgroundColor: COLORS.grayLight },
          ]}
          onPress={handleMeterTap}
          disabled={meterStopped}
          activeOpacity={0.8}
        >
          <PixelText size="medium" color={COLORS.ink} center shadow={false}>
            {meterStopped ? (meterCorrect ? 'Correcto!' : 'Fallaste') : 'DETENER'}
          </PixelText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderResults = () => {
    const { testsCorrect, recColor, recText } = getScoreSummary();

    return (
      <View style={styles.testContent}>
        <PixelText size="large" color={COLORS.ink} center shadow={false} style={{ marginBottom: 16 }}>
          Resultados
        </PixelText>

        <View style={styles.scoreCard}>
          <PixelText size="xlarge" color={COLORS.ink} center shadow={false}>
            {testsCorrect}/3
          </PixelText>
          <PixelText size="small" color={COLORS.inkLight} center shadow={false}>
            pruebas correctas
          </PixelText>
        </View>

        {/* Individual results */}
        <View style={styles.resultsList}>
          {['Reflejos', 'Sensacion', 'Fuerza'].map((name, i) => (
            <View key={name} style={styles.resultRow}>
              <View style={[
                styles.resultDot,
                { backgroundColor: results[i] ? COLORS.green : COLORS.red },
              ]} />
              <PixelText size="small" color={COLORS.ink} shadow={false}>
                {name}: {results[i] ? 'Correcto' : 'Incorrecto'}
              </PixelText>
            </View>
          ))}
        </View>

        {/* Recommendation */}
        <View style={[styles.recommendationBox, { borderColor: recColor }]}>
          <PixelText size="small" color={recColor} center shadow={false}>
            {recText}
          </PixelText>
        </View>

        <PixelButton
          title="Continuar"
          onPress={handleComplete}
          variant="primary"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────
  const renderCurrentPhase = () => {
    switch (phase) {
      case 0: return renderReflexTest();
      case 1: return renderSensationTest();
      case 2: return renderStrengthTest();
      case 3: return renderResults();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Flash overlay */}
      {flashColor && (
        <Animated.View
          style={[
            styles.flashOverlay,
            { backgroundColor: flashColor, opacity: flashAnim },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Animated phase container */}
      <Animated.View
        style={[
          styles.phaseContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {renderCurrentPhase()}
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.desk,
    overflow: 'hidden',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    borderRadius: 8,
  },
  phaseContainer: {
    flex: 1,
    padding: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.paperDark,
  },
  countdownBadge: {
    backgroundColor: COLORS.paperDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testContent: {
    flex: 1,
    alignItems: 'center',
  },

  // ── Reflex test ──
  reflexVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 150,
  },
  limbContainer: {
    alignItems: 'center',
  },
  limbSegment: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
  },
  kneeJoint: {
    width: 32,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
    marginVertical: -1,
  },
  foot: {
    width: 32,
    height: 10,
    backgroundColor: COLORS.skin,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
    marginTop: -1,
  },
  hammerWrap: {
    marginLeft: 16,
    alignItems: 'center',
    width: 50,
  },
  hammerHandle: {
    width: 6,
    height: 50,
    backgroundColor: COLORS.desk,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.deskDark,
  },
  hammerHead: {
    width: 30,
    height: 14,
    backgroundColor: COLORS.grayDark,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.dark,
    marginTop: -2,
  },

  // ── Body outline ──
  bodyVisualWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginBottom: 4,
  },
  bodyContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  bodyHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.skin,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
    marginBottom: 2,
  },
  bodyTorso: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.skin,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dermatomeZone: {
    position: 'absolute',
    width: 36,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  bodyArm: {
    position: 'absolute',
    top: 28,
    width: 14,
    height: 50,
    backgroundColor: COLORS.skin,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
  },
  bodyLegs: {
    flexDirection: 'row',
    marginTop: 2,
  },
  bodyLeg: {
    width: 18,
    height: 52,
    backgroundColor: COLORS.skin,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.skinDark,
  },

  // ── Answer buttons ──
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  answerButton: {
    backgroundColor: COLORS.paperLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  answerButtonWide: {
    backgroundColor: COLORS.paperLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  correctButton: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green + '20',
  },
  dimButton: {
    opacity: 0.4,
  },

  // ── Power meter ──
  meterContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH - 80,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  meterTrack: {
    height: 28,
    backgroundColor: COLORS.paperDark,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.desk,
    position: 'relative',
    overflow: 'hidden',
  },
  meterTarget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.green + '40',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.green,
  },
  meterIndicator: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 32,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  tapButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── Results ──
  scoreCard: {
    backgroundColor: COLORS.paperLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsList: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resultDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  recommendationBox: {
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: COLORS.paperLight,
  },
});
