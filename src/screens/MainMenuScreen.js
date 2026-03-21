import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import i18n from '../utils/i18n';
import SaveSelectModal from '../components/SaveSelectModal';
import TutorialTarget from '../components/TutorialTarget';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.88, 380);

// ─── Typewriter hook ────────────────────────────────────────────────────────
function useTypewriter(text, duration, startDelay) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, duration / text.length);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, duration, startDelay]);
  return displayed;
}

// ─── Decorative desk items ───────────────────────────────────────────────────

function CoffeeMug({ steam1, steam2 }) {
  const steam1Y = steam1.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const steam2Y = steam2.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const steam1O = steam1.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] });
  const steam2O = steam2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.6, 0] });
  const steam1X = steam1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 3, -2] });
  const steam2X = steam2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -3, 2] });
  return (
    <View style={styles.mugWrapper}>
      {/* Steam */}
      <Animated.View style={[styles.steamLine, {
        left: 7, opacity: steam1O,
        transform: [{ translateY: steam1Y }, { translateX: steam1X }],
      }]} />
      <Animated.View style={[styles.steamLine, {
        left: 14, opacity: steam2O,
        transform: [{ translateY: steam2Y }, { translateX: steam2X }],
      }]} />
      {/* Mug body */}
      <View style={styles.mugBody}>
        {/* White interior oval */}
        <View style={styles.mugInterior} />
        {/* Liquid */}
        <View style={styles.mugLiquid} />
      </View>
      {/* Handle */}
      <View style={styles.mugHandle} />
    </View>
  );
}

function Pen() {
  return (
    <View style={styles.penWrapper}>
      <View style={[styles.penBody, { transform: [{ rotate: '-30deg' }] }]}>
        <View style={styles.penClip} />
        <View style={styles.penTip} />
      </View>
    </View>
  );
}

function Plant() {
  return (
    <View style={styles.plantWrapper}>
      {/* Leaves */}
      <View style={[styles.leaf, { left: 2, top: 0, transform: [{ rotate: '-25deg' }] }]} />
      <View style={[styles.leaf, { left: 10, top: -4, transform: [{ rotate: '10deg' }] }]} />
      <View style={[styles.leaf, { left: 18, top: 0, transform: [{ rotate: '30deg' }] }]} />
      {/* Stem */}
      <View style={styles.plantStem} />
      {/* Pot */}
      <View style={styles.pot}>
        <View style={styles.potRim} />
      </View>
    </View>
  );
}

function PostIt({ color, rotation, lines = 2 }) {
  return (
    <View style={[styles.postIt, { backgroundColor: color, transform: [{ rotate: rotation }] }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={styles.postItLine} />
      ))}
    </View>
  );
}

function Stethoscope() {
  return (
    <View style={styles.stethWrapper}>
      {/* Earpiece bar */}
      <View style={styles.stethEarBar} />
      {/* Left tube */}
      <View style={[styles.stethTube, { left: 2 }]} />
      {/* Right tube */}
      <View style={[styles.stethTube, { right: 2 }]} />
      {/* Connecting tube */}
      <View style={styles.stethConnector} />
      {/* Chest piece circle */}
      <View style={styles.stethChest} />
      <View style={styles.stethChestInner} />
    </View>
  );
}

// ─── File Tab component ──────────────────────────────────────────────────────
function FileTab({ label, color, anim, onPress }) {
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.85, 1.05, 1] });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <PixelButton
        title={label}
        onPress={onPress}
        variant="secondary"
        style={[styles.fileTab, { borderTopColor: color, borderTopWidth: 3 }]}
        small
      />
    </Animated.View>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MainMenuScreen({ navigation }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [hasSave, setHasSave] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [currentLang, setCurrentLang] = useState(gameState.get('language') || 'es');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // ── Typewriter ─────────────────────────────────────────────────────────────
  const titleText = useTypewriter('CHIRO HERO', 600, 600);

  // ── Entrance animations ────────────────────────────────────────────────────
  const deskFade      = useRef(new Animated.Value(0)).current;   // desk bg fades in
  const letterY       = useRef(new Animated.Value(-120)).current; // letterhead drops
  const letterO       = useRef(new Animated.Value(0)).current;
  const sealScale     = useRef(new Animated.Value(0)).current;   // seal stamps
  const playSlide     = useRef(new Animated.Value(80)).current;  // play btn slides up
  const playO         = useRef(new Animated.Value(0)).current;
  const tab1Anim      = useRef(new Animated.Value(0)).current;
  const tab2Anim      = useRef(new Animated.Value(0)).current;
  const tab3Anim      = useRef(new Animated.Value(0)).current;
  const item1Anim     = useRef(new Animated.Value(0)).current;   // desk items pop
  const item2Anim     = useRef(new Animated.Value(0)).current;
  const item3Anim     = useRef(new Animated.Value(0)).current;
  const item4Anim     = useRef(new Animated.Value(0)).current;
  const item5Anim     = useRef(new Animated.Value(0)).current;
  const langO         = useRef(new Animated.Value(0)).current;
  const footerO       = useRef(new Animated.Value(0)).current;

  // ── Steam loops (2 animated values) ───────────────────────────────────────
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkSave();
    soundManager.init();
    soundManager.playMenuMusic();
    setMusicOn(soundManager.musicEnabled);

    // Desk fades in (0-200ms)
    Animated.timing(deskFade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Letterhead drops with bounce (400ms, starts at 0)
    Animated.parallel([
      Animated.spring(letterY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(letterO, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Seal stamps down with scale bounce (300ms, delay 800ms)
    Animated.sequence([
      Animated.delay(800),
      Animated.spring(sealScale, {
        toValue: 1,
        tension: 60,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Play button slides in from bottom (spring, delay 1000ms)
    Animated.sequence([
      Animated.delay(1000),
      Animated.parallel([
        Animated.spring(playSlide, {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(playO, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // File tabs fan out (stagger 100ms each, delay 1200ms)
    Animated.sequence([
      Animated.delay(1200),
      Animated.stagger(100, [
        Animated.spring(tab1Anim, { toValue: 1, tension: 45, friction: 6, useNativeDriver: true }),
        Animated.spring(tab2Anim, { toValue: 1, tension: 45, friction: 6, useNativeDriver: true }),
        Animated.spring(tab3Anim, { toValue: 1, tension: 45, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    // Desk items pop in (stagger, delay 1500ms)
    Animated.sequence([
      Animated.delay(1500),
      Animated.stagger(120, [
        Animated.spring(item1Anim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
        Animated.spring(item2Anim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
        Animated.spring(item3Anim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
        Animated.spring(item4Anim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
        Animated.spring(item5Anim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
      ]),
    ]).start();

    // Language & footer fade in
    Animated.sequence([
      Animated.delay(1600),
      Animated.timing(langO, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(footerO, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Steam loops
    Animated.loop(
      Animated.timing(steam1, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(steam2, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => soundManager.stopMusic();
  }, []);

  // ── Business logic ─────────────────────────────────────────────────────────
  const checkSave = async () => {
    const loaded = await gameState.load();
    setHasSave(loaded);
  };

  const handleLanguageChange = async (langCode) => {
    soundManager.playClick();
    setCurrentLang(langCode);
    i18n.setLanguage(langCode);
    gameState.set({ language: langCode });
    await gameState.save();
  };

  const handleSlotSelect = (isNewGame) => {
    setShowSaveModal(false);
    soundManager.stopMusic();
    if (isNewGame) {
      navigation.navigate('GameModeSelector');
    } else {
      navigation.navigate('ClinicView');
    }
  };

  const handleReplayTutorial = () => {
    soundManager.playClick();
    soundManager.stopMusic();
    navigation.navigate('TutorialScreen');
  };

  // ── Derived interpolations ─────────────────────────────────────────────────
  const deskItemScale = (anim) =>
    anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.15, 1] });
  const deskItemO = (anim) =>
    anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: deskFade }]}>
      {/* Wood grain texture overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {GRAIN_OFFSETS.map((g, i) => (
          <View
            key={i}
            style={[styles.grainLine, { top: g.top, opacity: g.opacity }]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Clinic letterhead document ─────────────────────────────────── */}
        <Animated.View
          style={[
            styles.letterhead,
            {
              opacity: letterO,
              transform: [{ translateY: letterY }],
            },
          ]}
        >
          {/* Decorative border top rule */}
          <View style={styles.letterBorderTop} />
          <View style={styles.letterBorderTopThin} />

          {/* Clinic header */}
          <View style={styles.letterHeaderRow}>
            <View style={styles.letterLeftCol}>
              <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight}>
                CONSULTORIO
              </PixelText>
              <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight}>
                No. 001
              </PixelText>
            </View>
            <View style={styles.letterCenter}>
              <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight} center>
                CLINICA QUIROPRACTICA
              </PixelText>
            </View>
            <View style={styles.letterRightCol}>
              <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight}>
                LICENCIA
              </PixelText>
              <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight}>
                QP-2024
              </PixelText>
            </View>
          </View>

          {/* Main title — typewriter */}
          <View style={styles.letterTitleRow}>
            <PixelText
              fontFamily="mono"
              size="title"
              color={COLORS.ink}
              center
              style={styles.letterTitle}
            >
              {titleText}
              <PixelText
                fontFamily="mono"
                size="title"
                color={COLORS.primary}
                style={styles.cursor}
              >
                {titleText.length < 'CHIRO HERO'.length ? '|' : ''}
              </PixelText>
            </PixelText>
          </View>

          {/* Subtitle rule */}
          <View style={styles.letterSubRule} />
          <PixelText fontFamily="ui" size="tiny" color={COLORS.inkLight} center style={styles.letterSubtitle}>
            Licensed Chiropractor — {i18n.t('subtitle')}
          </PixelText>
          <View style={styles.letterSubRule} />

          {/* Paper lines */}
          <View style={styles.paperLinesArea}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.paperLine} />
            ))}
          </View>

          {/* Official seal — stamps down with bounce */}
          <Animated.View
            style={[
              styles.sealWrapper,
              {
                transform: [{ scale: sealScale }],
              },
            ]}
          >
            <View style={styles.sealOuter}>
              <View style={styles.sealInner}>
                <View style={styles.sealRing} />
                <PixelText fontFamily="ui" size="tiny" color={COLORS.red} center style={styles.sealText}>
                  APPROVED
                </PixelText>
                <PixelText fontFamily="ui" size="tiny" color={COLORS.redDark} center style={styles.sealSubText}>
                  CHIRO CLINIC
                </PixelText>
              </View>
            </View>
          </Animated.View>

          {/* Border bottom rules */}
          <View style={styles.letterBorderBottomThin} />
          <View style={styles.letterBorderBottom} />
        </Animated.View>

        {/* ── PLAY button ────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.playWrapper,
            {
              opacity: playO,
              transform: [{ translateY: playSlide }],
            },
          ]}
        >
          <TutorialTarget id="playButton">
            <PixelButton
              title={`  ${i18n.t('play')}  `}
              onPress={() => {
                soundManager.playClick();
                setShowSaveModal(true);
              }}
              variant="primary"
              size="large"
              style={styles.playButton}
            />
          </TutorialTarget>
        </Animated.View>

        {/* ── Stacked file tabs ──────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsRow}
        >
          <FileTab
            label={`  ${i18n.t('playTutorial')}`}
            color={COLORS.accent}
            anim={tab1Anim}
            onPress={handleReplayTutorial}
          />
          <FileTab
            label={`  ${i18n.t('pathologyManual')}`}
            color={COLORS.primary}
            anim={tab2Anim}
            onPress={() => {
              soundManager.playClick();
              navigation.navigate('PathologyBook');
            }}
          />
          <FileTab
            label={`  ${i18n.t('achievements')}`}
            color={COLORS.gold}
            anim={tab3Anim}
            onPress={() => {
              soundManager.playClick();
              navigation.navigate('Achievements');
            }}
          />
        </ScrollView>

        {/* Conditional story button */}
        {hasSave && gameState.get('hasSeenStory') && (
          <Animated.View style={{ opacity: langO }}>
            <PixelButton
              title={`  ${i18n.t('introductionStory')}`}
              variant="secondary"
              onPress={() => {
                soundManager.playClick();
                navigation.navigate('IntroductionStory');
              }}
              style={[styles.fileTab, { borderTopColor: COLORS.orange, borderTopWidth: 3, marginTop: 6 }]}
              small
            />
          </Animated.View>
        )}

        {/* ── Desk items row ─────────────────────────────────────────────── */}
        <View style={styles.deskItemsRow}>
          {/* Coffee mug */}
          <Animated.View style={[
            styles.deskItemSlot,
            {
              opacity: deskItemO(item1Anim),
              transform: [{ scale: deskItemScale(item1Anim) }],
            },
          ]}>
            <CoffeeMug steam1={steam1} steam2={steam2} />
          </Animated.View>

          {/* Stethoscope */}
          <Animated.View style={[
            styles.deskItemSlot,
            {
              opacity: deskItemO(item2Anim),
              transform: [{ scale: deskItemScale(item2Anim) }],
            },
          ]}>
            <Stethoscope />
          </Animated.View>

          {/* Pen */}
          <Animated.View style={[
            styles.deskItemSlot,
            {
              opacity: deskItemO(item3Anim),
              transform: [{ scale: deskItemScale(item3Anim) }],
            },
          ]}>
            <Pen />
          </Animated.View>

          {/* Plant */}
          <Animated.View style={[
            styles.deskItemSlot,
            {
              opacity: deskItemO(item4Anim),
              transform: [{ scale: deskItemScale(item4Anim) }],
            },
          ]}>
            <Plant />
          </Animated.View>

          {/* Post-it notes cluster */}
          <Animated.View style={[
            styles.deskItemSlot,
            styles.postItCluster,
            {
              opacity: deskItemO(item5Anim),
              transform: [{ scale: deskItemScale(item5Anim) }],
            },
          ]}>
            <PostIt color={COLORS.primary}   rotation="-8deg"  lines={2} />
            <PostIt color="#b8e0ff"           rotation="5deg"   lines={1} />
            <PostIt color={COLORS.accentLight} rotation="-3deg" lines={2} />
          </Animated.View>
        </View>

        {/* ── Music toggle ───────────────────────────────────────────────── */}
        <Animated.View style={[styles.musicRow, { opacity: langO }]}>
          <PixelButton
            title={musicOn ? i18n.t('musicOn') : i18n.t('musicOff')}
            icon={musicOn ? '' : ''}
            variant="secondary"
            onPress={() => {
              const on = soundManager.toggleMusic();
              setMusicOn(on);
              if (on) soundManager.playMenuMusic();
            }}
            style={styles.musicButton}
            small
          />
        </Animated.View>

        {/* ── Language selector ──────────────────────────────────────────── */}
        <Animated.View style={[styles.languageContainer, { opacity: langO }]}>
          <View style={styles.langHeader}>
            <View style={styles.langHeaderLine} />
            <PixelText fontFamily="ui" size="tiny" color={COLORS.grayLight} style={styles.langHeaderLabel}>
              {i18n.t('language')}
            </PixelText>
            <View style={styles.langHeaderLine} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageScroll}
          >
            {i18n.getAvailableLanguages().map((lang) => (
              <PixelButton
                key={lang.code}
                title={`${lang.flag} ${lang.code.toUpperCase()}`}
                variant={currentLang === lang.code ? 'primary' : 'secondary'}
                onPress={() => handleLanguageChange(lang.code)}
                small
                style={styles.langButton}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.footer, { opacity: footerO }]}>
          <View style={styles.footerRule} />
          <PixelText fontFamily="ui" size="tiny" color={COLORS.grayDark} center>
            {i18n.t('version')}
          </PixelText>
          <PixelText fontFamily="ui" size="tiny" color={COLORS.grayDark} center style={styles.disclaimer}>
            {i18n.t('disclaimer')}
          </PixelText>
        </Animated.View>
      </ScrollView>

      {/* Save Select Modal */}
      <SaveSelectModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSelectSlot={handleSlotSelect}
      />
    </Animated.View>
  );
}

// ── Wood grain data (static, no per-render randomness) ────────────────────────
const GRAIN_OFFSETS = [
  { top: '6%',  opacity: 0.06 },
  { top: '13%', opacity: 0.04 },
  { top: '21%', opacity: 0.08 },
  { top: '28%', opacity: 0.05 },
  { top: '35%', opacity: 0.07 },
  { top: '44%', opacity: 0.04 },
  { top: '52%', opacity: 0.06 },
  { top: '61%', opacity: 0.05 },
  { top: '70%', opacity: 0.07 },
  { top: '79%', opacity: 0.04 },
  { top: '87%', opacity: 0.06 },
  { top: '94%', opacity: 0.05 },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Container / background ─────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.desk,
  },
  grainLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.deskDark,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 60,
    paddingHorizontal: 16,
  },

  // ── Letterhead document ────────────────────────────────────────────────────
  letterhead: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.paper,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 18,
    // Paper shadow on desk — deeper for realism
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'visible',
  },
  letterBorderTop: {
    height: 4,
    backgroundColor: COLORS.ink,
    marginBottom: 2,
    marginHorizontal: -18,
    marginTop: -14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  letterBorderTopThin: {
    height: 1.5,
    backgroundColor: COLORS.primary,
    marginHorizontal: 0,
    marginBottom: 10,
  },
  letterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  letterLeftCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  letterCenter: {
    flex: 2,
    alignItems: 'center',
  },
  letterRightCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  letterTitleRow: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 52,
  },
  letterTitle: {
    letterSpacing: 5,
    fontSize: 28,
  },
  cursor: {
    // Typewriter cursor inline
  },
  letterSubRule: {
    height: 1,
    backgroundColor: COLORS.inkLight,
    opacity: 0.35,
    marginVertical: 5,
  },
  letterSubtitle: {
    letterSpacing: 1,
    marginVertical: 2,
    opacity: 0.7,
  },
  paperLinesArea: {
    marginTop: 10,
    gap: 8,
  },
  paperLine: {
    height: 1,
    backgroundColor: COLORS.accentLight,
    opacity: 0.2,
  },

  // Seal
  sealWrapper: {
    position: 'absolute',
    right: 14,
    bottom: 22,
  },
  sealOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: COLORS.red,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(193,55,79,0.06)',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sealInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(193,55,79,0.1)',
  },
  sealRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.red,
    opacity: 0.4,
  },
  sealText: {
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  sealSubText: {
    fontSize: 6,
    letterSpacing: 0.5,
    lineHeight: 8,
  },

  letterBorderBottomThin: {
    height: 1.5,
    backgroundColor: COLORS.primary,
    marginHorizontal: 0,
    marginTop: 12,
    marginBottom: 2,
  },
  letterBorderBottom: {
    height: 4,
    backgroundColor: COLORS.ink,
    marginHorizontal: -18,
    marginBottom: -14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  // ── Play button ────────────────────────────────────────────────────────────
  playWrapper: {
    width: CARD_WIDTH,
    marginBottom: 14,
    // golden glow under the button — more dramatic
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  playButton: {
    width: '100%',
  },

  // ── File tabs ──────────────────────────────────────────────────────────────
  tabsScrollView: {
    width: CARD_WIDTH,
    marginBottom: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 4,
  },
  fileTab: {
    minWidth: 100,
    borderRadius: 8,
    backgroundColor: COLORS.paperDark,
    // stacked paper look — deeper shadow
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── Desk items ─────────────────────────────────────────────────────────────
  deskItemsRow: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  deskItemSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // Coffee mug
  mugWrapper: {
    width: 28,
    alignItems: 'flex-start',
    position: 'relative',
  },
  steamLine: {
    position: 'absolute',
    top: -6,
    width: 2,
    height: 10,
    backgroundColor: COLORS.paperLight,
    borderRadius: 1,
    opacity: 0.6,
  },
  mugBody: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    borderWidth: 2.5,
    borderColor: COLORS.secondaryLight,
    alignItems: 'center',
    paddingTop: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mugInterior: {
    width: 18,
    height: 10,
    backgroundColor: COLORS.paperDark,
    borderRadius: 9,
    opacity: 0.5,
  },
  mugLiquid: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    right: 2,
    height: 10,
    backgroundColor: '#5c3010',
    borderRadius: 2,
  },
  mugHandle: {
    position: 'absolute',
    right: -5,
    top: 6,
    width: 7,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.secondaryLight,
    backgroundColor: 'transparent',
  },

  // Pen
  penWrapper: {
    width: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penBody: {
    width: 8,
    height: 44,
    backgroundColor: COLORS.dark,
    borderRadius: 2,
    position: 'relative',
  },
  penClip: {
    position: 'absolute',
    top: 4,
    left: -2,
    width: 3,
    height: 20,
    backgroundColor: COLORS.goldDark,
    borderRadius: 1,
  },
  penTip: {
    position: 'absolute',
    bottom: -4,
    left: 1,
    width: 6,
    height: 6,
    backgroundColor: COLORS.grayLight,
    borderRadius: 1,
  },

  // Plant
  plantWrapper: {
    width: 34,
    alignItems: 'center',
    position: 'relative',
  },
  leaf: {
    position: 'absolute',
    width: 10,
    height: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
    top: 0,
  },
  plantStem: {
    width: 3,
    height: 16,
    backgroundColor: COLORS.accentDark,
    borderRadius: 1,
    marginTop: 12,
  },
  pot: {
    width: 26,
    height: 18,
    backgroundColor: '#b5622b',
    borderRadius: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: 'center',
    overflow: 'visible',
  },
  potRim: {
    width: 30,
    height: 5,
    backgroundColor: '#c87840',
    borderRadius: 2,
    marginTop: -3,
  },

  // Post-its
  postItCluster: {
    width: 36,
    height: 36,
    position: 'relative',
  },
  postIt: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 1,
    padding: 4,
    gap: 4,
    // drop shadow for sticky note effect
    shadowColor: COLORS.deskDark,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  postItLine: {
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 1,
  },

  // Stethoscope
  stethWrapper: {
    width: 36,
    height: 44,
    position: 'relative',
    alignItems: 'center',
  },
  stethEarBar: {
    width: 24,
    height: 4,
    backgroundColor: COLORS.grayDark,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
  stethTube: {
    position: 'absolute',
    top: 4,
    width: 3,
    height: 22,
    backgroundColor: COLORS.grayDark,
    borderRadius: 2,
  },
  stethConnector: {
    position: 'absolute',
    top: 26,
    left: '50%',
    marginLeft: -1.5,
    width: 3,
    height: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
  },
  stethChest: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayDark,
    borderWidth: 2,
    borderColor: COLORS.gray,
  },
  stethChestInner: {
    position: 'absolute',
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.grayLight,
    opacity: 0.5,
  },

  // ── Music toggle ───────────────────────────────────────────────────────────
  musicRow: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
  musicButton: {
    width: '100%',
  },

  // ── Language selector ──────────────────────────────────────────────────────
  languageContainer: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
  langHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  langHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.deskLight,
    opacity: 0.6,
  },
  langHeaderLabel: {
    opacity: 0.7,
    paddingHorizontal: 4,
  },
  languageScroll: {
    gap: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  langButton: {
    minWidth: 72,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    marginTop: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerRule: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.deskLight,
    opacity: 0.5,
    marginBottom: 8,
  },
  disclaimer: {
    marginTop: 4,
    opacity: 0.55,
  },
});
