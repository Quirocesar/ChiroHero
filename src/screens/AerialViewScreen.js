import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width, height } = Dimensions.get('window');
const TABLE_W = 80;
const TABLE_H = 50;
const MAX_TABLES = 6;

// Fixed list of techniques and conditions
const ALL_TECHNIQUES = ['Ajuste C1', 'Mobilización', 'HVT Lumbar', 'Tracción', 'HVLA'];
const CONDITIONS = ['Lumbalgia', 'Cervicalgia', 'Dorsalgia', 'Ciática', 'Contractura'];

function getTablePositions(count) {
  const cols = count <= 3 ? count : Math.ceil(count / 2);
  const spacing = { x: (width - 32) / cols, y: 90 };
  return Array.from({ length: count }, (_, i) => ({
    x: 16 + (i % cols) * spacing.x + spacing.x / 2 - TABLE_W / 2,
    y: 80 + Math.floor(i / cols) * spacing.y,
  }));
}

function generatePatient(id) {
  const correctTechnique = ALL_TECHNIQUES[Math.floor(Math.random() * ALL_TECHNIQUES.length)];
  // Build 3 options: always include the correct one
  const others = ALL_TECHNIQUES.filter(t => t !== correctTechnique);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [correctTechnique, ...shuffled].sort(() => Math.random() - 0.5);
  return {
    id,
    name: `Paciente ${id}`,
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    correctTechnique,
    options, // exactly 3, always includes the correct one
  };
}

export default function AerialViewScreen({ navigation }) {
  const unlockedTables = Math.min(gameState.get('unlockedTables') || 2, MAX_TABLES);
  const positions = getTablePositions(unlockedTables);

  // Each table: { id, x, y, state, patient, patientY (Animated.Value) }
  const [tables, setTables] = useState(() =>
    positions.map((pos, i) => ({
      id: i,
      ...pos,
      state: 'empty',
      patient: null,
      patientY: new Animated.Value(-60),
    }))
  );
  const [selectedTable, setSelectedTable] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const patientCounter = useRef(0);
  const spawnTimer = useRef(null);

  const scheduleSpawn = useCallback(() => {
    spawnTimer.current = setTimeout(() => {
      trySpawnPatient();
      scheduleSpawn();
    }, 3000 + Math.random() * 4000);
  }, []);

  useEffect(() => {
    soundManager.init();
    scheduleSpawn();
    return () => {
      clearTimeout(spawnTimer.current);
    };
  }, []);

  const trySpawnPatient = useCallback(() => {
    setTables(prev => {
      const emptyIdx = prev.findIndex(t => t.state === 'empty');
      if (emptyIdx === -1) return prev;

      patientCounter.current += 1;
      const patient = generatePatient(patientCounter.current);
      const tableId = prev[emptyIdx].id;

      // Reset and animate patient Y
      prev[emptyIdx].patientY.setValue(-60);
      Animated.timing(prev[emptyIdx].patientY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // Guard: only set 'occupied' if still 'arriving' (not already treated/leaving)
        setTables(curr => curr.map(t =>
          t.id === tableId && t.state === 'arriving'
            ? { ...t, state: 'occupied' }
            : t
        ));
      });

      soundManager.playClick();
      return prev.map((t, i) =>
        i === emptyIdx ? { ...t, state: 'arriving', patient } : t
      );
    });
  }, []);

  const handleTableTap = useCallback((table) => {
    if (table.state !== 'occupied') return;
    soundManager.playClick();
    setSelectedTable(table);
    setTables(prev => prev.map(t =>
      t.id === table.id ? { ...t, state: 'in_treatment' } : t
    ));
  }, []);

  const handleTreatment = useCallback((table, technique) => {
    soundManager.playCrack();
    const isCorrect = technique === table.patient.correctTechnique;
    const earned = isCorrect ? 70 : 55;
    const rep = isCorrect ? 2 : -0.5;

    setEarnings(prev => prev + earned);
    // gameState.set() takes a plain object
    gameState.set({ money: (gameState.get('money') || 0) + earned });
    gameState.set({
      reputation: Math.max(0, Math.min(100, (gameState.get('reputation') || 50) + rep)),
    });
    soundManager.playSuccess();
    setSelectedTable(null);

    // Animate patient leaving
    setTables(prev => prev.map(t => {
      if (t.id !== table.id) return t;
      Animated.timing(t.patientY, {
        toValue: -80,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setTables(curr => curr.map(tb =>
          tb.id === table.id ? { ...tb, state: 'empty', patient: null } : tb
        ));
      });
      return { ...t, state: 'leaving' };
    }));
  }, []);

  const handleCancelTreatment = useCallback(() => {
    if (!selectedTable) return;
    const tableId = selectedTable.id;
    setSelectedTable(null);
    setTables(prev => prev.map(t =>
      t.id === tableId && t.state === 'in_treatment'
        ? { ...t, state: 'occupied' }
        : t
    ));
  }, [selectedTable]);

  return (
    <View style={styles.container}>
      <BackHeader title="SALA ABIERTA" onBack={() => navigation.navigate('ClinicView')} />

      <View style={styles.hud}>
        <PixelText size="small" color={COLORS.gold}>💰 +${earnings}</PixelText>
        <PixelText size="tiny" color={COLORS.gray}>
          {tables.filter(t => t.state !== 'empty').length}/{unlockedTables} activas
        </PixelText>
      </View>

      <View style={styles.floor}>
        <View style={styles.door}>
          <PixelText size="tiny" color={COLORS.gray}>🚪 ENTRADA</PixelText>
        </View>

        {tables.map(table => (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.table,
              { left: table.x, top: table.y },
              table.state === 'occupied' && styles.tableOccupied,
              table.state === 'in_treatment' && styles.tableInTreatment,
              table.state === 'arriving' && styles.tableArriving,
            ]}
            onPress={() => handleTableTap(table)}
            activeOpacity={table.state === 'occupied' ? 0.7 : 1}
          >
            <PixelText size="tiny" color={COLORS.grayLight} center>🛏</PixelText>
            {table.patient && (
              <Animated.View
                style={[styles.patientSprite, { transform: [{ translateY: table.patientY }] }]}
              >
                <PixelText size="small" center>🧑</PixelText>
              </Animated.View>
            )}
            {table.state === 'occupied' && (
              <View style={styles.tapHint}>
                <PixelText size="tiny" color={COLORS.primary}>👆</PixelText>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.waitingArea}>
          <PixelText size="tiny" color={COLORS.gray}>ESPERA</PixelText>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[...Array(3)].map((_, i) => <PixelText key={i} size="small">🪑</PixelText>)}
          </View>
        </View>
      </View>

      {/* Treatment popup — covers full screen */}
      <Modal
        visible={!!selectedTable}
        transparent
        animationType="slide"
        onRequestClose={handleCancelTreatment}
      >
        <View style={styles.popupBackdrop}>
          <View style={styles.popup}>
            {selectedTable && (
              <>
                <PixelText size="small" color={COLORS.white} center>
                  {selectedTable.patient?.name}
                </PixelText>
                <PixelText size="tiny" color={COLORS.gray} center>
                  {selectedTable.patient?.condition}
                </PixelText>
                <PixelText size="tiny" color={COLORS.grayLight} center style={{ marginTop: 8 }}>
                  Elegir técnica:
                </PixelText>
                {/* options always contains the correctTechnique — see generatePatient() */}
                {selectedTable.patient.options.map(tech => (
                  <TouchableOpacity
                    key={tech}
                    style={styles.techniqueBtn}
                    onPress={() => handleTreatment(selectedTable, tech)}
                  >
                    <PixelText size="small" color={COLORS.white}>{tech}</PixelText>
                  </TouchableOpacity>
                ))}
                <PixelButton
                  title="CANCELAR"
                  color={COLORS.secondary}
                  onPress={handleCancelTreatment}
                  small
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.deskDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  floor: { flex: 1, position: 'relative' },
  door: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    left: width / 2 - 50,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  table: {
    position: 'absolute',
    width: TABLE_W,
    height: TABLE_H,
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.deskLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableOccupied: { borderColor: COLORS.primary },
  tableInTreatment: { borderColor: COLORS.accent },
  tableArriving: { borderColor: COLORS.gold },
  patientSprite: { position: 'absolute', top: -20 },
  tapHint: { position: 'absolute', bottom: -16 },
  waitingArea: {
    position: 'absolute',
    right: 8,
    top: 40,
    backgroundColor: COLORS.bgMedium,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
    alignItems: 'center',
    gap: 4,
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: COLORS.deskDark,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary + '60',
    padding: 20,
    paddingBottom: 36,
    gap: 8,
  },
  techniqueBtn: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    alignItems: 'center',
  },
});
