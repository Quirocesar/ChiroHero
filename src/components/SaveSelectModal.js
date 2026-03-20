import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

export default function SaveSelectModal({ visible, onClose, onSelectSlot }) {
  const [slotsData, setSlotsData] = useState({
    1: { exists: false },
    2: { exists: false },
    3: { exists: false }
  });

  useEffect(() => {
    if (visible) {
      loadSlots();
    }
  }, [visible]);

  const loadSlots = async () => {
    const data = await gameState.getAvailableSlots();
    setSlotsData(data);
  };

  const handleSelect = async (slotId) => {
    soundManager.playClick();
    const data = slotsData[slotId];
    if (data.exists) {
      await gameState.load(slotId);
      onSelectSlot(false);
    } else {
      gameState.reset();
      gameState.currentSlot = slotId;
      await gameState.save();
      onSelectSlot(true);
    }
  };

  const handleDelete = async (slotId) => {
    soundManager.playClick();
    gameState.currentSlot = slotId;
    gameState.reset();
    await loadSlots();
  };

  if (!visible) return null;

  const slotColors = [COLORS.accent, COLORS.green, COLORS.gold];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText size="large" color={COLORS.paper} center>
            🗄️ {t('saveFiles') || 'SAVE FILES'}
          </PixelText>
        </View>

        {/* Slots */}
        <View style={styles.content}>
          {[1, 2, 3].map((slotNum) => {
            const data = slotsData[slotNum];
            const accentColor = slotColors[slotNum - 1];
            return (
              <View key={slotNum} style={styles.slotContainer}>
                <TouchableOpacity
                  style={[
                    styles.slotButton,
                    data.exists
                      ? [styles.slotActive, { borderColor: COLORS.deskLight }]
                      : styles.slotEmpty,
                  ]}
                  onPress={() => handleSelect(slotNum)}
                  activeOpacity={0.8}
                >
                  {/* File folder tab — colored strip at top */}
                  {data.exists && (
                    <View style={[styles.folderTab, { backgroundColor: accentColor }]} />
                  )}

                  {/* Slot number badge */}
                  <View style={[styles.slotBadge, { backgroundColor: data.exists ? accentColor : COLORS.deskDark }]}>
                    <PixelText size="tiny" color={COLORS.paper} center shadow={false}>{slotNum}</PixelText>
                  </View>

                  <View style={styles.slotLeft}>
                    <View style={[styles.slotIcon, {
                      backgroundColor: data.exists ? COLORS.deskDark : COLORS.bg,
                      borderColor: data.exists ? COLORS.deskLight : COLORS.border,
                    }]}>
                      <PixelText size="small" color={COLORS.paper}>{data.exists ? '📁' : '📂'}</PixelText>
                    </View>
                    <PixelText size="small" color={data.exists ? COLORS.paper : COLORS.border}>
                      SLOT {slotNum}
                    </PixelText>
                  </View>
                  {data.exists ? (
                    <View style={styles.slotInfo}>
                      <View style={styles.slotInfoRow}>
                        <PixelText size="tiny" color={COLORS.primary}>📅 {t('day')} {data.day}</PixelText>
                      </View>
                      <View style={styles.slotInfoRow}>
                        <PixelText size="tiny" color={COLORS.accent}>⭐ {data.reputation}</PixelText>
                      </View>
                      <View style={styles.slotInfoRow}>
                        <PixelText size="tiny" color={COLORS.green}>💰 ${data.money}</PixelText>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyLabel}>
                      <PixelText size="tiny" color={COLORS.border}>
                        — {t('empty') || 'EMPTY'} —
                      </PixelText>
                    </View>
                  )}

                  {/* Inner highlight */}
                  {data.exists && (
                    <View style={[styles.slotHighlight, { backgroundColor: accentColor + '18' }]} />
                  )}
                </TouchableOpacity>

                {data.exists && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(slotNum)}
                  >
                    <PixelText size="small" color={COLORS.paper} center>✕</PixelText>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <PixelButton
          title={t('back') || 'BACK'}
          color={COLORS.deskDark}
          onPress={() => { soundManager.playClick(); onClose(); }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.deskDark,
    borderWidth: 2,
    borderColor: COLORS.desk,
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    marginBottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    alignItems: 'center',
  },
  content: {
    gap: 12,
    marginBottom: 18,
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    minHeight: 80,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  slotBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotIcon: {
    width: 34,
    height: 34,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  slotActive: {
    backgroundColor: COLORS.desk,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  slotEmpty: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  folderTab: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  slotInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  slotInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyLabel: {
    opacity: 0.6,
  },
  slotHighlight: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: 3,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.red,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
});
