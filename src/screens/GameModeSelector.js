import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, lighten, darken } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import i18n from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const GAME_MODES = {
  arcade: {
    id: 'arcade',
    icon: '🎮',
    color: COLORS.primary,
    description: 'gameModeArcadeDesc',
    difficulty: 3,
    features: ['infinitePatients', 'speedIncrease', 'scoreCounter'],
  },
  challenge: {
    id: 'challenge',
    icon: '⚡',
    color: COLORS.gold,
    description: 'gameModeChallengeDesc',
    difficulty: 5,
    features: ['hardConditions', 'heavyPenalties', 'noContinue'],
  },
  relaxed: {
    id: 'relaxed',
    icon: '🧘',
    color: COLORS.green,
    description: 'gameModeRelaxedDesc',
    difficulty: 1,
    features: ['noTimePressure', 'freePractice', 'noPenalties'],
  },
};

export default function GameModeSelector({ navigation }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [playerName, setPlayerName] = useState(gameState.get('playerName') || 'Dr. Quiro');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const modeAnims = useRef(GAME_MODES.arcade ? {
    arcade: new Animated.Value(0),
    challenge: new Animated.Value(0),
    relaxed: new Animated.Value(0),
  } : {}).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      Animated.stagger(150, [
        Animated.spring(modeAnims.arcade, { toValue: 1, tension: 20, friction: 5, useNativeDriver: true }),
        Animated.spring(modeAnims.challenge, { toValue: 1, tension: 20, friction: 5, useNativeDriver: true }),
        Animated.spring(modeAnims.relaxed, { toValue: 1, tension: 20, friction: 5, useNativeDriver: true }),
      ]).start();
    }, 300);
  }, []);

  const handleSelectMode = (modeId) => {
    soundManager.playClick();
    setSelectedMode(GAME_MODES[modeId]);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    soundManager.playClick();
    const name = playerName.trim() || 'Dr. Quiro';
    gameState.set({
      gameMode: selectedMode.id,
      playerName: name,
      treatmentMode: gameState.get('treatmentMode') || 'auto',
    });
    await gameState.save();
    navigation.navigate('ClinicModeSelector');
  };

  const handleBack = () => {
    soundManager.playClick();
    navigation.goBack();
  };

  const renderModeCard = (modeKey) => {
    const mode = GAME_MODES[modeKey];
    const isSelected = selectedMode?.id === mode.id;
    const animValue = modeAnims[modeKey] || new Animated.Value(0);

    return (
      <Animated.View
        key={modeKey}
        style={[
          styles.modeCard,
          {
            backgroundColor: isSelected ? lighten(mode.color, 30) : COLORS.deskDark,
            borderColor: isSelected ? mode.color : COLORS.grayDark,
            opacity: animValue,
            transform: [
              { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.modeCardInner}
          onPress={() => handleSelectMode(modeKey)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.modeIcon,
              {
                backgroundColor: mode.color,
                transform: [
                  { scale: isSelected ? pulseAnim : 1 },
                ],
              },
            ]}
          >
            <PixelText size="large">{mode.icon}</PixelText>
          </Animated.View>

          <PixelText
            size="title"
            color={mode.color}
            center
            style={styles.modeTitle}
          >
            {i18n.t(`gameMode${mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}`)}
          </PixelText>

          <PixelText size="small" color={COLORS.gray} center>
            {i18n.t(mode.description)}
          </PixelText>

          <View style={styles.difficultyContainer}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.difficultyDot,
                  { backgroundColor: i < mode.difficulty ? mode.color : COLORS.grayDark },
                ]}
              />
            ))}
          </View>

          <View style={styles.featuresContainer}>
            {mode.features.map((feature, idx) => (
              <View key={idx} style={[styles.featureBadge, { backgroundColor: mode.color }]}>
                <PixelText size="tiny" color={COLORS.white}>
                  {i18n.t(`feature_${feature}`)}
                </PixelText>
              </View>
            ))}
          </View>

          {isSelected && (
            <Animated.View style={[styles.selectedIndicator, { backgroundColor: mode.color }]}>
              <PixelText size="small" color={COLORS.white}>
                ✓ {i18n.t('selected')}
              </PixelText>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <PixelText size="giant" color={COLORS.primary} center>
          ⚔️ CHIROHERO ⚔️
        </PixelText>
        <PixelText size="medium" color={COLORS.accent} center style={styles.subtitle}>
          {i18n.t('selectGameMode')}
        </PixelText>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Name Input */}
        <Animated.View
          style={[
            styles.nameTagContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.nameTagOuter}>
            <View style={styles.nameTagHeader}>
              <PixelText size="tiny" color={COLORS.white}>
                🏷️ {i18n.t('chiropractorName')}
              </PixelText>
            </View>
            <View style={styles.nameTagBody}>
              <PixelText size="tiny" color={COLORS.gray} style={styles.nameLabel}>
                {i18n.t('enterYourName')}:
              </PixelText>
              <View style={styles.nameInputWrapper}>
                <TextInput
                  style={styles.nameInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Dr. Quiro"
                  placeholderTextColor={COLORS.grayDark}
                  maxLength={20}
                  autoCorrect={false}
                  selectionColor={COLORS.primary}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.modesContainer}>
          {Object.keys(GAME_MODES).map((key) => renderModeCard(key))}
        </View>
      </ScrollView>

      {showConfirm && selectedMode && (
        <Animated.View style={[styles.confirmOverlay, { opacity: fadeAnim }]}>
          <View style={[styles.confirmBox, { borderColor: selectedMode.color }]}>
            <PixelText size="title" color={selectedMode.color} center>
              {i18n.t('confirmMode')}
            </PixelText>
            <PixelText size="medium" color={COLORS.white} center style={styles.confirmText}>
              {i18n.t('confirmModeText', { mode: i18n.t(`gameMode${selectedMode.id.charAt(0).toUpperCase() + selectedMode.id.slice(1)}`) })}
            </PixelText>
            <View style={styles.confirmButtons}>
              <PixelButton
                title={i18n.t('confirm')}
                onPress={handleConfirm}
                color={selectedMode.color}
                style={styles.confirmBtn}
              />
              <PixelButton
                title={i18n.t('cancel')}
                onPress={() => setShowConfirm(false)}
                color={COLORS.grayDark}
                style={styles.confirmBtn}
              />
            </View>
          </View>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <PixelButton
          title={`← ${i18n.t('back')}`}
          onPress={handleBack}
          color={COLORS.secondary}
          style={styles.backButton}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  modesContainer: {
    gap: 20,
  },
  modeCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modeCardInner: {
    padding: 20,
    alignItems: 'center',
  },
  modeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modeTitle: {
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
  },
  confirmText: {
    marginTop: 12,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  confirmBtn: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    width: '100%',
  },
  nameTagContainer: {
    marginBottom: 20,
  },
  nameTagOuter: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.deskDark,
  },
  nameTagHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nameTagBody: {
    padding: 12,
  },
  nameLabel: {
    marginBottom: 8,
  },
  nameInputWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  nameInput: {
    color: COLORS.primary,
    fontFamily: 'monospace',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    letterSpacing: 2,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
