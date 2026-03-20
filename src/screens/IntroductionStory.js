import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Image } from 'react-native';
import { COLORS, lighten, darken } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import i18n from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const STORY_FRAMES = [
  {
    id: 1,
    scene: 'clinic_exterior',
    text: 'storyFrame1',
    image: '🏢',
    duration: 4000,
  },
  {
    id: 2,
    scene: 'reception',
    text: 'storyFrame2',
    image: '🪑',
    duration: 4000,
  },
  {
    id: 3,
    scene: 'first_patient',
    text: 'storyFrame3',
    image: '👤',
    duration: 4000,
  },
  {
    id: 4,
    scene: 'treatment_room',
    text: 'storyFrame4',
    image: '🛏️',
    duration: 4000,
  },
  {
    id: 5,
    scene: 'adjustment',
    text: 'storyFrame5',
    image: '💆',
    duration: 4000,
  },
  {
    id: 6,
    scene: 'success',
    text: 'storyFrame6',
    image: '⭐',
    duration: 3000,
  },
];

const PIXEL_ART_FRAMES = {
  clinic_exterior: [
    '  ╔══════════╗  ',
    '  ║ CHIROHERO║  ',
    '  ║  CLINIC  ║  ',
    '  ╚══════════╝  ',
    '     🏢🏢      ',
    '   ════════    ',
    '  🚗   🚶   🚗 ',
  ],
  reception: [
    '  ┌─────────┐   ',
    '  │RECEPCION │   ',
    '  └─────────┘   ',
    '    ┌───┐      ',
    '    │🪑 │      ',
    '    └───┘      ',
    '  📅 📋 📞    ',
  ],
  first_patient: [
    '    👤        ',
    '   ╱██╲       ',
    '  ╱████╲      ',
    '  │ 👤 │      ',
    '  └──┬─┘      ',
    '    ╱ ╲       ',
    '   🎒  👞     ',
  ],
  treatment_room: [
    '  ┌─────────┐   ',
    '  │SALA     │   ',
    '  │TRATAM.  │   ',
    '  └─────────┘   ',
    '   ═══════     ',
    '    🛏️        ',
    '   💊 🩺     ',
  ],
  adjustment: [
    '    👨‍⚕️       ',
    '   ╱👤╲      ',
    '  ╱─────╲    ',
    '  │ ║ │ ║    ',
    '  │ ║ │ ║    ',
    '  └─┴─┴─┘    ',
    '   🦴 🦴     ',
  ],
  success: [
    '    ⭐⭐⭐    ',
    '   ╔══════╗  ',
    '   ║ÉXITO! ║  ',
    '   ╚══════╝  ',
    '    ⭐⭐⭐    ',
    '   🎉 🎊 🎉 ',
    '  💰 💵 💰  ',
  ],
};

export default function IntroductionStory({ navigation, route }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showText, setShowText] = useState(true);
  const [textOpacity] = useState(new Animated.Value(1));
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const frameAnims = useRef(STORY_FRAMES.map(() => new Animated.Value(0))).current;
  const pixelCharAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;
  const timerRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    startFrameAnimation(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startFrameAnimation = (frameIndex) => {
    Animated.stagger(80, [
      ...pixelCharAnims.map((anim, i) => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ),
    ]).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (currentFrame < STORY_FRAMES.length - 1) {
        setCurrentFrame((prev) => prev + 1);
        startFrameAnimation(currentFrame + 1);
      } else {
        handleStoryComplete();
      }
    }, STORY_FRAMES[frameIndex].duration);
  };

  const handleStoryComplete = async () => {
    setIsPlaying(false);
    
    gameState.set({ 
      hasCompletedTutorial: true,
      hasSeenStory: true,
    });
    await gameState.save();

    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('MainMenu');
      }, 500);
    });
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    handleStoryComplete();
  };

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
    startFrameAnimation(0);
  };

  const currentFrameData = STORY_FRAMES[currentFrame];
  const pixelArt = PIXEL_ART_FRAMES[currentFrameData.scene] || PIXEL_ART_FRAMES.clinic_exterior;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.frameContainer}>
          <View style={styles.pixelArtContainer}>
            {pixelArt.map((line, rowIndex) => (
              <Animated.View
                key={rowIndex}
                style={{
                  opacity: pixelCharAnims[rowIndex]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }) || 1,
                }}
              >
                <PixelText size="medium" color={COLORS.accent} style={styles.pixelLine}>
                  {line}
                </PixelText>
              </Animated.View>
            ))}
          </View>

          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <View style={styles.textBox}>
              <PixelText size="medium" color={COLORS.white} center>
                {i18n.t(currentFrameData.text)}
              </PixelText>
            </View>
          </Animated.View>
        </View>

        <View style={styles.progressContainer}>
          {STORY_FRAMES.map((frame, index) => (
            <View
              key={frame.id}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index <= currentFrame ? COLORS.accent : COLORS.grayDark,
                  width: index === currentFrame ? 24 : 12,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.controls}>
          <PixelButton
            title={`⏭ ${i18n.t('skip')}`}
            onPress={handleSkip}
            color={COLORS.secondary}
            small
          />
          
          <PixelText size="small" color={COLORS.gray}>
            {i18n.t('frame')} {currentFrame + 1}/{STORY_FRAMES.length}
          </PixelText>

          <PixelButton
            title={`🔄 ${i18n.t('replay')}`}
            onPress={handleReplay}
            color={COLORS.secondary}
            small
          />
        </View>
      </Animated.View>

      {!gameState.get('hasSeenStory') && (
        <View style={styles.unlockBanner}>
          <PixelText size="small" color={COLORS.gold}>
            🔓 {i18n.t('storyUnlocked')}
          </PixelText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelArtContainer: {
    backgroundColor: COLORS.deskDark,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    marginBottom: 30,
  },
  pixelLine: {
    textAlign: 'center',
    letterSpacing: 2,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  textBox: {
    backgroundColor: COLORS.deskDark,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.accentLight,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  unlockBanner: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: COLORS.deskDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
});
