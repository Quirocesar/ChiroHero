import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width, height } = Dimensions.get('window');

const TOOLS = [
  { id: 'ajuste',         icon: '🤲', label: 'Ajuste',       xp: 25 },
  { id: 'descontractura', icon: '💆', label: 'Músculo',      xp: 20 },
  { id: 'ultrasonido',    icon: '🔊', label: 'Ultrasonido',  xp: 15 },
  { id: 'tens',           icon: '⚡', label: 'TENS',         xp: 15 },
  { id: 'ejercicios',     icon: '🏋', label: 'Ejercicios',   xp: 20 },
  { id: 'calor',          icon: '🔥', label: 'Calor/Frío',   xp: 10 },
];

export default function SalaCerradaScreen({ navigation, route }) {
  const patient = route.params?.patient || {
    name: 'Paciente Demo',
    complaint: 'Dolor lumbar irradiado',
  };

  const patientY = useRef(new Animated.Value(-height * 0.35)).current;
  const [experience, setExperience] = useState(0);
  const [usedTools, setUsedTools] = useState(new Set());
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    soundManager.init();
    soundManager.playClick();
    Animated.timing(patientY, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [patientY]);

  const face = experience >= 75 ? '🤩'
    : experience >= 50 ? '😄'
    : experience >= 25 ? '🙂'
    : '😐';

  const useTool = useCallback((tool) => {
    if (usedTools.has(tool.id) || finished) return;
    soundManager.playClick();
    const next = new Set(usedTools);
    next.add(tool.id);
    setUsedTools(next);
    setExperience(prev => Math.min(100, prev + tool.xp));
  }, [usedTools, finished]);

  const handleFinish = useCallback(() => {
    const base = 80;
    const bonus = Math.floor(experience / 100 * base * 0.5);
    const total = base + bonus;
    const rep = Math.floor(experience / 25);

    // gameState.set() takes a plain object
    gameState.set({ money: (gameState.get('money') || 0) + total });
    gameState.set({ reputation: Math.min(100, (gameState.get('reputation') || 50) + rep) });

    soundManager.playSuccess();
    setResult({ earnings: total, rep });
    setFinished(true);
  }, [experience]);

  if (result) {
    return (
      <View style={styles.container}>
        <BackHeader title="RESULTADO" onBack={() => navigation.navigate('ClinicView')} />
        <View style={styles.resultView}>
          <PixelText size="large" center>{face}</PixelText>
          <PixelText size="medium" color={COLORS.gold} center style={{ marginTop: 12 }}>
            +${result.earnings}
          </PixelText>
          <PixelText size="small" color={COLORS.accent} center>
            +{result.rep} reputación
          </PixelText>
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBar, { width: `${experience}%` }]} />
          </View>
          <PixelText size="tiny" color={COLORS.gray} center>
            Experiencia del paciente: {experience}%
          </PixelText>
          <PixelButton
            title="SIGUIENTE PACIENTE"
            icon="➡"
            color={COLORS.primary}
            onPress={() => navigation.navigate('ClinicView')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title="SALA CERRADA" onBack={() => navigation.navigate('ClinicView')} />

      <Animated.View style={[styles.patientArea, { transform: [{ translateY: patientY }] }]}>
        <PixelText size="large" center>{face}</PixelText>
        <PixelText size="small" color={COLORS.white} center>{patient.name}</PixelText>
        <PixelText size="tiny" color={COLORS.gray} center>{patient.complaint}</PixelText>
      </Animated.View>

      <View style={styles.xpSection}>
        <PixelText size="tiny" color={COLORS.grayLight}>Experiencia del paciente</PixelText>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${experience}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.toolGrid}>
        {TOOLS.map(tool => {
          const used = usedTools.has(tool.id);
          return (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolBtn, used && styles.toolUsed]}
              onPress={() => useTool(tool)}
              disabled={used}
            >
              <PixelText size="large">{tool.icon}</PixelText>
              <PixelText size="tiny" color={used ? COLORS.gray : COLORS.white} center>
                {tool.label}
              </PixelText>
              <PixelText size="tiny" color={used ? COLORS.gray : COLORS.accent} center>
                {used ? '✓' : `+${tool.xp}xp`}
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PixelButton
          title="FINALIZAR TRATAMIENTO"
          icon="✅"
          color={COLORS.green}
          onPress={handleFinish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  patientArea: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
    gap: 4,
  },
  xpSection: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  xpBarContainer: {
    height: 10,
    backgroundColor: COLORS.bgDark,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    overflow: 'hidden',
  },
  xpBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 5 },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    justifyContent: 'center',
  },
  toolBtn: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.deskDark,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '60',
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  toolUsed: { borderColor: COLORS.grayDark, backgroundColor: COLORS.bgDark },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.deskDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '30',
  },
  resultView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
});
