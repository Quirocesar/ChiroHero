import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import PatientPortrait from '../components/PatientPortrait';
import SpineView from '../components/SpineView';
import ParticleSystem, { LevelUpOverlay } from '../components/ParticleSystem';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const TECHNIQUES = [
  {
    id: 'diversified',
    icon: '🤲',
    nameKey: 'diversified',
    descKey: 'diversifiedDesc',
    available: true,
    damageMult: 1,
    scoreMult: 1,
    zoneRestriction: null,
    blocksMistakes: false,
    wrongZoneMult: 1,
  },
  {
    id: 'gonstead',
    icon: '🎯',
    nameKey: 'gonstead',
    descKey: 'gonsteadDesc',
    available: false,
    requiredSkillLevel: 3,
    damageMult: 1.5,
    scoreMult: 1.5,
    zoneRestriction: null,
    blocksMistakes: false,
    wrongZoneMult: 0.5,
  },
  {
    id: 'thompson',
    icon: '⬇️',
    nameKey: 'thompson',
    descKey: 'thompsonDesc',
    available: false,
    upgradeId: 'dropTable',
    damageMult: 2,
    scoreMult: 1,
    zoneRestriction: ['thoracic', 'lumbar'],
    blocksMistakes: false,
    wrongZoneMult: 0,
  },
  {
    id: 'activatorTech',
    icon: '🔧',
    nameKey: 'activatorTech',
    descKey: 'activatorTechDesc',
    available: false,
    upgradeId: 'activator',
    damageMult: 0.8,
    scoreMult: 1,
    zoneRestriction: null,
    blocksMistakes: true,
    wrongZoneMult: 0.8,
  },
];

const TOOLS = [
  { id: 'hands', icon: '🤲', descKey: 'handsDesc', nameKey: 'hands', available: true },
  { id: 'activator', icon: '🔧', descKey: 'activatorDesc', nameKey: 'activator', available: false, upgradeId: 'activator' },
  { id: 'massageGun', icon: '💆', descKey: 'massageGunDesc', nameKey: 'massageGun', available: false, upgradeId: 'massageGun' },
  { id: 'ultrasound', icon: '📡', descKey: 'ultrasoundDesc', nameKey: 'ultrasound', available: false, upgradeId: 'ultrasound' },
  { id: 'tens', icon: '⚡', descKey: 'tensDesc', nameKey: 'tens', available: false, upgradeId: 'tens' },
];

const PATIENT_EXPRESSIONS = {
  pain: ['pain', 'worried', 'pain'],
  worried: ['worried', 'worried', 'pain'],
  neutral: ['neutral', 'worried', 'neutral'],
  happy: ['happy', 'happy', 'neutral'],
  veryHappy: ['happy', 'veryHappy', 'happy'],
};

function getStars(score) {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function renderStars(count) {
  const filled = '★';
  const empty = '☆';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += i < count ? filled : empty;
  }
  return result;
}

function getHappyMessage(score) {
  if (score >= 90) return t('happy90');
  if (score >= 70) return t('happy70');
  if (score >= 50) return t('happy50');
  return t('happyLow');
}

function ToolFeedback({ tool, active }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
        Animated.delay(200),
        Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        scale.setValue(0);
      });
    }
  }, [active, tool]);

  const feedbackConfig = {
    hands: { text: '👋', color: COLORS.accent },
    activator: { text: '🔧', color: COLORS.secondary },
    massageGun: { text: '💆', color: COLORS.green },
    ultrasound: { text: '📡', color: COLORS.accent },
    tens: { text: '⚡', color: COLORS.orange },
  };

  const config = feedbackConfig[tool] || feedbackConfig.hands;

  return (
    <Animated.View
      style={[
        styles.toolFeedback,
        {
          transform: [{ scale }],
          opacity,
          borderColor: config.color,
          backgroundColor: config.color + '44',
        },
      ]}
    >
      <PixelText size="large">{config.text}</PixelText>
    </Animated.View>
  );
}

// Lazy-load ExerciseMiniGame
let ExerciseMiniGame = null;
try { ExerciseMiniGame = require('../components/ExerciseMiniGame').default; } catch(e) {}

export default function TreatmentScreen({ route, navigation }) {
  const { patient, palpationResult, xrayResult, neuroResult } = route.params;
  const [selectedTool, setSelectedTool] = useState('hands');
  const [selectedTechnique, setSelectedTechnique] = useState('diversified');
  const [treatmentComplete, setTreatmentComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [finalRewards, setFinalRewards] = useState({ payment: 0, xp: 0, rep: 0 });
  const [showRewards, setShowRewards] = useState(false);
  const [patientExpression, setPatientExpression] = useState('worried');
  const [toolFeedbackActive, setToolFeedbackActive] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [confettiActive, setConfettiActive] = useState(false);
  const [showExerciseMiniGame, setShowExerciseMiniGame] = useState(false);
  const [exerciseResult, setExerciseResult] = useState(null);

  // Calculate bonuses from pre-treatment mini-games
  const palpationBonus = palpationResult?.bonus || 0;
  const xrayBonus = xrayResult?.bonus || 0;
  const combinedBonus = 1 + palpationBonus + xrayBonus; // multiplier

  const upgrades = gameState.get('upgrades');

  const availableTools = TOOLS.map(tool => ({
    ...tool,
    available: tool.available || (tool.upgradeId && upgrades[tool.upgradeId]),
  }));

  const skillLevel = gameState.get('skillLevel');
  const availableTechniques = TECHNIQUES.map(tech => ({
    ...tech,
    available: tech.available ||
      (tech.requiredSkillLevel && skillLevel >= tech.requiredSkillLevel) ||
      (tech.upgradeId && upgrades[tech.upgradeId]),
  }));

  const selectedTechData = availableTechniques.find(t => t.id === selectedTechnique);

  useEffect(() => {
    soundManager.playTreatmentMusic();
    return () => {
      soundManager.playClinicMusic();
    };
  }, []);

  useEffect(() => {
    if (treatmentComplete) {
      const timer = setTimeout(() => setShowRewards(true), 600);
      return () => clearTimeout(timer);
    }
  }, [treatmentComplete]);

  const handleProgress = useCallback((prog, currentCombo = 0) => {
    setProgress(prog);
    if (currentCombo > maxCombo) {
      setMaxCombo(currentCombo);
    }

    // Dynamic patient expressions based on treatment progress
    if (prog > 0 && prog < 1) {
      if (prog > 0.75) {
        // Almost done - patient starts looking relieved
        setPatientExpression(Math.random() > 0.3 ? 'neutral' : 'happy');
      } else if (prog > 0.5) {
        // Halfway - mostly neutral
        setPatientExpression(Math.random() > 0.4 ? 'neutral' : 'worried');
      } else {
        // Early treatment - still worried
        setPatientExpression(Math.random() > 0.6 ? 'worried' : 'neutral');
      }
    }
  }, [maxCombo]);

  const handleToolSelect = useCallback((toolId) => {
    if (selectedTool !== toolId) {
      setSelectedTool(toolId);
      soundManager.playClick();
      setToolFeedbackActive(true);
      setTimeout(() => setToolFeedbackActive(false), 400);
    }
  }, [selectedTool]);

  const handleTechniqueSelect = useCallback((techId) => {
    if (selectedTechnique !== techId) {
      setSelectedTechnique(techId);
      soundManager.playClick();
    }
  }, [selectedTechnique]);

  const handleMistake = useCallback(() => {
    if (selectedTechData?.blocksMistakes) {
      return;
    }
    gameState.set({ dailyMistakes: (gameState.get('dailyMistakes') || 0) + 1 });
    setPatientExpression('pain');
    setTimeout(() => setPatientExpression('worried'), 1000);
  }, [selectedTechData]);

  const handleComplete = useCallback((finalScore, details = {}) => {
    setScore(finalScore);
    setTreatmentComplete(true);
    soundManager.playPatientHappy();
    setPatientExpression('happy');
    setConfettiActive(true);

    const prevLevel = gameState.get('skillLevel');
    const comboFromDetails = details.maxCombo || maxCombo;
    const multiplier = comboFromDetails > 1 ? 1 + (comboFromDetails * 0.1) : 1;
    const perfectBonus = details.isPerfect ? 1.5 : 1; // 50% bonus for perfect treatment
    const baseRep = patient.isPremium ? 10 : 2;

    const xpReward = Math.round((patient.condition.xpReward || 20) * multiplier * perfectBonus * combinedBonus);
    const newXp = gameState.get('experience') + xpReward;
    const expToLevel = prevLevel * 100;
    const leveledUp = newXp >= expToLevel;

    if (leveledUp) {
      const newLevel = prevLevel + 1;
      gameState.set({ skillLevel: newLevel });
      setCurrentLevel(newLevel);
      setTimeout(() => setShowLevelUp(true), 800);
    }

    const payment = Math.round(patient.payment * multiplier * perfectBonus * combinedBonus);
    const rep = Math.round(baseRep * (comboFromDetails > 1 ? 1 + (comboFromDetails * 0.05) : 1) * perfectBonus * combinedBonus);

    setFinalRewards({
      payment,
      xp: xpReward,
      rep,
      isPerfect: details.isPerfect || false,
      time: details.time || 0,
      mistakes: details.mistakes || 0,
    });

    // Save appointment record for registry
    gameState.addAppointmentRecord({
      patientName: patient.fullName,
      condition: patient.condition.name,
      date: `Día ${gameState.get('currentDay') || 1}`,
      score: finalScore,
      stars: getStars(finalScore),
      payment,
      xp: xpReward,
      reputation: rep,
      combo: comboFromDetails,
      technique: selectedTechnique,
      isPremium: patient.isPremium || false,
      isPerfect: details.isPerfect || false,
      timestamp: Date.now(),
    });
  }, [maxCombo, patient, selectedTechnique]);

  const handleExerciseComplete = useCallback((result) => {
    setExerciseResult(result);
    setShowExerciseMiniGame(false);
    // Apply exercise bonus to rewards
    if (result && result.bonus) {
      const exBonus = 1 + (result.bonus || 0);
      const satMult = result.satisfactionMult || 1;
      setFinalRewards(prev => ({
        ...prev,
        payment: Math.round(prev.payment * exBonus),
        xp: Math.round(prev.xp * exBonus),
        rep: Math.round(prev.rep * satMult),
      }));
    }
  }, []);

  const handleFinish = useCallback(() => {
    // If exercise mini-game available and not yet played, offer it
    if (ExerciseMiniGame && !exerciseResult && !showExerciseMiniGame) {
      setShowExerciseMiniGame(true);
      return;
    }
    soundManager.playMoney();
    navigation.navigate('ClinicView', {
      result: 'treated',
      patientId: patient.id,
      earnings: finalRewards.payment,
      xp: finalRewards.xp,
      rep: finalRewards.rep,
      combo: maxCombo
    });
  }, [navigation, patient, finalRewards, maxCombo, exerciseResult, showExerciseMiniGame]);

  const selectedToolData = availableTools.find(t => t.id === selectedTool);
  const starCount = getStars(score);

  // Exercise mini-game phase
  if (showExerciseMiniGame && ExerciseMiniGame) {
    return (
      <ExerciseMiniGame
        condition={patient.condition}
        onComplete={handleExerciseComplete}
        onSkip={() => {
          setShowExerciseMiniGame(false);
          setExerciseResult({ bonus: 0, satisfactionMult: 1, skipped: true });
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ParticleSystem
        type="confetti"
        active={confettiActive}
        centerX={200}
      />

      <LevelUpOverlay
        visible={showLevelUp}
        level={currentLevel}
        onComplete={() => setShowLevelUp(false)}
      />

      <View style={styles.statusBar}>
        <View style={styles.statusBarInner}>
          <View style={styles.patientMini}>
            <View style={styles.avatarFrame}>
              <PatientPortrait
                name={patient.fullName}
                avatar={patient.avatar}
                expression={treatmentComplete ? 'happy' : patientExpression}
                size={44}
                animated
              />
            </View>
            <View style={styles.patientInfo}>
              <PixelText size="small" color={COLORS.paper} fontFamily="ui">{patient.fullName}</PixelText>
              <View style={styles.conditionRow}>
                <View style={styles.conditionDot} />
                <PixelText size="tiny" color={COLORS.primary} fontFamily="ui">{patient.condition.name}</PixelText>
              </View>
            </View>
          </View>
          {patient.isPremium && (
            <View style={styles.vipBadge}>
              <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">VIP</PixelText>
            </View>
          )}
        </View>
        {!treatmentComplete && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
          </View>
        )}
      </View>

      <View style={treatmentComplete ? styles.modeLabelComplete : styles.modeLabel}>
        <PixelText size="medium" color={treatmentComplete ? COLORS.green : COLORS.primary} center glow fontFamily="ui">
          {treatmentComplete ? t('treatmentComplete') : t('treatmentMode')}
        </PixelText>
        <View style={styles.modeLabelDivider} />
        <PixelText size="tiny" color={COLORS.ink} center fontFamily="ui">
          {treatmentComplete ? t('patientFeelsBetter') : t('tapToAdjust')}
        </PixelText>
      </View>

      {treatmentComplete ? (
        <View style={styles.completeWrapper}>
          <View style={styles.completeAvatarSection}>
            <View style={styles.completeAvatarGlow}>
              <View style={styles.completeAvatarFrame}>
                <PatientPortrait
                  name={patient.fullName}
                  avatar={patient.avatar}
                  expression="happy"
                  size={96}
                  animated
                />
              </View>
            </View>
            <PixelText size="large" color={COLORS.green} center glow fontFamily="ui">
              {t('patientCured')}
            </PixelText>
          </View>

          <View style={styles.epicRewardsContainer}>
            <PixelText size="small" color={COLORS.primary} center glow style={styles.epicTitle} fontFamily="ui">
              ★ {t('rewards')} ★
            </PixelText>

            <View style={styles.epicRewardBox}>
              <View style={styles.epicRewardRow}>
                <PixelText size="medium" style={styles.epicEmoji}>💰</PixelText>
                <View style={styles.epicRewardContent}>
                  <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">{t('payment')}</PixelText>
                  <PixelText size="large" color={COLORS.primary} glow fontFamily="ui">${finalRewards.payment}</PixelText>
                </View>
              </View>

              <View style={styles.epicDivider}>
                {[...Array(15)].map((_, i) => (
                  <View key={i} style={[styles.epicDot, { backgroundColor: i % 2 === 0 ? COLORS.primary : 'transparent' }]} />
                ))}
              </View>

              <View style={styles.epicRewardRow}>
                <PixelText size="medium" style={styles.epicEmoji}>⚡</PixelText>
                <View style={styles.epicRewardContent}>
                  <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">{t('experience')}</PixelText>
                  <PixelText size="large" color={COLORS.green} glow fontFamily="ui">+{finalRewards.xp} XP</PixelText>
                </View>
              </View>

              <View style={styles.epicDivider}>
                {[...Array(15)].map((_, i) => (
                  <View key={i} style={[styles.epicDot, { backgroundColor: i % 2 === 0 ? COLORS.green : 'transparent' }]} />
                ))}
              </View>

              <View style={styles.epicRewardRow}>
                <PixelText size="medium" style={styles.epicEmoji}>⭐</PixelText>
                <View style={styles.epicRewardContent}>
                  <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">{t('reputation')}</PixelText>
                  <PixelText size="large" color={COLORS.secondary} glow fontFamily="ui">+{finalRewards.rep}</PixelText>
                </View>
              </View>
            </View>

            {maxCombo > 1 && (
              <View style={styles.comboBadge}>
                <PixelText size="small" color={COLORS.ink} fontFamily="ui">COMBO x{maxCombo}</PixelText>
              </View>
            )}

            {finalRewards.isPerfect && (
              <View style={styles.perfectBadge}>
                <PixelText size="small" color={COLORS.primary} glow fontFamily="ui">
                  ⭐ {t('perfectTreatment') || 'PERFECT TREATMENT'} ⭐
                </PixelText>
                <PixelText size="tiny" color={COLORS.green} fontFamily="ui">
                  +50% {t('bonus') || 'BONUS'}
                </PixelText>
              </View>
            )}

            {(finalRewards.time > 0 || finalRewards.mistakes >= 0) && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">⏱ {t('time') || 'TIME'}</PixelText>
                  <PixelText size="small" color={finalRewards.time < 30 ? COLORS.green : finalRewards.time < 60 ? COLORS.accent : COLORS.orange} fontFamily="ui">
                    {Math.floor(finalRewards.time / 60)}:{(finalRewards.time % 60).toString().padStart(2, '0')}
                  </PixelText>
                </View>
                <View style={styles.statItem}>
                  <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">❌ {t('mistakes') || 'MISTAKES'}</PixelText>
                  <PixelText size="small" color={finalRewards.mistakes === 0 ? COLORS.green : COLORS.red} fontFamily="ui">
                    {finalRewards.mistakes}
                  </PixelText>
                </View>
              </View>
            )}
          </View>

          <View style={styles.starsContainer}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={[
                  styles.starBox,
                  i <= starCount ? styles.starBoxFilled : styles.starBoxEmpty
                ]}>
                  <PixelText
                    size="large"
                    color={i <= starCount ? COLORS.primary : COLORS.border}
                    glow={i <= starCount}
                    fontFamily="ui"
                  >
                    {i <= starCount ? '★' : '☆'}
                  </PixelText>
                </View>
              ))}
            </View>
            <PixelText size="medium" color={COLORS.primary} center glow fontFamily="ui">
              {t('score')}: {score}/100
            </PixelText>
          </View>

          <View style={styles.speechBubbleContainer}>
            <View style={styles.speechTriangle} />
            <View style={styles.speechBubble}>
              <View style={styles.speechQuoteLeft}>
                <PixelText size="tiny" color={COLORS.primary} fontFamily="ui">{'\u275D'}</PixelText>
              </View>
              <PixelText size="small" color={COLORS.ink} shadow={false} center fontFamily="ui">
                {getHappyMessage(score)}
              </PixelText>
              <View style={styles.speechQuoteRight}>
                <PixelText size="tiny" color={COLORS.primary} fontFamily="ui">{'\u275E'}</PixelText>
              </View>
            </View>
          </View>

          {exerciseResult && !exerciseResult.skipped && (
            <View style={styles.exerciseBonusBadge}>
              <PixelText size="small" color={COLORS.green} glow fontFamily="ui">
                🏋️ {t('exerciseBonus') || 'EJERCICIOS PRESCRITOS'} +{Math.round((exerciseResult.bonus || 0) * 100)}%
              </PixelText>
            </View>
          )}

          {(palpationBonus > 0 || xrayBonus > 0) && (
            <View style={styles.miniGameBonusBadge}>
              {palpationBonus > 0 && (
                <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">
                  🤲 {t('palpation') || 'Palpación'} +{Math.round(palpationBonus * 100)}%
                </PixelText>
              )}
              {xrayBonus > 0 && (
                <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">
                  📋 {t('xray') || 'Rayos-X'} +{Math.round(xrayBonus * 100)}%
                </PixelText>
              )}
            </View>
          )}

          <View style={styles.nextButtonContainer}>
            <PixelButton
              title={ExerciseMiniGame && !exerciseResult ? `🏋️ ${t('prescribeExercises') || 'Prescribir Ejercicios'}` : `${t('next')}`}
              icon=">"
              color={COLORS.green}
              variant="primary"
              onPress={handleFinish}
              size="large"
            />
            {ExerciseMiniGame && !exerciseResult && (
              <PixelButton
                title={t('skip') || 'Saltar'}
                color={COLORS.desk}
                variant="secondary"
                onPress={() => {
                  setExerciseResult({ bonus: 0, satisfactionMult: 1, skipped: true });
                  soundManager.playMoney();
                  navigation.navigate('ClinicView', {
                    result: 'treated',
                    patientId: patient.id,
                    earnings: finalRewards.payment,
                    xp: finalRewards.xp,
                    rep: finalRewards.rep,
                    combo: maxCombo
                  });
                }}
                small
                style={{ marginTop: 6 }}
              />
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.techniqueSection}>
            <View style={styles.toolLabelRow}>
              <View style={[styles.toolLabelDot, { backgroundColor: COLORS.secondary }]} />
              <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">{t('selectTechnique')}</PixelText>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              style={styles.toolScroll}
              contentContainerStyle={styles.toolScrollContent}
            >
              {availableTechniques.map(tech => (
                <View key={tech.id} style={styles.techniqueSlot}>
                  <PixelButton
                    title={`${tech.icon} ${t(tech.nameKey)}`}
                    color={selectedTechnique === tech.id ? COLORS.secondary : COLORS.desk}
                    variant={selectedTechnique === tech.id ? 'primary' : 'secondary'}
                    onPress={() => handleTechniqueSelect(tech.id)}
                    disabled={!tech.available}
                    small
                    style={[
                      styles.techniqueButton,
                      selectedTechnique === tech.id && styles.techniqueButtonActive,
                    ]}
                  />
                  {selectedTechnique === tech.id && (
                    <View style={[styles.toolIndicator, { backgroundColor: COLORS.secondary }]} />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.toolSection}>
            <View style={styles.toolHeader}>
              <View style={styles.toolLabelRow}>
                <View style={styles.toolLabelDot} />
                <PixelText size="tiny" color={COLORS.primary} fontFamily="ui">{t('tool')}</PixelText>
              </View>
              <PixelButton
                title={`${t('manual')}`}
                icon="?"
                color={COLORS.secondary}
                variant="secondary"
                onPress={() => navigation.navigate('PathologyBook')}
                small
              />
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              style={styles.toolScroll}
              contentContainerStyle={styles.toolScrollContent}
            >
              {availableTools.map(tool => (
                <View key={tool.id} style={styles.toolSlot}>
                  <PixelButton
                    title={`${tool.icon} ${t(tool.nameKey)}`}
                    color={selectedTool === tool.id ? COLORS.primary : COLORS.desk}
                    variant={selectedTool === tool.id ? 'primary' : 'secondary'}
                    onPress={() => handleToolSelect(tool.id)}
                    disabled={!tool.available}
                    small
                    style={[
                      styles.toolButton,
                      selectedTool === tool.id && styles.toolButtonActive,
                    ]}
                  />
                  {selectedTool === tool.id && (
                    <View style={styles.toolIndicator} />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.spineContainer}>
            <View style={styles.spineFrame}>
              <SpineView
                condition={patient.condition}
                selectedTool={selectedTool}
                selectedTechnique={selectedTechData}
                onTreatmentProgress={handleProgress}
                onComplete={handleComplete}
                onMistake={handleMistake}
                skillLevel={gameState.get('skillLevel')}
                revealedProblems={palpationResult?.revealedZones || null}
                damageMult={combinedBonus}
              />
            </View>
          </View>

          <PixelCard color={COLORS.paper} borderColor={COLORS.border}>
            <View style={styles.toolInfoCard}>
              <View style={styles.toolInfoIcon}>
                <PixelText size="medium">{selectedToolData?.icon}</PixelText>
              </View>
              <View style={styles.toolInfoText}>
                <PixelText size="tiny" color={COLORS.primary} glow fontFamily="ui">
                  {t(selectedToolData?.nameKey || 'hands')}
                </PixelText>
                <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">
                  {t(selectedToolData?.descKey || 'handsDesc')}
                </PixelText>
              </View>
            </View>
          </PixelCard>

          <PixelCard color={COLORS.paper} borderColor={COLORS.border}>
            <View style={styles.toolInfoCard}>
              <View style={[styles.toolInfoIcon, { borderColor: COLORS.secondary }]}>
                <PixelText size="medium">{selectedTechData?.icon}</PixelText>
              </View>
              <View style={styles.toolInfoText}>
                <PixelText size="tiny" color={COLORS.secondary} glow fontFamily="ui">
                  {t('technique')}: {t(selectedTechData?.nameKey || 'diversified')}
                </PixelText>
                <PixelText size="tiny" color={COLORS.ink} fontFamily="ui">
                  {t(selectedTechData?.descKey || 'diversifiedDesc')}
                </PixelText>
              </View>
            </View>
          </PixelCard>

          <ToolFeedback tool={selectedTool} active={toolFeedbackActive} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.desk,
  },
  content: {
    padding: 10,
    paddingTop: 40,
    gap: 10,
    flexGrow: 1,
    paddingBottom: 40,
  },

  statusBar: {
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  statusBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  patientMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarFrame: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.desk,
    padding: 2,
    overflow: 'hidden',
  },
  patientInfo: {
    flex: 1,
    gap: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
  },
  vipBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.deskDark,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.green,
  },

  modeLabel: {
    padding: 10,
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  modeLabelComplete: {
    padding: 10,
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  modeLabelDivider: {
    height: 1.5,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },

  techniqueSection: {
    gap: 6,
  },
  techniqueSlot: {
    alignItems: 'center',
  },
  techniqueButton: {
    minWidth: 110,
    borderRadius: 8,
  },
  techniqueButtonActive: {
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 8,
  },

  toolSection: {
    gap: 6,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  toolScroll: {
    flexDirection: 'row',
  },
  toolScrollContent: {
    gap: 6,
    paddingVertical: 4,
  },
  toolSlot: {
    alignItems: 'center',
  },
  toolButton: {
    minWidth: 100,
    borderRadius: 8,
  },
  toolButtonActive: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  toolIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },

  spineContainer: {
    alignItems: 'center',
  },
  spineFrame: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.paper,
    borderRadius: 8,
    backgroundColor: COLORS.deskDark,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },

  toolInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 4,
  },
  toolInfoIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.border,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolInfoText: {
    flex: 1,
    gap: 2,
  },

  toolFeedback: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  completeWrapper: {
    gap: 12,
  },
  completeAvatarSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  completeAvatarGlow: {
    padding: 6,
    backgroundColor: COLORS.greenLight,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    borderRadius: 8,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completeAvatarFrame: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.paper,
    padding: 4,
    overflow: 'hidden',
  },

  epicRewardsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  epicTitle: {
    letterSpacing: 2,
  },
  epicRewardBox: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  epicRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  epicEmoji: {
    width: 30,
    textAlign: 'center',
  },
  epicRewardContent: {
    flex: 1,
  },
  epicDivider: {
    flexDirection: 'row',
    marginVertical: 8,
    justifyContent: 'center',
    gap: 2,
  },
  epicDot: {
    width: 4,
    height: 2,
  },
  comboBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  perfectBadge: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 4,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  starsContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  starBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  starBoxFilled: {
    backgroundColor: COLORS.deskDark,
    borderColor: COLORS.primary,
  },
  starBoxEmpty: {
    backgroundColor: COLORS.paper,
    borderColor: COLORS.border,
  },

  speechBubbleContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  speechTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.paper,
  },
  speechBubble: {
    backgroundColor: COLORS.paper,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    width: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechQuoteLeft: {
    position: 'absolute',
    top: 4,
    left: 6,
  },
  speechQuoteRight: {
    position: 'absolute',
    bottom: 4,
    right: 6,
  },

  nextButtonContainer: {
    paddingTop: 4,
    paddingHorizontal: 20,
  },
  exerciseBonusBadge: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    alignSelf: 'center',
  },
  miniGameBonusBadge: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    alignSelf: 'center',
    gap: 2,
  },
});
