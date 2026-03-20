import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelCard from './PixelCard';
import Px from './Px';
import { t } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Decorative objects built with Views ─────────────────────

function CoffeeMug() {
  return (
    <View style={styles.coffeeMug}>
      {/* Mug body */}
      <View style={styles.mugBody}>
        <Px x={0} y={0} w={14} h={16} color="#e8e0d8" />
        <Px x={1} y={1} w={12} h={2} color="#6b4226" />
        {/* Handle */}
        <Px x={14} y={3} w={4} h={2} color="#e8e0d8" />
        <Px x={16} y={5} w={2} h={6} color="#e8e0d8" />
        <Px x={14} y={11} w={4} h={2} color="#e8e0d8" />
      </View>
      {/* Steam */}
      <Px x={3} y={-6} w={2} h={4} color={COLORS.grayLight + '66'} />
      <Px x={7} y={-8} w={2} h={5} color={COLORS.grayLight + '44'} />
    </View>
  );
}

function PenHolder() {
  return (
    <View style={styles.penHolder}>
      <Px x={0} y={4} w={10} h={12} color={COLORS.grayDark} />
      <Px x={1} y={5} w={8} h={10} color={COLORS.gray} />
      {/* Pens */}
      <Px x={2} y={0} w={2} h={10} color={COLORS.accent} />
      <Px x={5} y={1} w={2} h={9} color={COLORS.red} />
      <Px x={7} y={2} w={2} h={8} color={COLORS.primary} />
    </View>
  );
}

function PostItNotes() {
  return (
    <View style={styles.postIts}>
      <View style={[styles.postIt, { backgroundColor: '#fff59d' }]}>
        <Px x={2} y={3} w={16} h={1} color={COLORS.gray + '88'} />
        <Px x={2} y={6} w={12} h={1} color={COLORS.gray + '88'} />
      </View>
      <View style={[styles.postIt, { backgroundColor: '#f8bbd0', top: 4, left: 6 }]}>
        <Px x={2} y={3} w={14} h={1} color={COLORS.gray + '88'} />
      </View>
    </View>
  );
}

// ── Wood grain lines ─────────────────────────────────────────
function WoodGrain() {
  const grains = [];
  const opacities = [0.06, 0.04, 0.08, 0.03, 0.05, 0.07, 0.04];
  const tops = [12, 28, 48, 68, 85, 105, 125];
  for (let i = 0; i < grains.length || i < 7; i++) {
    grains.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: tops[i],
          height: 1,
          backgroundColor: '#000',
          opacity: opacities[i],
        }}
      />
    );
  }
  return <>{grains}</>;
}

// ── Patient file card ────────────────────────────────────────
function PatientFileCard({ patient, visible }) {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 80)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 80,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!patient) return null;

  const conditionHint = patient.condition
    ? (patient.condition.bodyPart || patient.condition.name || '???')
    : '???';

  return (
    <Animated.View style={[styles.fileCard, { transform: [{ translateY: slideAnim }] }]}>
      <PixelCard
        color={COLORS.paper}
        borderColor={COLORS.border}
        foldedCorner
        style={styles.fileCardInner}
      >
        <View style={styles.fileHeader}>
          <View style={styles.fileClip}>
            <Px x={0} y={0} w={8} h={4} color={COLORS.gray} />
            <Px x={2} y={-3} w={4} h={4} color={COLORS.gray} />
          </View>
          <PixelText size="small" color={COLORS.ink} fontFamily="mono">
            {patient.fullName}
          </PixelText>
        </View>
        <View style={styles.fileDivider} />
        <View style={styles.fileRow}>
          <PixelText size="tiny" color={COLORS.gray} fontFamily="ui">
            {t('patient')}:
          </PixelText>
        </View>
        <View style={styles.fileRow}>
          <PixelText size="tiny" color={COLORS.inkLight} fontFamily="mono">
            {conditionHint}
          </PixelText>
        </View>
        {patient.socialLabel && (
          <View style={styles.fileRow}>
            <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">
              Perfil: {patient.socialLabel}
            </PixelText>
          </View>
        )}
        {patient.isPremium && (
          <View style={styles.fileVipStamp}>
            <PixelText size="tiny" color={COLORS.gold} fontFamily="ui">VIP</PixelText>
          </View>
        )}
        {patient.isReturning && (
          <View style={styles.fileReturnStamp}>
            <PixelText size="tiny" color={COLORS.green} fontFamily="ui">RET</PixelText>
          </View>
        )}
      </PixelCard>
    </Animated.View>
  );
}

// ── Tools rack ───────────────────────────────────────────────
function ToolsRack() {
  return (
    <View style={styles.toolsRack}>
      {/* Stethoscope icon */}
      <View style={styles.toolSlot}>
        <Px x={2} y={0} w={6} h={2} color={COLORS.grayDark} />
        <Px x={0} y={2} w={2} h={6} color={COLORS.grayDark} />
        <Px x={8} y={2} w={2} h={6} color={COLORS.grayDark} />
        <Px x={2} y={8} w={6} h={4} color={COLORS.accent} />
      </View>
      {/* Reflex hammer */}
      <View style={styles.toolSlot}>
        <Px x={4} y={0} w={2} h={8} color={COLORS.secondary} />
        <Px x={1} y={8} w={8} h={4} color={COLORS.grayDark} />
      </View>
      {/* Clipboard */}
      <View style={styles.toolSlot}>
        <Px x={0} y={0} w={10} h={2} color={COLORS.secondary} />
        <Px x={1} y={2} w={8} h={10} color={COLORS.paper} />
        <Px x={2} y={4} w={6} h={1} color={COLORS.gray} />
        <Px x={2} y={6} w={5} h={1} color={COLORS.gray} />
        <Px x={2} y={8} w={6} h={1} color={COLORS.gray} />
      </View>
    </View>
  );
}

// ── Main DeskWorkspace ───────────────────────────────────────
export default function DeskWorkspace({
  currentPatient,
  dayStarted,
  dayEnded,
  dayEarnings,
}) {
  const hasPatient = dayStarted && !dayEnded && currentPatient;

  return (
    <View style={styles.desk}>
      {/* Wood grain texture */}
      <WoodGrain />

      {/* Desk edge highlight (top) */}
      <View style={styles.deskEdge} />

      {/* Decorative objects (always visible) */}
      <CoffeeMug />
      <PenHolder />
      <PostItNotes />

      {/* Tools rack on right edge */}
      <ToolsRack />

      {/* Patient file card (slides onto desk when patient present) */}
      <PatientFileCard
        patient={currentPatient}
        visible={!!hasPatient}
      />

      {/* Empty desk label when no patient */}
      {!hasPatient && (
        <View style={styles.emptyDeskLabel}>
          <PixelText size="small" color={COLORS.paper} fontFamily="ui">
            {dayEnded
              ? t('endOfDay')
              : dayStarted
                ? '...'
                : t('openClinic')}
          </PixelText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  desk: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deskEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.deskLight,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  // Decorative objects
  coffeeMug: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    width: 20,
    height: 24,
  },
  mugBody: {
    position: 'relative',
  },
  penHolder: {
    position: 'absolute',
    top: 12,
    right: 50,
    width: 12,
    height: 18,
  },
  postIts: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    width: 30,
    height: 24,
  },
  postIt: {
    position: 'absolute',
    width: 22,
    height: 18,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  // Tools rack
  toolsRack: {
    position: 'absolute',
    right: 8,
    top: 16,
    width: 14,
    gap: 10,
  },
  toolSlot: {
    width: 12,
    height: 14,
    position: 'relative',
  },

  // Patient file card
  fileCard: {
    position: 'absolute',
    left: 20,
    top: 16,
    width: SCREEN_WIDTH * 0.55,
    maxWidth: 240,
    zIndex: 10,
  },
  fileCardInner: {
    padding: 10,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fileClip: {
    width: 10,
    height: 8,
    position: 'relative',
  },
  fileDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  fileRow: {
    paddingVertical: 2,
  },
  fileVipStamp: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.gold + '33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gold,
    transform: [{ rotate: '-8deg' }],
  },
  fileReturnStamp: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: COLORS.green + '33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.green,
    transform: [{ rotate: '4deg' }],
  },

  // Empty desk
  emptyDeskLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
});
