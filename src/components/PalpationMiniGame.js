import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import { t } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Reserve space for zone labels (36px), sensitivity meter (30px), padding (16px), gaps (12px)
const LABEL_COL_WIDTH = 36;
const METER_COL_WIDTH = 30;
const HORIZONTAL_RESERVED = 16 + LABEL_COL_WIDTH + METER_COL_WIDTH + 12;
const SPINE_WIDTH = Math.min(SCREEN_WIDTH - HORIZONTAL_RESERVED, 300);
const SPINE_HEIGHT = Math.min(440, SPINE_WIDTH * 1.55); // keep aspect ratio on small screens
const TOTAL_TIME = 15;

// Zone definitions with Y ranges (normalized 0-1), colors, and vertebrae counts
const ZONE_CONFIG = {
  cervical: {
    yMin: 0.02,
    yMax: 0.18,
    color: '#5B8DEE',
    colorLight: '#8BB4FF',
    label: 'C1-C7',
    vertebrae: 7,
  },
  thoracic: {
    yMin: 0.20,
    yMax: 0.58,
    color: '#10B981',
    colorLight: '#34D399',
    label: 'T1-T12',
    vertebrae: 12,
  },
  lumbar: {
    yMin: 0.60,
    yMax: 0.80,
    color: '#D4731A',
    colorLight: '#E8943A',
    label: 'L1-L5',
    vertebrae: 5,
  },
  gluteal: {
    yMin: 0.82,
    yMax: 0.96,
    color: '#64748B',
    colorLight: '#94A3B8',
    label: 'S/Cx',
    vertebrae: 3,
  },
};

// Generate hotspot positions for affected zones
function generateHotspots(zones) {
  const hotspots = [];
  if (!zones || zones.length === 0) return hotspots;

  zones.forEach((zone) => {
    const config = ZONE_CONFIG[zone];
    if (!config) return;

    // 3-5 hotspots per zone depending on zone size
    const ySpan = config.yMax - config.yMin;
    const count = ySpan > 0.25 ? 5 : ySpan > 0.15 ? 4 : 3;

    for (let i = 0; i < count; i++) {
      const yFraction = (i + 0.5) / count;
      const y = config.yMin + ySpan * yFraction;
      // Scatter horizontally around the spine center (0.35 - 0.65)
      const xOffset = (Math.random() - 0.5) * 0.28;
      const x = 0.50 + xOffset;

      hotspots.push({
        id: `${zone}_${i}`,
        zone,
        x,
        y,
        found: false,
      });
    }
  });

  return hotspots;
}

// Euclidean distance with aspect-ratio correction
function dist(x1, y1, x2, y2) {
  const dx = (x1 - x2);
  const dy = (y1 - y2) * (SPINE_HEIGHT / SPINE_WIDTH);
  return Math.sqrt(dx * dx + dy * dy);
}

const HIT_RADIUS = 0.12;
const NEAR_RADIUS = 0.25;
const WARM_RADIUS = 0.45;

export default function PalpationMiniGame({ condition, onComplete, onSkip }) {
  const zones = condition?.zones || ['lumbar'];
  const [hotspots, setHotspots] = useState(() => generateHotspots(zones));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [fingerPos, setFingerPos] = useState(null);
  const [marks, setMarks] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const backLayoutRef = useRef({ width: SPINE_WIDTH, height: SPINE_HEIGHT });

  // Animated values
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const foundScaleAnims = useRef({});

  // Pulsing glow loop
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver]);

  // Timer bar animation
  useEffect(() => {
    Animated.timing(timerBarAnim, {
      toValue: timeLeft / TOTAL_TIME,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Compute closest distance to any unfound hotspot
  const getClosestInfo = useCallback(
    (nx, ny) => {
      let minD = Infinity;
      let closestHotspot = null;
      hotspots.forEach((h) => {
        if (h.found) return;
        const d = dist(nx, ny, h.x, h.y);
        if (d < minD) {
          minD = d;
          closestHotspot = h;
        }
      });
      return { distance: minD, hotspot: closestHotspot };
    },
    [hotspots]
  );

  // Update glow intensity when finger moves
  useEffect(() => {
    if (!fingerPos || gameOver) {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      return;
    }

    const { distance } = getClosestInfo(fingerPos.x, fingerPos.y);
    let intensity = 0;

    if (distance <= HIT_RADIUS) {
      intensity = 1;
      // Shake feedback when very close
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 4, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -2, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 35, useNativeDriver: true }),
      ]).start();
    } else if (distance <= NEAR_RADIUS) {
      intensity = 0.65;
    } else if (distance <= WARM_RADIUS) {
      intensity = 0.3;
    } else {
      intensity = 0.05;
    }

    Animated.timing(glowAnim, {
      toValue: intensity,
      duration: 120,
      useNativeDriver: false,
    }).start();
  }, [fingerPos, gameOver, getClosestInfo]);

  const endGame = useCallback(() => {
    if (gameOver) return;
    setGameOver(true);
    setFingerPos(null);

    // Short delay then show results
    setTimeout(() => {
      setShowResults(true);
    }, 400);
  }, [gameOver]);

  // Auto-end when all hotspots found
  useEffect(() => {
    if (!gameOver && hotspots.length > 0 && hotspots.every((h) => h.found)) {
      endGame();
    }
  }, [hotspots, gameOver, endGame]);

  const handleTap = useCallback(
    (nx, ny) => {
      if (gameOver) return;

      const { distance, hotspot } = getClosestInfo(nx, ny);

      if (hotspot && distance <= HIT_RADIUS) {
        // Found a hotspot!
        const animVal = new Animated.Value(0);
        foundScaleAnims.current[hotspot.id] = animVal;
        Animated.spring(animVal, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }).start();

        setHotspots((prev) =>
          prev.map((h) => (h.id === hotspot.id ? { ...h, found: true } : h))
        );
        setMarks((prev) => [...prev, { x: hotspot.x, y: hotspot.y, hit: true, zone: hotspot.zone, hotspotId: hotspot.id }]);
      } else {
        // Miss - just mark it, no penalty (encourage exploration)
        setMarks((prev) => [...prev, { x: nx, y: ny, hit: false, zone: null }]);
      }
    },
    [gameOver, getClosestInfo]
  );

  // Touch handlers
  const handleResponderMove = useCallback(
    (evt) => {
      if (gameOver) return;
      const touch = evt.nativeEvent;
      const layout = backLayoutRef.current;
      const nx = touch.locationX / layout.width;
      const ny = touch.locationY / layout.height;
      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        setFingerPos({ x: nx, y: ny });
      }
    },
    [gameOver]
  );

  const handleResponderRelease = useCallback(
    (evt) => {
      if (gameOver) return;
      const touch = evt.nativeEvent;
      const layout = backLayoutRef.current;
      const nx = touch.locationX / layout.width;
      const ny = touch.locationY / layout.height;
      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        handleTap(nx, ny);
      }
      setFingerPos(null);
    },
    [gameOver, handleTap]
  );

  const onBackLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    backLayoutRef.current = { width, height };
  }, []);

  const foundCount = hotspots.filter((h) => h.found).length;
  const totalCount = hotspots.length;
  const revealedZones = [...new Set(hotspots.filter((h) => h.found).map((h) => h.zone))];

  // Warmth gradient overlay color
  const warmthColor = glowAnim.interpolate({
    inputRange: [0, 0.3, 0.65, 1],
    outputRange: [
      'rgba(68,136,204,0.0)',   // cold - transparent
      'rgba(221,170,34,0.15)',  // warm - yellow tint
      'rgba(221,120,34,0.30)',  // warmer - orange tint
      'rgba(204,51,51,0.45)',   // hot - red tint
    ],
  });

  // Finger glow radius
  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 70],
  });

  // Handle results completion
  const handleFinish = useCallback(() => {
    const bonus = totalCount > 0
      ? Math.round((foundCount / totalCount) * 0.3 * 100) / 100
      : 0;
    onComplete?.({
      bonus,
      revealedZones,
      found: foundCount,
      total: totalCount,
    });
  }, [foundCount, totalCount, revealedZones, onComplete]);

  // Render vertebrae column
  const renderSpine = () => {
    const vertebrae = [];
    const allVertebrae = [];

    Object.entries(ZONE_CONFIG).forEach(([zoneName, config]) => {
      const totalHeight = config.yMax - config.yMin;
      const vHeight = totalHeight / config.vertebrae;

      for (let i = 0; i < config.vertebrae; i++) {
        const yPos = config.yMin + i * vHeight;
        const isAffected = zones.includes(zoneName);

        allVertebrae.push({
          key: `${zoneName}_v${i}`,
          yPos,
          height: vHeight,
          color: config.color,
          colorLight: config.colorLight,
          isAffected,
          zoneName,
        });
      }
    });

    return allVertebrae.map((v) => (
      <View
        key={v.key}
        style={[
          styles.vertebra,
          {
            top: `${v.yPos * 100}%`,
            height: `${v.height * 100 - 0.4}%`,
            backgroundColor: v.isAffected ? v.color + '35' : COLORS.boneDark + '40',
            borderColor: v.isAffected ? v.color + '60' : COLORS.boneDark + '50',
          },
        ]}
      />
    ));
  };

  // Render zone labels on the left side
  const renderZoneLabels = () => {
    return Object.entries(ZONE_CONFIG).map(([zoneName, config]) => {
      const yCenter = ((config.yMin + config.yMax) / 2) * 100;
      const isAffected = zones.includes(zoneName);

      return (
        <View
          key={zoneName}
          style={[
            styles.zoneLabel,
            {
              top: `${yCenter}%`,
              backgroundColor: isAffected ? config.color + '30' : 'transparent',
              borderColor: isAffected ? config.color : COLORS.grayDark,
            },
          ]}
        >
          <PixelText
            size="tiny"
            color={isAffected ? config.colorLight : COLORS.grayDark}
          >
            {config.label}
          </PixelText>
        </View>
      );
    });
  };

  // Render zone background bands
  const renderZoneBands = () => {
    return Object.entries(ZONE_CONFIG).map(([zoneName, config]) => {
      const isAffected = zones.includes(zoneName);
      return (
        <View
          key={`band_${zoneName}`}
          style={[
            styles.zoneBand,
            {
              top: `${config.yMin * 100}%`,
              height: `${(config.yMax - config.yMin) * 100}%`,
              backgroundColor: isAffected ? config.color + '08' : 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: COLORS.skinDark + '30',
            },
          ]}
        />
      );
    });
  };

  // Results screen
  if (showResults) {
    const bonus = totalCount > 0
      ? Math.round((foundCount / totalCount) * 0.3 * 100) / 100
      : 0;
    const bonusPercent = Math.round(bonus * 100);
    const isPerfect = foundCount === totalCount;

    return (
      <View style={styles.container}>
        <View style={styles.resultsCard}>
          <PixelText size="large" color={COLORS.primary} center>
            {t('palpation')}
          </PixelText>

          <View style={styles.resultsDivider} />

          {/* Score display */}
          <View style={styles.resultsScoreRow}>
            <PixelText size="xlarge" color={isPerfect ? COLORS.gold : COLORS.white} center glow={isPerfect}>
              {foundCount}/{totalCount}
            </PixelText>
          </View>

          <PixelText size="small" color={COLORS.grayLight} center style={styles.resultsLine}>
            {t('found')}
          </PixelText>

          {/* Zone breakdown */}
          <View style={styles.zoneBreakdown}>
            {zones.map((zoneName) => {
              const zoneHotspots = hotspots.filter((h) => h.zone === zoneName);
              const zoneFound = zoneHotspots.filter((h) => h.found).length;
              const zoneTotal = zoneHotspots.length;
              const config = ZONE_CONFIG[zoneName];
              const allFound = zoneFound === zoneTotal;

              return (
                <View key={zoneName} style={styles.zoneResultRow}>
                  <View
                    style={[
                      styles.zoneResultDot,
                      { backgroundColor: config?.color || COLORS.gray },
                    ]}
                  />
                  <PixelText
                    size="small"
                    color={allFound ? COLORS.green : COLORS.grayLight}
                    style={styles.zoneResultLabel}
                  >
                    {config?.label || zoneName}
                  </PixelText>
                  <PixelText
                    size="small"
                    color={allFound ? COLORS.green : COLORS.red}
                  >
                    {zoneFound}/{zoneTotal}
                  </PixelText>
                </View>
              );
            })}
          </View>

          <View style={styles.resultsDivider} />

          {/* Bonus */}
          <View style={styles.bonusRow}>
            <PixelText size="medium" color={bonusPercent > 0 ? COLORS.green : COLORS.red} center>
              {t('bonus')}: +{bonusPercent}%
            </PixelText>
          </View>

          {isPerfect && (
            <PixelText size="small" color={COLORS.gold} center glow style={styles.resultsLine}>
              PERFECTO!
            </PixelText>
          )}

          {timeLeft <= 0 && !isPerfect && (
            <PixelText size="small" color={COLORS.orange} center style={styles.resultsLine}>
              {t('sensitivity')}: {Math.round((foundCount / totalCount) * 100)}%
            </PixelText>
          )}

          <View style={styles.resultsButtons}>
            <PixelButton
              title={t('next')}
              onPress={handleFinish}
              variant="primary"
            />
          </View>
        </View>
      </View>
    );
  }

  // Timer bar color
  const timerBarWidth = timerBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const timerBarColor = timerBarAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [COLORS.red, COLORS.orange, COLORS.primary, COLORS.green],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <PixelText size="medium" color={COLORS.primary} center>
          {t('palpation')}
        </PixelText>
        <PixelText size="tiny" color={COLORS.grayLight} center style={{ marginTop: 2 }}>
          {t('palpate')}
        </PixelText>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBarContainer}>
        <Animated.View
          style={[
            styles.timerBarFill,
            {
              width: timerBarWidth,
              backgroundColor: timerBarColor,
            },
          ]}
        />
        <View style={styles.timerTextOverlay}>
          <PixelText size="tiny" color={timeLeft <= 5 ? COLORS.red : COLORS.white}>
            {timeLeft}s
          </PixelText>
          <PixelText size="tiny" color={COLORS.white}>
            {foundCount}/{totalCount}
          </PixelText>
        </View>
      </View>

      {/* Main game area */}
      <View style={styles.gameArea}>
        {/* Zone labels */}
        <View style={styles.zoneLabelColumn}>
          {renderZoneLabels()}
        </View>

        {/* Back body with touch detection */}
        <Animated.View
          style={[
            styles.backBody,
            { transform: [{ translateX: shakeAnim }] },
          ]}
          onLayout={onBackLayout}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderMove={handleResponderMove}
          onResponderRelease={handleResponderRelease}
        >
          {/* Skin base */}
          <View style={styles.skinBase}>
            {/* Zone background bands */}
            {renderZoneBands()}

            {/* Shoulder curves */}
            <View style={styles.shoulderLeft} />
            <View style={styles.shoulderRight} />

            {/* Waist curves */}
            <View style={styles.waistLeft} />
            <View style={styles.waistRight} />

            {/* Spine vertebrae column */}
            {renderSpine()}

            {/* Spine center line */}
            {Array.from({ length: 24 }).map((_, i) => (
              <View
                key={`dot_${i}`}
                style={[
                  styles.spineDot,
                  { top: `${2 + i * 4}%` },
                ]}
              />
            ))}
          </View>

          {/* Warmth gradient overlay */}
          {fingerPos && (
            <Animated.View
              style={[
                styles.warmthOverlay,
                { backgroundColor: warmthColor },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Finger glow indicator */}
          {fingerPos && (
            <Animated.View
              style={[
                styles.fingerGlow,
                {
                  left: fingerPos.x * SPINE_WIDTH - 35,
                  top: fingerPos.y * SPINE_HEIGHT - 35,
                  transform: [{ scale: glowPulse }],
                  opacity: glowAnim,
                },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Finger crosshair */}
          {fingerPos && (
            <View
              style={[
                styles.fingerCrosshair,
                {
                  left: fingerPos.x * SPINE_WIDTH - 12,
                  top: fingerPos.y * SPINE_HEIGHT - 12,
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </View>
          )}

          {/* Marks (found and missed) */}
          {marks.map((m, i) => {
            const config = m.zone ? ZONE_CONFIG[m.zone] : null;

            if (m.hit) {
              const scaleAnim = foundScaleAnims.current[m.hotspotId] || new Animated.Value(1);

              return (
                <Animated.View
                  key={`mark_${i}`}
                  style={[
                    styles.foundMark,
                    {
                      left: m.x * SPINE_WIDTH - 16,
                      top: m.y * SPINE_HEIGHT - 16,
                      borderColor: config?.color || COLORS.green,
                      backgroundColor: (config?.color || COLORS.green) + '30',
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <View style={[styles.foundDot, { backgroundColor: config?.color || COLORS.green }]} />
                </Animated.View>
              );
            }

            return (
              <View
                key={`mark_${i}`}
                style={[
                  styles.missMark,
                  {
                    left: m.x * SPINE_WIDTH - 6,
                    top: m.y * SPINE_HEIGHT - 6,
                  },
                ]}
              />
            );
          })}

          {/* Found text popups */}
          {marks
            .filter((m) => m.hit)
            .map((m, i) => (
              <View
                key={`found_text_${i}`}
                style={[
                  styles.foundTextBubble,
                  {
                    left: m.x * SPINE_WIDTH + 18,
                    top: m.y * SPINE_HEIGHT - 10,
                  },
                ]}
                pointerEvents="none"
              >
                <PixelText size="tiny" color={COLORS.green}>
                  {t('found')}!
                </PixelText>
              </View>
            ))}
        </Animated.View>

        {/* Sensitivity meter */}
        <View style={styles.meterContainer}>
          <PixelText size="tiny" color={COLORS.red} center>
            HOT
          </PixelText>
          <View style={styles.meterTrack}>
            <Animated.View
              style={[
                styles.meterFill,
                {
                  height: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['5%', '100%'],
                  }),
                  backgroundColor: glowAnim.interpolate({
                    inputRange: [0, 0.3, 0.65, 1],
                    outputRange: ['#4488cc', '#88aa44', '#ddaa22', '#cc3333'],
                  }),
                },
              ]}
            />
            {/* Meter tick marks */}
            {[0.25, 0.5, 0.75].map((pos) => (
              <View
                key={`tick_${pos}`}
                style={[styles.meterTick, { bottom: `${pos * 100}%` }]}
              />
            ))}
          </View>
          <PixelText size="tiny" color={COLORS.primary} center>
            COLD
          </PixelText>
          <View style={styles.meterSensLabel}>
            <PixelText size="tiny" color={COLORS.grayLight} center>
              {t('sensitivity')}
            </PixelText>
          </View>
        </View>
      </View>

      {/* Footer with skip */}
      <View style={styles.footer}>
        <PixelButton
          title={t('skip')}
          onPress={onSkip}
          small
          color={COLORS.grayDark}
          textColor={COLORS.grayLight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.deskDark,
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },

  // Timer bar
  timerBarContainer: {
    width: '100%',
    height: 22,
    backgroundColor: COLORS.bgDark,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.bgLight,
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
  },
  timerBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  timerTextOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  // Game area
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  // Zone label column (left side)
  zoneLabelColumn: {
    width: LABEL_COL_WIDTH,
    height: SPINE_HEIGHT,
    position: 'relative',
  },
  zoneLabel: {
    position: 'absolute',
    left: 0,
    transform: [{ translateY: -12 }],
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
  },

  // Back body
  backBody: {
    width: SPINE_WIDTH,
    height: SPINE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.skinDark,
    position: 'relative',
  },
  skinBase: {
    flex: 1,
    backgroundColor: COLORS.skin,
    position: 'relative',
  },

  // Zone bands
  zoneBand: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

  // Spine vertebrae
  vertebra: {
    position: 'absolute',
    left: '40%',
    width: '20%',
    borderRadius: 3,
    borderWidth: 1,
  },

  // Spine center dots
  spineDot: {
    position: 'absolute',
    left: '49%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.skinDark,
    opacity: 0.5,
  },

  // Body shape details
  shoulderLeft: {
    position: 'absolute',
    top: '4%',
    left: 0,
    width: '22%',
    height: '13%',
    backgroundColor: COLORS.skinDark,
    opacity: 0.12,
    borderBottomRightRadius: 35,
  },
  shoulderRight: {
    position: 'absolute',
    top: '4%',
    right: 0,
    width: '22%',
    height: '13%',
    backgroundColor: COLORS.skinDark,
    opacity: 0.12,
    borderBottomLeftRadius: 35,
  },
  waistLeft: {
    position: 'absolute',
    top: '55%',
    left: 0,
    width: '14%',
    height: '22%',
    backgroundColor: COLORS.skinDark,
    opacity: 0.08,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  waistRight: {
    position: 'absolute',
    top: '55%',
    right: 0,
    width: '14%',
    height: '22%',
    backgroundColor: COLORS.skinDark,
    opacity: 0.08,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },

  // Warmth overlay
  warmthOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 3,
  },

  // Finger glow
  fingerGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.red + '40',
    zIndex: 4,
  },

  // Finger crosshair
  fingerCrosshair: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  crosshairH: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: COLORS.primary + 'AA',
    borderRadius: 1,
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: COLORS.primary + 'AA',
    borderRadius: 1,
  },

  // Found mark
  foundMark: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  foundDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Miss mark
  missMark: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.grayDark + '40',
    borderWidth: 1,
    borderColor: COLORS.grayDark + '60',
    zIndex: 8,
  },

  // Found text bubble
  foundTextBubble: {
    position: 'absolute',
    zIndex: 12,
    backgroundColor: COLORS.bgDark + 'CC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Sensitivity meter
  meterContainer: {
    width: METER_COL_WIDTH,
    height: SPINE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  meterTrack: {
    flex: 1,
    width: 18,
    backgroundColor: COLORS.bgDark,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.bgLight,
    marginVertical: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  meterFill: {
    width: '100%',
    borderRadius: 3,
  },
  meterTick: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.bgLight + '60',
  },
  meterSensLabel: {
    marginTop: 4,
    width: 50,
    alignItems: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 6,
  },

  // Results
  resultsCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.paper,
    borderRadius: 10,
    padding: 20,
    margin: 12,
    borderWidth: 2,
    borderColor: COLORS.paperDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  resultsDivider: {
    width: '60%',
    height: 2,
    backgroundColor: COLORS.paperDark,
    marginVertical: 10,
    borderRadius: 1,
  },
  resultsScoreRow: {
    marginTop: 4,
  },
  resultsLine: {
    marginTop: 6,
  },
  zoneBreakdown: {
    marginTop: 12,
    width: '100%',
    paddingHorizontal: 16,
    gap: 6,
  },
  zoneResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneResultDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  zoneResultLabel: {
    flex: 1,
  },
  bonusRow: {
    marginTop: 4,
  },
  resultsButtons: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
});
