import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import FloatingText from './FloatingText';
import soundManager from '../utils/soundManager';
import {
  getAnomaliesForCondition,
  XRAY_COLORS,
  generateXRaySpine,
} from '../data/xrayAnomalies';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const XRAY_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
const XRAY_HEIGHT = XRAY_WIDTH * 1.6;
const GAME_DURATION = 20;
const MAX_ATTEMPTS = 3;
const HIT_RADIUS = 0.08;
const BONUS_PER_ANOMALY = 0.10;

export default function XRayMiniGame({ condition, onComplete, onSkip, skillLevel = 1 }) {
  const [phase, setPhase] = useState('playing'); // playing | results
  const [timer, setTimer] = useState(GAME_DURATION);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [foundIndices, setFoundIndices] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [flashColor, setFlashColor] = useState(null);

  const anomaliesRef = useRef([]);
  const spineRef = useRef([]);
  const timerRef = useRef(null);
  const floatIdRef = useRef(0);
  const scanlineAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate spine and anomalies on mount
  useEffect(() => {
    spineRef.current = generateXRaySpine(XRAY_WIDTH, XRAY_HEIGHT);
    anomaliesRef.current = getAnomaliesForCondition(condition);
  }, [condition]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Scanline animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Pulse animation for found anomalies
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const finishGame = useCallback(() => {
    setPhase('results');
    clearInterval(timerRef.current);
  }, []);

  const triggerFlash = useCallback((color) => {
    setFlashColor(color);
    flashAnim.setValue(0.4);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlashColor(null));
  }, []);

  const addFloatingText = useCallback((text, x, y, color) => {
    const id = ++floatIdRef.current;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
  }, []);

  const removeFloatingText = useCallback((id) => {
    setFloatingTexts(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleTap = useCallback((evt) => {
    if (phase !== 'playing' || attemptsLeft <= 0) return;

    const { locationX, locationY } = evt.nativeEvent;
    const normX = locationX / XRAY_WIDTH;
    const normY = locationY / XRAY_HEIGHT;

    const anomalies = anomaliesRef.current;
    let hitIndex = -1;

    for (let i = 0; i < anomalies.length; i++) {
      if (foundIndices.includes(i)) continue;
      const a = anomalies[i];
      const dx = normX - a.x;
      const dy = normY - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= HIT_RADIUS) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex >= 0) {
      // Correct hit
      const newFound = [...foundIndices, hitIndex];
      setFoundIndices(newFound);
      soundManager.playSuccess();
      triggerFlash('#4a9e5c');
      addFloatingText('+10%', locationX - 20, locationY - 30, COLORS.green);

      // Check if all found
      if (newFound.length >= anomalies.length) {
        setTimeout(() => finishGame(), 500);
      }
    } else {
      // Miss
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      soundManager.playError();
      triggerFlash('#c1374f');
      addFloatingText('FALLO', locationX - 20, locationY - 30, COLORS.red);

      if (newAttempts <= 0) {
        setTimeout(() => finishGame(), 500);
      }
    }
  }, [phase, attemptsLeft, foundIndices, finishGame, triggerFlash, addFloatingText]);

  const handleFinish = useCallback(() => {
    const anomalies = anomaliesRef.current;
    const total = anomalies.length;
    const found = foundIndices.length;
    const perfectDiagnosis = found >= total && total > 0;
    const bonus = Math.min(0.40, found * BONUS_PER_ANOMALY);
    onComplete({ found, total, bonus, perfectDiagnosis });
  }, [foundIndices, onComplete]);

  // Compute anomaly visual modifications for spine rendering
  const getVertebraStyle = useCallback((vert, index) => {
    const anomalies = anomaliesRef.current;
    const style = {};

    for (const anomaly of anomalies) {
      // Match vertebra by proximity in Y
      const vertNormY = vert.normalizedY;
      const dy = Math.abs(vertNormY - anomaly.y);
      if (dy > 0.04) continue;

      switch (anomaly.renderHint) {
        case 'offset':
          // Misalignment: shift vertebra left or right
          style.translateX = (anomaly.x > 0.5 ? 1 : -1) * 3;
          break;
        case 'narrow_gap':
          // Disc narrowing: reduce margin below
          style.marginBottom = -2;
          break;
        case 'spur':
          // Osteophyte: make vertebra slightly wider on one side
          style.extraWidth = 4;
          style.spurSide = anomaly.x > 0.5 ? 'right' : 'left';
          break;
        case 'curve':
          // Curvature: offset based on sine pattern
          style.translateX = Math.sin((vertNormY - anomaly.y) * 80) * 3;
          break;
        case 'crack':
          // Fracture: dark line
          style.hasCrack = true;
          break;
        case 'slide':
          // Spondylolisthesis: shift forward (horizontal)
          style.translateX = 4;
          break;
        default:
          break;
      }
    }

    return style;
  }, []);

  // Render a single vertebra
  const renderVertebra = useCallback((vert, index) => {
    const mods = getVertebraStyle(vert, index);
    const tx = mods.translateX || 0;
    const extraW = mods.extraWidth || 0;
    const spurSide = mods.spurSide;

    return (
      <View
        key={vert.id}
        style={[
          styles.vertebra,
          {
            left: vert.x + tx - (spurSide === 'left' ? extraW : 0),
            top: vert.y,
            width: vert.width + extraW,
            height: vert.height,
            borderRadius: Math.max(2, vert.height * 0.3),
            marginBottom: mods.marginBottom || 0,
          },
        ]}
      >
        {/* Bone highlight (top edge) */}
        <View style={[styles.boneHighlight, { borderRadius: Math.max(1, vert.height * 0.3) }]} />
        {/* Bone shadow (bottom edge) */}
        <View style={[styles.boneShadow, { borderRadius: Math.max(1, vert.height * 0.3) }]} />
        {/* Fracture line */}
        {mods.hasCrack && (
          <View style={styles.fractureLine} />
        )}
      </View>
    );
  }, [getVertebraStyle]);

  // Render found anomaly markers (green rings)
  const renderFoundMarkers = useCallback(() => {
    const anomalies = anomaliesRef.current;
    return foundIndices.map(i => {
      const a = anomalies[i];
      if (!a) return null;
      const cx = a.x * XRAY_WIDTH;
      const cy = a.y * XRAY_HEIGHT;
      const r = HIT_RADIUS * XRAY_WIDTH;
      return (
        <Animated.View
          key={`found-${i}`}
          style={[
            styles.foundMarker,
            {
              left: cx - r,
              top: cy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              transform: [{ scale: pulseAnim }],
            },
          ]}
          pointerEvents="none"
        />
      );
    });
  }, [foundIndices, pulseAnim]);

  // Results screen
  if (phase === 'results') {
    const anomalies = anomaliesRef.current;
    const total = anomalies.length;
    const found = foundIndices.length;
    const perfectDiagnosis = found >= total && total > 0;
    const bonus = Math.min(0.40, found * BONUS_PER_ANOMALY);
    const bonusPct = Math.round(bonus * 100);

    return (
      <View style={styles.container}>
        <View style={styles.resultsCard}>
          <PixelText size="large" color={COLORS.primary} center>
            RESULTADOS
          </PixelText>

          <View style={styles.resultRow}>
            <PixelText size="medium" color={COLORS.white}>
              Hallazgos:
            </PixelText>
            <PixelText size="medium" color={found >= total ? COLORS.green : COLORS.gold}>
              {found} / {total}
            </PixelText>
          </View>

          <View style={styles.resultRow}>
            <PixelText size="medium" color={COLORS.white}>
              Bonus:
            </PixelText>
            <PixelText size="medium" color={COLORS.gold} glow>
              +{bonusPct}%
            </PixelText>
          </View>

          {perfectDiagnosis && (
            <View style={styles.perfectBanner}>
              <PixelText size="medium" color={COLORS.gold} glow center>
                DIAGNOSTICO PERFECTO
              </PixelText>
            </View>
          )}

          {/* Show what was missed */}
          {found < total && (
            <View style={styles.missedSection}>
              <PixelText size="small" color={COLORS.grayLight} center>
                No encontradas:
              </PixelText>
              {anomalies.map((a, i) => {
                if (foundIndices.includes(i)) return null;
                return (
                  <PixelText key={i} size="small" color={COLORS.red} center>
                    {a.icon} {a.name} ({a.vertebra})
                  </PixelText>
                );
              })}
            </View>
          )}

          <View style={styles.resultsButtons}>
            <PixelButton
              title="CONTINUAR"
              onPress={handleFinish}
              variant="primary"
            />
          </View>
        </View>
      </View>
    );
  }

  // Playing phase
  const spine = spineRef.current;
  const anomalies = anomaliesRef.current;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <PixelText size="medium" color={COLORS.primary} glow center>
          RADIOGRAFIA
        </PixelText>
        <View style={styles.headerInfo}>
          <View style={styles.timerBox}>
            <PixelText size="small" color={timer <= 5 ? COLORS.red : COLORS.white}>
              {timer}s
            </PixelText>
          </View>
          <View style={styles.attemptsBox}>
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.attemptDot,
                  i < attemptsLeft ? styles.attemptActive : styles.attemptUsed,
                ]}
              />
            ))}
          </View>
          <PixelText size="tiny" color={COLORS.grayLight}>
            {foundIndices.length}/{anomalies.length}
          </PixelText>
        </View>
      </View>

      {/* X-Ray View */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={styles.xrayContainer}
      >
        <View style={styles.xrayView}>
          {/* Vertebrae */}
          {spine.map((vert, i) => renderVertebra(vert, i))}

          {/* Disc spaces (between consecutive vertebrae) */}
          {spine.map((vert, i) => {
            if (i >= spine.length - 1) return null;
            const next = spine[i + 1];
            const discTop = vert.y + vert.height;
            const discHeight = next.y - discTop;
            if (discHeight <= 0) return null;
            const discWidth = Math.min(vert.width, next.width) * 0.7;
            const discX = (XRAY_WIDTH / 2) - (discWidth / 2);
            return (
              <View
                key={`disc-${i}`}
                style={[
                  styles.disc,
                  {
                    left: discX,
                    top: discTop,
                    width: discWidth,
                    height: Math.max(1, discHeight * 0.4),
                    borderRadius: 1,
                  },
                ]}
              />
            );
          })}

          {/* Found anomaly glow markers */}
          {renderFoundMarkers()}

          {/* Scanline effect */}
          <Animated.View
            style={[
              styles.scanline,
              {
                transform: [
                  {
                    translateY: scanlineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, XRAY_HEIGHT],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          {/* Subtle horizontal scanlines pattern */}
          {Array.from({ length: Math.floor(XRAY_HEIGHT / 4) }).map((_, i) => (
            <View
              key={`sl-${i}`}
              style={[
                styles.scanlineRow,
                { top: i * 4 },
              ]}
              pointerEvents="none"
            />
          ))}

          {/* Flash overlay */}
          {flashColor && (
            <Animated.View
              style={[
                styles.flashOverlay,
                {
                  backgroundColor: flashColor,
                  opacity: flashAnim,
                },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Floating texts */}
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
      </TouchableOpacity>

      {/* Instructions / hint */}
      <PixelText size="tiny" color={COLORS.grayLight} center style={styles.hint}>
        Toca las anomalias en la radiografia
      </PixelText>

      {/* Skip button */}
      <PixelButton
        title="OMITIR"
        onPress={onSkip}
        small
        color={COLORS.grayDark}
        textColor={COLORS.grayLight}
        style={styles.skipButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: XRAY_COLORS.background,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timerBox: {
    backgroundColor: XRAY_COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.grayDark,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  attemptsBox: {
    flexDirection: 'row',
    gap: 6,
  },
  attemptDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  attemptActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.greenDark,
  },
  attemptUsed: {
    backgroundColor: COLORS.redDark,
    borderColor: COLORS.red,
    opacity: 0.4,
  },
  xrayContainer: {
    width: XRAY_WIDTH,
    height: XRAY_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.grayDark,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xrayView: {
    width: XRAY_WIDTH,
    height: XRAY_HEIGHT,
    backgroundColor: XRAY_COLORS.background,
    position: 'relative',
  },
  vertebra: {
    position: 'absolute',
    backgroundColor: XRAY_COLORS.bone,
    shadowColor: XRAY_COLORS.boneHighlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  boneHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: XRAY_COLORS.boneHighlight,
    opacity: 0.4,
  },
  boneShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: XRAY_COLORS.boneShadow,
    opacity: 0.3,
  },
  fractureLine: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: XRAY_COLORS.background,
    opacity: 0.7,
    transform: [{ rotate: '-15deg' }],
  },
  disc: {
    position: 'absolute',
    backgroundColor: XRAY_COLORS.disc,
    opacity: 0.5,
  },
  foundMarker: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.green,
    backgroundColor: 'rgba(74, 158, 92, 0.12)',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(100, 180, 255, 0.15)',
  },
  scanlineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hint: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  skipButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  // Results styles
  resultsCard: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  perfectBanner: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(232, 168, 48, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 6,
  },
  missedSection: {
    marginTop: 16,
    paddingVertical: 8,
    gap: 4,
  },
  resultsButtons: {
    marginTop: 24,
    alignItems: 'center',
  },
});
