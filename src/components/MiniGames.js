import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions, Text } from 'react-native';
import { COLORS, lighten, darken } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import soundManager from '../utils/soundManager';
import i18n from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const ZONES = [
  { id: 'cervical', x: 0.5, y: 0.15, label: 'C' },
  { id: 'thoracic1', x: 0.35, y: 0.35, label: 'T1' },
  { id: 'thoracic2', x: 0.65, y: 0.35, label: 'T2' },
  { id: 'thoracic3', x: 0.5, y: 0.45, label: 'T3' },
  { id: 'lumbar1', x: 0.35, y: 0.6, label: 'L1' },
  { id: 'lumbar2', x: 0.65, y: 0.6, label: 'L2' },
  { id: 'pelvis', x: 0.5, y: 0.75, label: 'P' },
];

export function QuickAdjust({ onComplete, difficulty = 1, gameMode = 'arcade' }) {
  const [activeZones, setActiveZones] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  
  const timerRef = useRef(null);
  const zoneAnimations = useRef({}).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    zoneAnimations.current = ZONES.reduce((acc, zone) => {
      acc[zone.id] = new Animated.Value(1);
      return acc;
    }, {});

    startNewRound();
    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startNewRound = () => {
    const numZones = Math.min(1 + Math.floor(difficulty / 2), 4);
    const selectedZones = [];
    const availableZones = [...ZONES];

    for (let i = 0; i < numZones; i++) {
      const randomIndex = Math.floor(Math.random() * availableZones.length);
      selectedZones.push({
        ...availableZones[randomIndex],
        duration: Math.max(2000 - (difficulty * 200), 800),
        points: 100 + (combo * 10),
      });
      availableZones.splice(randomIndex, 1);
    }

    setActiveZones(selectedZones);

    selectedZones.forEach((zone) => {
      const anim = zoneAnimations.current[zone.id];
      if (anim) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.3,
              duration: zone.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: zone.duration / 2,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });

    setTimeout(() => {
      if (isPlaying) {
        setActiveZones((prev) => prev.filter((z) => !selectedZones.find((s) => s.id === z.id)));
      }
    }, Math.min(zone.duration * 1.5, 3000));
  };

  const handleZoneTap = (zone) => {
    const isActive = activeZones.find((z) => z.id === zone.id);
    if (!isActive || !isPlaying) return;

    soundManager.playClick();

    const anim = zoneAnimations.current[zone.id];
    if (anim) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    const points = 100 + (combo * 10) + (gameMode === 'challenge' ? 50 : 0);
    setScore((prev) => prev + points);
    setCombo((prev) => prev + 1);
    setActiveZones((prev) => prev.filter((z) => z.id !== zone.id));

    showFeedbackText('✓', COLORS.green);

    if (activeZones.length === 1) {
      setTimeout(startNewRound, 300);
    }
  };

  const handleWrongTap = (zone) => {
    if (!isPlaying) return;

    soundManager.playClick();
    setCombo(0);
    showFeedbackText('✗', COLORS.red);
    
    if (gameMode === 'challenge') {
      setScore((prev) => Math.max(0, prev - 50));
    }
  };

  const showFeedbackText = (text, color) => {
    setShowFeedback({ text, color });
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setShowFeedback(null));
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ score, timeLeft, combo });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <PixelText size="medium" color={COLORS.accent}>
            {i18n.t('score')}: {score}
          </PixelText>
        </View>
        <View style={styles.timerContainer}>
          <PixelText size="large" color={timeLeft <= 10 ? COLORS.red : COLORS.white}>
            ⏱ {timeLeft}s
          </PixelText>
        </View>
        <View style={styles.comboContainer}>
          <PixelText size="medium" color={combo > 5 ? COLORS.gold : COLORS.gray}>
            x{combo}
          </PixelText>
        </View>
      </View>

      <View style={styles.spineContainer}>
        {ZONES.map((zone) => {
          const isActive = activeZones.find((z) => z.id === zone.id);
          const anim = zoneAnimations.current[zone.id];
          
          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zone,
                {
                  left: zone.x * width * 0.7,
                  top: zone.y * height * 0.5,
                  backgroundColor: isActive ? COLORS.primary : COLORS.bone,
                  borderColor: isActive ? COLORS.primaryLight : COLORS.boneDark,
                  transform: [{ scale: anim ? anim : 1 }],
                },
              ]}
              onPress={() => isActive ? handleZoneTap(zone) : handleWrongTap(zone)}
              activeOpacity={0.7}
            >
              <PixelText size="tiny" color={isActive ? COLORS.white : COLORS.dark}>
                {zone.label}
              </PixelText>
            </TouchableOpacity>
          );
        })}

        <View style={styles.spineLine}>
          {ZONES.map((zone, i) => (
            <View key={i} style={styles.vertebra} />
          ))}
        </View>
      </View>

      {showFeedback && (
        <Animated.View
          style={[
            styles.feedback,
            {
              opacity: feedbackAnim,
              transform: [{ scale: feedbackAnim }],
            },
          ]}
        >
          <PixelText size="giant" color={showFeedback.color}>
            {showFeedback.text}
          </PixelText>
        </Animated.View>
      )}

      <PixelText size="small" color={COLORS.gray} center style={styles.instructions}>
        {i18n.t('quickAdjustInstructions')}
      </PixelText>
    </View>
  );
}

export function MemoryMatch({ onComplete, difficulty = 1, gameMode = 'arcade' }) {
  const [zones, setZones] = useState([]);
  const [revealedZones, setRevealedZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [rounds, setRounds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPattern, setShowPattern] = useState(true);

  const patternRef = useRef(null);
  const scoreAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const numZones = Math.min(3 + Math.floor(rounds / 2), 6);
    const selectedZones = [];
    const availableZones = [...ZONES];

    for (let i = 0; i < numZones; i++) {
      const randomIndex = Math.floor(Math.random() * availableZones.length);
      selectedZones.push(availableZones[randomIndex].id);
      availableZones.splice(randomIndex, 1);
    }

    setZones(selectedZones);
    setRevealedZones(selectedZones);
    setShowPattern(true);

    const showTime = 2000 + (difficulty * 200);
    setTimeout(() => {
      setRevealedZones([]);
      setShowPattern(false);
    }, showTime);

    setRounds((prev) => prev + 1);
  };

  const handleZoneTap = (zoneId) => {
    if (!isPlaying || showPattern) return;
    if (revealedZones.includes(zoneId)) return;

    soundManager.playClick();

    if (selectedZone === null) {
      setSelectedZone(zoneId);
    } else {
      if (zones.includes(zoneId)) {
        const newRevealed = [...revealedZones, zoneId];
        setRevealedZones(newRevealed);
        
        Animated.spring(scoreAnim, {
          toValue: 1.3,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(scoreAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        });

        setScore((prev) => prev + 100 + (gameMode === 'challenge' ? 50 : 0));

        if (newRevealed.length === zones.length) {
          setTimeout(() => {
            if (rounds < 5) {
              startRound();
            } else {
              handleComplete();
            }
          }, 500);
        }
      } else {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setIsPlaying(false);
            handleComplete();
          }
          return newLives;
        });
      }
      setSelectedZone(null);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ score, rounds, lives });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Animated.Text style={[styles.scoreText, { transform: [{ scale: scoreAnim }] }]}>
            <PixelText size="medium" color={COLORS.accent}>
              {i18n.t('score')}: {score}
            </PixelText>
          </Animated.Text>
        </View>
        <View style={styles.livesContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PixelText key={i} size="medium" color={i < lives ? COLORS.green : COLORS.grayDark}>
              ♥
            </PixelText>
          ))}
        </View>
        <View style={styles.roundContainer}>
          <PixelText size="medium" color={COLORS.gold}>
            {i18n.t('round')}: {rounds}/5
          </PixelText>
        </View>
      </View>

      {showPattern && (
        <View style={styles.patternBanner}>
          <PixelText size="medium" color={COLORS.gold}>
            ⚡ {i18n.t('memorize')}
          </PixelText>
        </View>
      )}

      <View style={styles.spineContainer}>
        {ZONES.map((zone) => {
          const isRevealed = revealedZones.includes(zone.id);
          const isSelected = selectedZone === zone.id;
          
          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zone,
                {
                  left: zone.x * width * 0.7,
                  top: zone.y * height * 0.5,
                  backgroundColor: isRevealed 
                    ? COLORS.green 
                    : isSelected 
                      ? COLORS.accent 
                      : COLORS.bone,
                  borderColor: isRevealed 
                    ? COLORS.greenDark 
                    : isSelected 
                      ? COLORS.accentLight 
                      : COLORS.boneDark,
                },
              ]}
              onPress={() => handleZoneTap(zone.id)}
              disabled={showPattern}
              activeOpacity={0.7}
            >
              <PixelText 
                size="tiny" 
                color={isRevealed || isSelected ? COLORS.white : COLORS.dark}
              >
                {zone.label}
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </View>

      <PixelText size="small" color={COLORS.gray} center style={styles.instructions}>
        {showPattern ? i18n.t('memorizeInstructions') : i18n.t('memoryMatchInstructions')}
      </PixelText>
    </View>
  );
}

export function DiagnosisPuzzle({ onComplete, difficulty = 1, gameMode = 'arcade' }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const CASES = [
    {
      id: 'cervical',
      name: 'cervicalStrain',
      symptoms: ['dolorCuello', 'rigidez', 'dolorCabeza', 'mareo'],
      correctDiagnosis: 'cervicalStrain',
    },
    {
      id: 'lumbar',
      name: 'lumbarStrain',
      symptoms: ['dolorLumbar', 'rigidezEspalda', 'dolorPierna', 'hormigueo'],
      correctDiagnosis: 'lumbarStrain',
    },
    {
      id: 'thoracic',
      name: 'thoracicKyphosis',
      symptoms: ['posturaCurvada', 'dorsal', 'fatiga', 'rigidez'],
      correctDiagnosis: 'thoracicKyphosis',
    },
    {
      id: 'sciatica',
      name: 'sciatica',
      symptoms: ['dolorPierna', 'hormigueo', 'debilidad', 'dolorGluteo'],
      correctDiagnosis: 'sciatica',
    },
  ];

  const ALL_SYMPTOMS = [
    { id: 'dolorCuello', label: 'dolorCuelloLabel' },
    { id: 'rigidez', label: 'rigidezLabel' },
    { id: 'dolorCabeza', label: 'dolorCabezaLabel' },
    { id: 'mareo', label: 'mareoLabel' },
    { id: 'dolorLumbar', label: 'dolorLumbarLabel' },
    { id: 'rigidezEspalda', label: 'rigidezEspaldaLabel' },
    { id: 'dolorPierna', label: 'dolorPiernaLabel' },
    { id: 'hormigueo', label: 'hormigueoLabel' },
    { id: 'posturaCurvada', label: 'posturaCurvadaLabel' },
    { id: 'dorsal', label: 'dorsalLabel' },
    { id: 'fatiga', label: 'fatigaLabel' },
    { id: 'debilidad', label: 'debilidadLabel' },
    { id: 'dolorGluteo', label: 'dolorGluteoLabel' },
  ];

  const ALL_DIAGNOSES = [
    { id: 'cervicalStrain', label: 'cervicalStrainLabel' },
    { id: 'lumbarStrain', label: 'lumbarStrainLabel' },
    { id: 'thoracicKyphosis', label: 'thoracicKyphosisLabel' },
    { id: 'sciatica', label: 'sciaticaLabel' },
  ];

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const randomCase = CASES[Math.floor(Math.random() * CASES.length)];
    const shuffledSymptoms = [...ALL_SYMPTOMS].sort(() => Math.random() - 0.5);
    const selectedSymptomsList = randomCase.symptoms.map(s => 
      shuffledSymptoms.find(sym => sym.id === s)
    ).filter(Boolean);
    const wrongSymptoms = shuffledSymptoms
      .filter(s => !randomCase.symptoms.includes(s.id))
      .slice(0, 2);
    const finalSymptoms = [...selectedSymptomsList, ...wrongSymptoms].sort(() => Math.random() - 0.5);

    setCurrentPatient(randomCase);
    setSymptoms(finalSymptoms);
    setDiagnoses([...ALL_DIAGNOSES].sort(() => Math.random() - 0.5));
    setSelectedSymptoms([]);
    setSelectedDiagnosis(null);
    setRound((prev) => prev + 1);
  };

  const handleSymptomToggle = (symptom) => {
    if (!isPlaying) return;
    soundManager.playClick();
    
    setSelectedSymptoms((prev) => {
      if (prev.find(s => s.id === symptom.id)) {
        return prev.filter(s => s.id !== symptom.id);
      }
      return [...prev, symptom];
    });
  };

  const handleDiagnosisSelect = (diagnosis) => {
    if (!isPlaying) return;
    soundManager.playClick();
    setSelectedDiagnosis(diagnosis);
  };

  const handleSubmit = () => {
    if (!selectedDiagnosis || !currentPatient) return;

    const isCorrect = selectedDiagnosis.id === currentPatient.correctDiagnosis;
    const hasAllSymptoms = selectedSymptoms.some(s => 
      currentPatient.symptoms.includes(s.id)
    );

    if (isCorrect && hasAllSymptoms) {
      setScore((prev) => prev + 200);
      setFeedback({ type: 'success', text: i18n.t('correctDiagnosis') });
      soundManager.playClick();
    } else {
      if (gameMode === 'challenge') {
        setScore((prev) => Math.max(0, prev - 100));
      }
      setFeedback({ type: 'error', text: i18n.t('wrongDiagnosis') });
    }

    setTimeout(() => {
      setFeedback(null);
      if (round < 5) {
        startRound();
      } else {
        handleComplete();
      }
    }, 1500);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ score, round });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <PixelText size="medium" color={COLORS.accent}>
            {i18n.t('score')}: {score}
          </PixelText>
        </View>
        <View style={styles.roundContainer}>
          <PixelText size="medium" color={COLORS.gold}>
            {i18n.t('round')}: {round}/5
          </PixelText>
        </View>
      </View>

      {feedback && (
        <View style={[
          styles.feedbackBanner,
          { backgroundColor: feedback.type === 'success' ? COLORS.green : COLORS.red }
        ]}>
          <PixelText size="medium" color={COLORS.white}>
            {feedback.text}
          </PixelText>
        </View>
      )}

      <PixelText size="medium" color={COLORS.white} center style={styles.instruction}>
        {i18n.t('selectSymptoms')}
      </PixelText>

      <View style={styles.symptomsContainer}>
        {symptoms.map((symptom) => (
          <TouchableOpacity
            key={symptom.id}
            style={[
              styles.symptomChip,
              {
                backgroundColor: selectedSymptoms.find(s => s.id === symptom.id)
                  ? COLORS.accent
                  : COLORS.dark,
                borderColor: selectedSymptoms.find(s => s.id === symptom.id)
                  ? COLORS.accentLight
                  : COLORS.grayDark,
              },
            ]}
            onPress={() => handleSymptomToggle(symptom)}
          >
            <PixelText size="small" color={COLORS.white}>
              {i18n.t(symptom.label)}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <PixelText size="medium" color={COLORS.white} center style={styles.instruction}>
        {i18n.t('selectDiagnosis')}
      </PixelText>

      <View style={styles.diagnosesContainer}>
        {diagnoses.map((diagnosis) => (
          <TouchableOpacity
            key={diagnosis.id}
            style={[
              styles.diagnosisCard,
              {
                backgroundColor: selectedDiagnosis?.id === diagnosis.id
                  ? COLORS.primary
                  : COLORS.dark,
                borderColor: selectedDiagnosis?.id === diagnosis.id
                  ? COLORS.primaryLight
                  : COLORS.grayDark,
              },
            ]}
            onPress={() => handleDiagnosisSelect(diagnosis)}
          >
            <PixelText size="small" color={COLORS.white} center>
              {i18n.t(diagnosis.label)}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.submitContainer}>
        <PixelButton
          title={i18n.t('submit')}
          onPress={handleSubmit}
          color={COLORS.green}
          disabled={!selectedDiagnosis}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

export default function MiniGames({ gameType, onComplete, difficulty, gameMode }) {
  switch (gameType) {
    case 'quickAdjust':
      return <QuickAdjust onComplete={onComplete} difficulty={difficulty} gameMode={gameMode} />;
    case 'memoryMatch':
      return <MemoryMatch onComplete={onComplete} difficulty={difficulty} gameMode={gameMode} />;
    case 'diagnosisPuzzle':
      return <DiagnosisPuzzle onComplete={onComplete} difficulty={difficulty} gameMode={gameMode} />;
    default:
      return <QuickAdjust onComplete={onComplete} difficulty={difficulty} gameMode={gameMode} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  comboContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roundContainer: {
    alignItems: 'flex-end',
  },
  spineContainer: {
    flex: 1,
    position: 'relative',
  },
  zone: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -22.5,
    marginTop: -22.5,
  },
  spineLine: {
    position: 'absolute',
    left: width * 0.35,
    top: height * 0.1,
    bottom: height * 0.3,
    width: 4,
    backgroundColor: COLORS.boneDark,
    borderRadius: 2,
  },
  vertebrae: {
    width: 20,
    height: 8,
    backgroundColor: COLORS.bone,
    marginVertical: 4,
    borderRadius: 2,
  },
  feedback: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    marginTop: 20,
  },
  patternBanner: {
    backgroundColor: COLORS.goldDark,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    margin: 4,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  diagnosisCard: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginVertical: 4,
  },
  diagnosesContainer: {
    marginBottom: 20,
  },
  instruction: {
    marginBottom: 10,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  submitContainer: {
    marginTop: 'auto',
  },
  submitButton: {
    width: '100%',
  },
  scoreText: {
    textAlign: 'center',
  },
});
