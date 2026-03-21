import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width } = Dimensions.get('window');

const MODES = [
  {
    id: 'salaCerrada',
    icon: '🏥',
    label: 'SALA CERRADA',
    subtitle: 'Atención personalizada',
    color: COLORS.accent,
    features: [
      '1 camilla, máxima atención',
      'Ajuste + trabajo muscular',
      'Ultrasonido, TENS, ejercicios',
      'Mayor ingreso por paciente',
      'Vista de frente al paciente',
    ],
  },
  {
    id: 'salaAbierta',
    icon: '🏢',
    label: 'SALA ABIERTA',
    subtitle: 'Clínica de alto volumen',
    color: COLORS.primary,
    features: [
      '2 camillas (ampliable a 6)',
      'Solo ajuste quiropráctico',
      'Vista aérea de la clínica',
      'Pacientes entran caminando',
      'Gestión simultánea',
    ],
  },
];

export default function ClinicModeSelectorScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const scaleAnims = useRef(MODES.map(() => new Animated.Value(1))).current;

  const handleSelect = (modeId, index) => {
    soundManager.playClick();
    setSelected(modeId);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1.0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirm = () => {
    if (!selected) return;
    // gameState.set() takes a plain object — NOT (key, value)
    gameState.set({ clinicMode: selected });
    soundManager.playSuccess();
    navigation.navigate('ClinicView');
  };

  return (
    <View style={styles.container}>
      <BackHeader title="ELIGE TU CLÍNICA" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PixelText size="small" color={COLORS.gray} center style={{ marginBottom: 20 }}>
          El tipo de clínica define tu estilo de juego
        </PixelText>

        {MODES.map((mode, index) => {
          const isSelected = selected === mode.id;
          return (
            <Animated.View
              key={mode.id}
              style={{ transform: [{ scale: scaleAnims[index] }], marginBottom: 16 }}
            >
              <TouchableOpacity
                onPress={() => handleSelect(mode.id, index)}
                style={[
                  styles.card,
                  { borderColor: isSelected ? mode.color : COLORS.border + '40' },
                  isSelected && { backgroundColor: mode.color + '18' },
                ]}
              >
                <View style={styles.cardHeader}>
                  <PixelText size="large">{mode.icon}</PixelText>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <PixelText size="medium" color={mode.color}>{mode.label}</PixelText>
                    <PixelText size="tiny" color={COLORS.gray}>{mode.subtitle}</PixelText>
                  </View>
                  {isSelected && (
                    <PixelText size="medium" color={mode.color}>✓</PixelText>
                  )}
                </View>
                <View style={styles.features}>
                  {mode.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <PixelText size="tiny" color={mode.color}>▸ </PixelText>
                      <PixelText size="tiny" color={COLORS.grayLight}>{f}</PixelText>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <PixelButton
          title="COMENZAR"
          icon="🚀"
          color={selected ? COLORS.primary : COLORS.grayDark}
          onPress={handleConfirm}
          disabled={!selected}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.deskDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  features: { gap: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
