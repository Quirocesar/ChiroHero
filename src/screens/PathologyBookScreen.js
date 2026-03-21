import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import BackHeader from '../components/BackHeader';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import { PATHOLOGY_BOOK } from '../data/patients';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

export default function PathologyBookScreen({ navigation }) {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [pageAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [selectedChapter]);

  const selectChapter = (index) => {
    pageAnim.setValue(0);
    setSelectedChapter(index);
    soundManager.playClick();
  };

  return (
    <View style={styles.container}>
      <BackHeader title="MANUAL DE PATOLOGÍAS" />
      <ScrollView contentContainerStyle={styles.content}>
      {/* Book cover */}
      <View style={styles.bookCover}>
        <View style={styles.bookBinding}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.bindingDot} />
          ))}
        </View>
        <View style={styles.bookContent}>
          <PixelText size="large" color={COLORS.gold} center glow>
            📖 {t('bookTitle')}
          </PixelText>
          <View style={styles.bookDecor}>
            <View style={styles.bookLine} />
            <PixelText size="small" color={COLORS.red} center glow>
              ⚠️ {t('redFlags')} ⚠️
            </PixelText>
            <View style={styles.bookLine} />
          </View>
          <PixelText size="tiny" color={COLORS.gray} center style={styles.bookSubtitle}>
            {selectedChapter === null
              ? t('goldenRuleText')
              : `${t('chapterIndex')} ${selectedChapter + 1}/${PATHOLOGY_BOOK.chapters.length}`}
          </PixelText>
        </View>
      </View>

      {/* Chapters */}
      {selectedChapter === null ? (
        <Animated.View style={{ opacity: pageAnim }}>
          <PixelText size="medium" color={COLORS.accent} center style={styles.indexTitle}>
            📑 {t('chapterIndex')}
          </PixelText>
          {PATHOLOGY_BOOK.chapters.map((chapter, index) => (
            <PixelCard key={index} color={COLORS.deskDark} borderColor={COLORS.red}>
              <PixelButton
                title={`${index + 1}. ${chapter.title}`}
                icon="⚠️"
                color={COLORS.darkAlt}
                textColor={COLORS.red}
                onPress={() => selectChapter(index)}
                style={styles.chapterButton}
              />
              <PixelText size="tiny" color={COLORS.grayDark} style={styles.chapterPreview}>
                {chapter.description}
              </PixelText>
            </PixelCard>
          ))}
        </Animated.View>
      ) : (
        <Animated.View style={{ opacity: pageAnim, transform: [{ scale: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <PixelCard color={COLORS.paper} borderColor={COLORS.red}>
            <PixelText size="medium" color={COLORS.red} shadow={false} glow>
              ⚠️ {PATHOLOGY_BOOK.chapters[selectedChapter].title}
            </PixelText>

            <View style={styles.chapterDivider} />

            <PixelText size="small" color={COLORS.ink} shadow={false} style={styles.chapterDesc}>
              {PATHOLOGY_BOOK.chapters[selectedChapter].description}
            </PixelText>

            <View style={styles.redFlagsSection}>
              <PixelText size="normal" color={COLORS.red} shadow={false} glow>
                🚩 {t('redFlags')}:
              </PixelText>
              {PATHOLOGY_BOOK.chapters[selectedChapter].redFlags.map((flag, i) => (
                <View key={i} style={styles.flagItem}>
                  <View style={styles.flagBullet} />
                  <PixelText size="small" color={COLORS.ink} shadow={false}>
                    {flag}
                  </PixelText>
                </View>
              ))}
            </View>

            <View style={styles.actionSection}>
              <PixelText size="normal" color={COLORS.primary} shadow={false}>
                🏥 {t('action')}:
              </PixelText>
              <PixelText size="small" color={COLORS.red} shadow={false} style={styles.actionText}>
                {PATHOLOGY_BOOK.chapters[selectedChapter].action}
              </PixelText>
            </View>
          </PixelCard>

          {/* Navigation between chapters */}
          <View style={styles.chapterNav}>
            {selectedChapter > 0 && (
              <PixelButton
                title="← PREV"
                color={COLORS.dark}
                onPress={() => selectChapter(selectedChapter - 1)}
                small
                style={{ flex: 1 }}
              />
            )}
            <View style={{ flex: 1 }} />
            {selectedChapter < PATHOLOGY_BOOK.chapters.length - 1 && (
              <PixelButton
                title="NEXT →"
                color={COLORS.dark}
                onPress={() => selectChapter(selectedChapter + 1)}
                small
                style={{ flex: 1 }}
              />
            )}
          </View>

          <PixelButton
            title={`← ${t('backToIndex')}`}
            color={COLORS.darkAlt}
            onPress={() => { pageAnim.setValue(0); setSelectedChapter(null); }}
          />
        </Animated.View>
      )}

      {/* Golden rule */}
      {selectedChapter === null && (
        <PixelCard color="#3a1a1a" borderColor={COLORS.red}>
          <PixelText size="normal" color={COLORS.red} center glow>
            ⚡ {t('goldenRule')}
          </PixelText>
          <PixelText size="small" color={COLORS.white} center style={styles.goldenRule}>
            {t('goldenRuleText')}
          </PixelText>
        </PixelCard>
      )}

      <PixelButton
        title={t('closeManual')}
        icon="✕"
        color={COLORS.dark}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 12,
    paddingTop: 40,
    gap: 8,
    flexGrow: 1,
    paddingBottom: 20,
  },
  bookCover: {
    flexDirection: 'row',
    backgroundColor: COLORS.deskDark,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  bookBinding: {
    width: 16,
    backgroundColor: COLORS.goldDark || '#d4a017',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bindingDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  bookContent: {
    flex: 1,
    padding: 16,
  },
  bookDecor: {
    marginVertical: 10,
    gap: 6,
  },
  bookLine: {
    height: 2,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  bookSubtitle: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  indexTitle: {
    marginBottom: 4,
  },
  chapterButton: {
    borderWidth: 0,
    marginVertical: 0,
  },
  chapterPreview: {
    marginTop: -4,
    paddingLeft: 8,
    fontStyle: 'italic',
  },
  chapterDivider: {
    height: 2,
    backgroundColor: COLORS.red,
    marginVertical: 8,
    opacity: 0.4,
  },
  chapterDesc: {
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  redFlagsSection: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: COLORS.red,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    gap: 8,
  },
  flagBullet: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.red,
    borderRadius: 4,
  },
  actionSection: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  actionText: {
    fontWeight: 'bold',
  },
  chapterNav: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  goldenRule: {
    lineHeight: 20,
    marginTop: 6,
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 12,
  },
});
