import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import soundManager from '../utils/soundManager';
import FloatingText from './FloatingText';
import { t } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPINE_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);
const SPINE_HEIGHT = 420;

const ZONES = {
  cervical: {
    label: 'Cervical',
    vertebrae: [
      { id: 'C1', x: 0.5, y: 0.02 }, { id: 'C2', x: 0.5, y: 0.05 }, { id: 'C3', x: 0.5, y: 0.08 },
      { id: 'C4', x: 0.5, y: 0.11 }, { id: 'C5', x: 0.5, y: 0.14 }, { id: 'C6', x: 0.5, y: 0.17 },
      { id: 'C7', x: 0.5, y: 0.20 },
    ],
  },
  thoracic: {
    label: 'Torácica',
    vertebrae: [
      { id: 'T1', x: 0.5, y: 0.24 }, { id: 'T2', x: 0.5, y: 0.27 }, { id: 'T3', x: 0.5, y: 0.30 },
      { id: 'T4', x: 0.5, y: 0.33 }, { id: 'T5', x: 0.5, y: 0.36 }, { id: 'T6', x: 0.5, y: 0.39 },
      { id: 'T7', x: 0.5, y: 0.42 }, { id: 'T8', x: 0.5, y: 0.45 }, { id: 'T9', x: 0.5, y: 0.48 },
      { id: 'T10', x: 0.5, y: 0.51 }, { id: 'T11', x: 0.5, y: 0.54 }, { id: 'T12', x: 0.5, y: 0.57 },
    ],
  },
  lumbar: {
    label: 'Lumbar',
    vertebrae: [
      { id: 'L1', x: 0.5, y: 0.62 }, { id: 'L2', x: 0.5, y: 0.66 }, { id: 'L3', x: 0.5, y: 0.70 },
      { id: 'L4', x: 0.5, y: 0.74 }, { id: 'L5', x: 0.5, y: 0.78 },
    ],
  },
  gluteal: {
    label: 'Sacro/Glúteo',
    vertebrae: [{ id: 'S1', x: 0.5, y: 0.83 }, { id: 'S2', x: 0.5, y: 0.87 }],
  },
};

const MUSCLE_POINTS = [
  { id: 'trap_l', x: 0.28, y: 0.10, zone: 'cervical', name: 'Trapecio Izq' },
  { id: 'trap_r', x: 0.72, y: 0.10, zone: 'cervical', name: 'Trapecio Der' },
  { id: 'rhomb_l', x: 0.25, y: 0.32, zone: 'thoracic', name: 'Romboides Izq' },
  { id: 'rhomb_r', x: 0.75, y: 0.32, zone: 'thoracic', name: 'Romboides Der' },
  { id: 'para_l1', x: 0.35, y: 0.45, zone: 'thoracic', name: 'Paravertebral Izq' },
  { id: 'para_r1', x: 0.65, y: 0.45, zone: 'thoracic', name: 'Paravertebral Der' },
  { id: 'para_l2', x: 0.35, y: 0.65, zone: 'lumbar', name: 'Paravertebral L Izq' },
  { id: 'para_r2', x: 0.65, y: 0.65, zone: 'lumbar', name: 'Paravertebral L Der' },
  { id: 'ql_l', x: 0.28, y: 0.60, zone: 'lumbar', name: 'Cuadrado Lumbar Izq' },
  { id: 'ql_r', x: 0.72, y: 0.60, zone: 'lumbar', name: 'Cuadrado Lumbar Der' },
  { id: 'glut_l', x: 0.32, y: 0.85, zone: 'gluteal', name: 'Glúteo Izq' },
  { id: 'glut_r', x: 0.68, y: 0.85, zone: 'gluteal', name: 'Glúteo Der' },
  { id: 'piri_l', x: 0.35, y: 0.90, zone: 'gluteal', name: 'Piriforme Izq' },
  { id: 'piri_r', x: 0.65, y: 0.90, zone: 'gluteal', name: 'Piriforme Der' },
];

// Dotted spine line made of small segments
function DottedSpineLine() {
  const dots = [];
  const dotCount = 22;
  for (let i = 0; i < dotCount; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.spineDot,
          { top: `${2 + i * 4}%` },
        ]}
      />
    );
  }
  return <>{dots}</>;
}

function RippleEffect({ x, y, color, onComplete }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete?.());
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: x - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

function PainMeter({ painLevel = 50 }) {
  const [animatedWidth] = useState(new Animated.Value(painLevel));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: painLevel,
      duration: 500,
      useNativeDriver: false,
    }).start();

    if (painLevel > 60) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [painLevel]);

  const getColor = () => {
    if (painLevel < 30) return COLORS.green;
    if (painLevel < 60) return COLORS.orange;
    return COLORS.red;
  };

  return (
    <View style={styles.painMeterContainer}>
      <PixelText size="tiny" color={COLORS.gray} style={styles.painLabel}>
        {t('pain') || 'DOLOR'}
      </PixelText>
      <View style={styles.painMeterTrack}>
        {/* Gradient segments: red zone, orange zone, green zone */}
        <View style={styles.painGradientRed} />
        <View style={styles.painGradientOrange} />
        <View style={styles.painGradientGreen} />
        <Animated.View
          style={[
            styles.painMeterFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getColor(),
              transform: [{ scaleX: pulseAnim }],
            },
          ]}
        />
      </View>
      <PixelText size="tiny" color={getColor()} style={styles.painValue}>
        {painLevel}%
      </PixelText>
    </View>
  );
}

function AdjustmentEffect({ x, y, type, onComplete }) {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete?.());
  }, []);

  const isVertebra = type === 'vertebra';

  return (
    <Animated.View
      style={[
        styles.adjustmentEffect,
        {
          left: x - 15,
          top: y - 15,
          width: 30,
          height: 30,
          transform: [
            { scale },
            { rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', isVertebra ? '360deg' : '180deg'],
            })},
          ],
          opacity,
          backgroundColor: isVertebra ? COLORS.green + '88' : COLORS.accent + '88',
        },
      ]}
    >
      <PixelText size="small" color={COLORS.white}>
        {isVertebra ? '✓' : '↔'}
      </PixelText>
    </Animated.View>
  );
}

export default function SpineView({
  condition, selectedTool, selectedTechnique, onTreatmentProgress, onComplete, onMistake, skillLevel = 1
}) {
  const [problems, setProblems] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [totalProblems, setTotalProblems] = useState(0);

  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const comboTimerRef = useRef(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [adjustmentEffects, setAdjustmentEffects] = useState([]);
  const [painLevel, setPainLevel] = useState(80);
  const completedRef = useRef(false);
  const mistakeCountRef = useRef(0);
  const [treatmentTime, setTreatmentTime] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pendingEffectsRef = useRef([]);

  // Pulse animation for untreated problems
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Start treatment timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTreatmentTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [condition]);

  useEffect(() => {
    // Reset completion guard when condition changes (new patient)
    completedRef.current = false;
    mistakeCountRef.current = 0;

    const zones = condition.zones || ['lumbar'];
    const generatedProblems = [];

    // Difficulty scaling: higher skill = more problems per zone
    const extraProblems = Math.min(Math.floor((skillLevel - 1) / 2), 2); // 0 extra at level 1-2, 1 at 3-4, 2 at 5+

    zones.forEach(zone => {
      const zoneData = ZONES[zone];
      if (!zoneData) return;

      const baseVert = Math.floor(Math.random() * 2) + 1;
      const numVertProblems = Math.min(zoneData.vertebrae.length, baseVert + extraProblems);
      const shuffledVert = [...zoneData.vertebrae].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numVertProblems; i++) {
        generatedProblems.push({
          id: shuffledVert[i].id,
          type: 'vertebra',
          status: 'red',
          x: shuffledVert[i].x,
          y: shuffledVert[i].y,
          zone,
          label: `${t('subluxation')} ${shuffledVert[i].id}`,
        });
      }

      const zoneMuscles = MUSCLE_POINTS.filter(m => m.zone === zone);
      const baseMuscle = Math.floor(Math.random() * 2) + 1;
      const numMuscleProblems = Math.min(zoneMuscles.length, baseMuscle + extraProblems);
      const shuffledMuscles = [...zoneMuscles].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numMuscleProblems; i++) {
        const baseTaps = 4 + Math.min(extraProblems, 2); // More taps at higher difficulty
        generatedProblems.push({
          id: shuffledMuscles[i].id,
          type: 'muscle',
          tapsRemaining: baseTaps,
          x: shuffledMuscles[i].x,
          y: shuffledMuscles[i].y,
          zone,
          label: `${t('contracture')} ${shuffledMuscles[i].name}`,
        });
      }
    });

    setProblems(generatedProblems);
    setTotalProblems(generatedProblems.length);
    setPainLevel(80);
  }, [condition]);

  const addFloatingText = (text, posX, posY, color) => {
    const newFT = { id: Date.now() + Math.random(), text, x: posX, y: posY, color };
    setFloatingTexts(prev => [...prev, newFT]);
  };

  const removeFloatingText = (id) => {
    setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
  };

  const addRipple = (x, y, color) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y, color }]);
  };

  const removeRipple = (id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  const addAdjustmentEffect = (x, y, type) => {
    const id = Date.now() + Math.random();
    setAdjustmentEffects(prev => [...prev, { id, x, y, type }]);
  };

  const removeAdjustmentEffect = (id) => {
    setAdjustmentEffects(prev => prev.filter(e => e.id !== id));
  };

  const handleMaintainCombo = () => {
    setCombo(prev => {
      const newCombo = prev + 1;
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      return newCombo;
    });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);
  };

  const handleBreakCombo = () => {
    setCombo(0);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  };

  const handlePress = useCallback((problemId) => {
    // Guard: don't allow any more interaction after treatment is complete
    if (completedRef.current) return;

    // Collect side effects to run AFTER state update (avoids setState-during-render)
    const effects = [];

    setProblems(prevProblems => {
      const updatedProblems = prevProblems.map(p => {
        if (p.id !== problemId) return p;

        const pX = p.x * SPINE_WIDTH;
        const pY = p.y * SPINE_HEIGHT;

        if (p.type === 'muscle' && p.tapsRemaining > 0) {
          let damage = 1;
          if (selectedTool === 'ultrasound' || selectedTool === 'tens') damage = 2;
          else if (selectedTool === 'massageGun') damage = 4;
          damage = Math.max(1, Math.round(damage * (selectedTechnique?.damageMult || 1)));

          const newHealth = Math.max(0, p.tapsRemaining - damage);

          effects.push(() => {
            addFloatingText(`-${damage}`, pX + 20, pY - 20, COLORS.white);
            addRipple(pX, pY - 10, COLORS.accent);
            handleMaintainCombo();

            if (selectedTool === 'massageGun') soundManager.playToolMassageGun();
            else if (selectedTool === 'ultrasound') soundManager.playToolUltrasound();
            else if (selectedTool === 'tens') soundManager.playToolTens();
            else soundManager.playMuscleRelease();
          });

          if (newHealth === 0) {
            effects.push(() => {
              addAdjustmentEffect(pX, pY, 'muscle');
              addFloatingText(t('released') || "RELEASED", pX - 10, pY - 40, COLORS.green);
              setPainLevel(prev => Math.max(0, prev - 15));
            });
          }

          return { ...p, tapsRemaining: newHealth };
        }
        else if (p.type === 'vertebra' && p.status !== 'green') {
          effects.push(() => {
            if (selectedTool === 'activator') soundManager.playToolActivator();
            else soundManager.playCrack();
            handleMaintainCombo();
          });

          // Check zone restriction from technique
          if (selectedTechnique?.zoneRestriction && !selectedTechnique.zoneRestriction.includes(p.zone)) {
            const mult = selectedTechnique.wrongZoneMult || 0;
            if (mult === 0) {
              effects.push(() => {
                addFloatingText(t('wrongZone') || "WRONG ZONE", pX - 20, pY - 20, COLORS.orange);
                addRipple(pX, pY, COLORS.orange);
              });
              return p;
            }
          }

          if (p.status === 'red') {
            const techMult = selectedTechnique?.damageMult || 1;
            const yellowChance = Math.max(0, (0.5 - ((skillLevel - 1) * 0.2)) / techMult);
            const turnsYellow = Math.random() < yellowChance;

            if (turnsYellow) {
              effects.push(() => {
                addRipple(pX, pY, COLORS.accent);
                addFloatingText(t('almost') || "ALMOST...", pX - 10, pY - 20, COLORS.accent);
              });
              return { ...p, status: 'yellow' };
            } else {
              effects.push(() => {
                triggerScreenShake();
                addAdjustmentEffect(pX, pY, 'vertebra');
                addRipple(pX, pY, COLORS.green);
                addFloatingText(t('perfect') || "PERFECT!", pX - 20, pY - 30, COLORS.green);
                setPainLevel(prev => Math.max(0, prev - 20));
              });
              return { ...p, status: 'green' };
            }
          } else if (p.status === 'yellow') {
            effects.push(() => {
              triggerScreenShake();
              addAdjustmentEffect(pX, pY, 'vertebra');
              addRipple(pX, pY, COLORS.green);
              addFloatingText(t('corrected') || "CORRECTED", pX - 20, pY - 20, COLORS.green);
              setPainLevel(prev => Math.max(0, prev - 20));
            });
            return { ...p, status: 'green' };
          }
        }

        return p;
      });

      const fixedCount = updatedProblems.filter(p =>
        (p.type === 'muscle' && p.tapsRemaining === 0) ||
        (p.type === 'vertebra' && p.status === 'green')
      ).length;

      const progress = totalProblems > 0 ? fixedCount / totalProblems : 0;

      // Defer progress and completion callbacks
      effects.push(() => {
        onTreatmentProgress?.(progress, combo);
      });

      if (fixedCount === totalProblems && fixedCount > 0 && !completedRef.current) {
        completedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);

        const elapsedSeconds = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 60;
        const mistakes = mistakeCountRef.current;
        const finalPain = painLevel;

        const painScore = Math.max(0, 40 - (finalPain * 0.4));
        const comboScore = Math.min(25, maxCombo * 5);
        const speedScore = elapsedSeconds < 30 ? 20 : elapsedSeconds < 60 ? 15 : elapsedSeconds < 90 ? 10 : 5;
        const accuracyScore = Math.max(0, 15 - (mistakes * 5));

        const calculatedScore = Math.min(100, Math.round(painScore + comboScore + speedScore + accuracyScore));
        const isPerfect = mistakes === 0 && finalPain <= 10;

        effects.push(() => {
          setTimeout(() => {
            soundManager.playSuccess();
            if (isPerfect) {
              addFloatingText("⭐ PERFECT! ⭐", SPINE_WIDTH / 2 - 40, SPINE_HEIGHT / 2, COLORS.gold);
            }
            onComplete?.(calculatedScore, { isPerfect, time: elapsedSeconds, mistakes, maxCombo, finalPain });
          }, 500);
        });
      }

      // Store effects to be flushed after render
      pendingEffectsRef.current = effects;

      return updatedProblems;
    });

    // Flush side effects after setProblems (runs after the updater, outside React render)
    setTimeout(() => {
      const effects = pendingEffectsRef.current;
      pendingEffectsRef.current = [];
      effects.forEach(fn => fn());
    }, 0);
  }, [selectedTool, selectedTechnique, skillLevel, totalProblems, combo, maxCombo, painLevel]);

  const triggerScreenShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleOverlayPress = (e) => {
    // Guard: don't allow any interaction after treatment is complete
    if (completedRef.current) return;

    const { locationX, locationY } = e.nativeEvent;

    if (selectedTechnique?.blocksMistakes) {
      addFloatingText("~", locationX, locationY - 20, COLORS.orange);
      addRipple(locationX, locationY - 10, COLORS.orange);
      return;
    }

    mistakeCountRef.current += 1;
    soundManager.playWrongZone();
    soundManager.playPatientOuch();
    setFeedback({ text: t('ouch') || '¡AY!', type: 'fail' });
    addRipple(locationX, locationY - 10, COLORS.red);
    setPainLevel(prev => Math.min(100, prev + 5)); // Pain increases on mistakes

    handleBreakCombo();
    addFloatingText(t('miss') || "MISS", locationX, locationY - 20, COLORS.red);
    onMistake?.();

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();

    setTimeout(() => setFeedback(null), 1000);
  };

  const fixedCount = problems.filter(p =>
    (p.type === 'muscle' && p.tapsRemaining === 0) ||
    (p.type === 'vertebra' && p.status === 'green')
  ).length;
  const progress = totalProblems > 0 ? fixedCount / totalProblems : 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>

      {combo > 1 && (
        <View style={styles.comboDisplay}>
          <View style={styles.comboNote}>
            <PixelText size="large" color={COLORS.ink} style={{ textShadowColor: 'transparent' }}>
              {combo}x COMBO
            </PixelText>
          </View>
        </View>
      )}

      {selectedTechnique && selectedTechnique.id !== 'diversified' && (
        <View style={styles.techniqueIndicator}>
          <PixelText size="tiny" color={COLORS.secondary}>
            {selectedTechnique.icon} {t(selectedTechnique.nameKey)}
          </PixelText>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
          <View style={styles.timerBox}>
            <PixelText size="tiny" color={treatmentTime > 60 ? COLORS.orange : COLORS.green}>
              ⏱ {Math.floor(treatmentTime / 60)}:{(treatmentTime % 60).toString().padStart(2, '0')}
            </PixelText>
          </View>
        </View>
        <PixelText size="tiny" color={COLORS.grayDark}>
          {fixedCount}/{totalProblems} {t('problemsSolved')}
        </PixelText>
      </View>

      {/* Examination table outer container */}
      <View style={styles.tableOuter}>
        {/* Pillow at top */}
        <View style={styles.pillow} />

        <View style={styles.backView}>
          <View style={styles.bodyOutline}>
            {/* Shoulders line */}
            <View style={styles.shoulders} />
            {/* Dotted spine line */}
            <DottedSpineLine />
            {/* Hips line */}
            <View style={styles.hips} />

            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={handleOverlayPress}
            />

            <PixelText size="tiny" color={COLORS.grayDark} style={[styles.zoneLabel, { top: '5%', left: 4 }]}>C</PixelText>
            <PixelText size="tiny" color={COLORS.grayDark} style={[styles.zoneLabel, { top: '35%', left: 4 }]}>T</PixelText>
            <PixelText size="tiny" color={COLORS.grayDark} style={[styles.zoneLabel, { top: '65%', left: 4 }]}>L</PixelText>
            <PixelText size="tiny" color={COLORS.grayDark} style={[styles.zoneLabel, { top: '83%', left: 4 }]}>S</PixelText>

            {Object.values(ZONES).map(zone =>
              zone.vertebrae.map(v => (
                <View
                  key={`bg_${v.id}`}
                  style={[
                    styles.vertebraBg,
                    {
                      left: `${v.x * 100 - 3}%`,
                      top: `${v.y * 100 - 1}%`,
                    },
                  ]}
                />
              ))
            )}

            {ripples.map(r => (
              <RippleEffect
                key={r.id}
                x={r.x}
                y={r.y}
                color={r.color}
                onComplete={() => removeRipple(r.id)}
              />
            ))}

            {adjustmentEffects.map(e => (
              <AdjustmentEffect
                key={e.id}
                x={e.x}
                y={e.y}
                type={e.type}
                onComplete={() => removeAdjustmentEffect(e.id)}
              />
            ))}

            {problems.map(problem => {
              let isFixed = false;
              let bgColor = COLORS.inflamed;

              if (problem.type === 'muscle') {
                isFixed = problem.tapsRemaining === 0;
                bgColor = isFixed ? COLORS.healthy : COLORS.muscle;
              } else {
                isFixed = problem.status === 'green';
                if (problem.status === 'green') bgColor = COLORS.healthy;
                else if (problem.status === 'yellow') bgColor = COLORS.accent;
              }

              const isProblemVertebra = problem.type === 'vertebra';
              const size = isProblemVertebra ? 32 : 28;

              // Pulse animation for unfixed problems
              const problemContent = (
                <PixelText size="tiny" color={COLORS.white} center shadow={false}>
                  {isFixed ? '✓' : (isProblemVertebra ? '✕' : (problem.tapsRemaining.toString()))}
                </PixelText>
              );

              if (isFixed) {
                return (
                  <View
                    key={problem.id}
                    style={[
                      styles.problemPoint,
                      {
                        left: `${problem.x * 100 - (size / SPINE_WIDTH * 50)}%`,
                        top: `${problem.y * 100 - (size / SPINE_HEIGHT * 50)}%`,
                        width: size,
                        height: size,
                        backgroundColor: COLORS.accentDark,
                        borderColor: COLORS.accentLight,
                        opacity: 0.55,
                      },
                    ]}
                  >
                    {problemContent}
                  </View>
                );
              }

              return (
                <Animated.View
                  key={problem.id}
                  style={[
                    styles.problemPoint,
                    {
                      left: `${problem.x * 100 - (size / SPINE_WIDTH * 50)}%`,
                      top: `${problem.y * 100 - (size / SPINE_HEIGHT * 50)}%`,
                      width: size,
                      height: size,
                      backgroundColor: bgColor,
                      borderColor: COLORS.paperDark,
                      transform: [{ scale: pulseAnim }],
                      shadowColor: bgColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 4,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => handlePress(problem.id)}
                    activeOpacity={0.6}
                  >
                    {problemContent}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {floatingTexts.map(ft => (
              <FloatingText
                key={ft.id}
                text={ft.text}
                x={ft.x}
                y={ft.y}
                color={ft.color}
                onComplete={() => removeFloatingText(ft.id)}
              />
            ))}
          </View>
        </View>
      </View>

      <PainMeter painLevel={painLevel} />

      {feedback && (
        <View style={[styles.feedback, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackFail]}>
          <PixelText size="small" color={COLORS.white} center>
            {feedback.text}
          </PixelText>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.inflamed }]} />
          <PixelText size="tiny" color={COLORS.grayDark}>{t('subluxation') ? t('subluxation').substring(0, 5) + '.' : 'Sublx.'}</PixelText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <PixelText size="tiny" color={COLORS.grayDark}>{t('almost') ? t('almost').substring(0, 6) : 'Parcial'}</PixelText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.muscle }]} />
          <PixelText size="tiny" color={COLORS.grayDark}>{t('contracture') ? t('contracture').substring(0, 7) + '.' : 'Contract.'}</PixelText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  // Combo: post-it note style
  comboDisplay: {
    position: 'absolute',
    top: -44,
    zIndex: 50,
    alignItems: 'center',
  },
  comboNote: {
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    transform: [{ rotate: '-2deg' }],
    shadowColor: COLORS.dark,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // Technique indicator
  techniqueIndicator: {
    position: 'absolute',
    top: -22,
    right: 0,
    backgroundColor: COLORS.paperDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 40,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Progress bar area
  progressContainer: {
    width: SPINE_WIDTH,
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 4,
  },
  timerBox: {
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.desk,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  progressBar: {
    width: '100%',
    height: 14,
    backgroundColor: COLORS.deskDark,
    borderWidth: 2,
    borderColor: COLORS.desk,
    borderRadius: 7,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 7,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  // Examination table outer wrapper - medical table aesthetic
  tableOuter: {
    width: SPINE_WIDTH + 16,
    backgroundColor: '#ede4d3',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingBottom: 12,
    paddingTop: 10,
    borderWidth: 2,
    borderColor: '#d4c4a8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },

  // Pillow at the top of the examination table
  pillow: {
    width: SPINE_WIDTH * 0.55,
    height: 20,
    backgroundColor: '#f5f0e6',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#d8d0c0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Main back/body surface - warm skin with subtle gradient feel
  backView: {
    width: SPINE_WIDTH,
    height: SPINE_HEIGHT,
    backgroundColor: '#ffe8cc',
    borderWidth: 2,
    borderColor: '#d4b896',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bodyOutline: {
    flex: 1,
    position: 'relative',
  },

  // Shoulders: thicker, rounded
  shoulders: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    right: '15%',
    height: 6,
    backgroundColor: COLORS.skinDark,
    borderRadius: 4,
    opacity: 0.7,
  },

  // Dotted spine: individual small dots rendered by DottedSpineLine
  spineDot: {
    position: 'absolute',
    left: '49%',
    width: 5,
    height: 8,
    backgroundColor: COLORS.bone,
    borderRadius: 3,
    opacity: 0.55,
  },

  // Hips: thicker, rounded
  hips: {
    position: 'absolute',
    top: '80%',
    left: '25%',
    right: '25%',
    height: 6,
    backgroundColor: COLORS.skinDark,
    borderRadius: 4,
    opacity: 0.7,
  },

  // Vertebra background markers
  vertebraBg: {
    position: 'absolute',
    width: 20,
    height: 8,
    backgroundColor: COLORS.boneDark,
    opacity: 0.25,
    borderRadius: 3,
  },

  // Treatment zone dots (problem points) - bigger and more visible
  problemPoint: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  ripple: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 20,
  },
  adjustmentEffect: {
    position: 'absolute',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },

  // Pain meter
  painMeterContainer: {
    width: SPINE_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  painLabel: {
    width: 40,
  },
  painMeterTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.paperDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  // Gradient hint layers (behind the fill, show through when fill is narrow)
  painGradientRed: {
    position: 'absolute',
    left: '67%',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.red,
    opacity: 0.18,
  },
  painGradientOrange: {
    position: 'absolute',
    left: '33%',
    right: '33%',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.orange,
    opacity: 0.18,
  },
  painGradientGreen: {
    position: 'absolute',
    left: 0,
    right: '67%',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.green,
    opacity: 0.18,
  },
  painMeterFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    transformOrigin: 'left',
  },
  painValue: {
    width: 35,
    textAlign: 'right',
  },

  // Feedback banner
  feedback: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    padding: 8,
    borderWidth: 1.5,
    borderRadius: 6,
    zIndex: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackSuccess: {
    backgroundColor: COLORS.accentDark,
    borderColor: COLORS.accentLight,
  },
  feedbackFail: {
    backgroundColor: COLORS.redDark,
    borderColor: COLORS.red,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SPINE_WIDTH,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },

  zoneLabel: {
    position: 'absolute',
    zIndex: 5,
  },
});
