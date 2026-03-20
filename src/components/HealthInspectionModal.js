import React from 'react';
import { View, StyleSheet, Modal, Image } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import soundManager from '../utils/soundManager';

export default function HealthInspectionModal({ visible, mistakes, onClose }) {
  const fine = mistakes * 200;
  const isPass = mistakes === 0;

  const handleClose = () => {
    soundManager.playClick();
    onClose(fine);
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <PixelText size="large" color={COLORS.red} center>
              👮 INSPECCIÓN DE SANIDAD
            </PixelText>
          </View>

          <View style={styles.inspectorRoom}>
             <PixelText size="title" center>🕵️‍♂️</PixelText>
             <View style={styles.speechBubble}>
                <PixelText size="small" color={COLORS.ink} shadow={false}>
                  {isPass 
                    ? "Sus registros están impecables, doctor. Siga así."
                    : `HEMOS ENCONTRADO ${mistakes} NEGLIGENCIAS MÉDICAS EN SUS REGISTROS.`
                  }
                </PixelText>
             </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.statRow}>
              <PixelText size="small" color={COLORS.white}>Errores detectados:</PixelText>
              <PixelText size="small" color={isPass ? COLORS.green : COLORS.red}>{mistakes}</PixelText>
            </View>
            <View style={styles.statRow}>
              <PixelText size="small" color={COLORS.white}>{isPass ? "Bonificación:" : "Multa impuesta:"}</PixelText>
              <PixelText size="small" color={isPass ? COLORS.green : COLORS.red}>
                {isPass ? "+5 Reputación" : `-$${fine}`}
              </PixelText>
            </View>
          </View>

          <PixelButton
            title={isPass ? "GRACIAS, AGENTE" : "PAGAR MULTA"}
            color={isPass ? COLORS.green : COLORS.red}
            onPress={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: COLORS.bgMedium,
    borderWidth: 4,
    borderColor: COLORS.red,
    padding: 20,
    gap: 20,
  },
  header: {
    borderBottomWidth: 2,
    borderColor: COLORS.red,
    paddingBottom: 10,
  },
  inspectorRoom: {
    alignItems: 'center',
    gap: 10,
  },
  speechBubble: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    width: '100%',
  },
  stats: {
    backgroundColor: COLORS.dark,
    padding: 15,
    borderWidth: 2,
    borderColor: COLORS.gray,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
