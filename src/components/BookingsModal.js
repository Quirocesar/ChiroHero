import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import PixelCard from './PixelCard';
import { t } from '../utils/i18n';
import soundManager from '../utils/soundManager';

export default function BookingsModal({ visible, bookings, onClose, onAccept, onReject }) {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.monitor}>
          {/* Monitor frame top */}
          <View style={styles.monitorTop}>
            <PixelText size="tiny" color={COLORS.gray}>CHIRO-OS v1.0</PixelText>
          </View>
          
          {/* Screen content */}
          <View style={styles.screen}>
            <View style={styles.header}>
              <PixelText size="small" color={COLORS.primary} center>
                💻 {t('bookings')}
              </PixelText>
            </View>

            <ScrollView style={styles.scrollView}>
              {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <PixelText size="small" color={COLORS.gray} center>
                    No hay reservas pendientes
                  </PixelText>
                </View>
              ) : (
                bookings.map((booking) => (
                  <PixelCard 
                    key={booking.id} 
                    color={booking.isWhatsApp ? '#075e54' : COLORS.dark} 
                    borderColor={booking.isWhatsApp ? '#25d366' : COLORS.primary}
                    style={styles.bookingCard}
                  >
                    <View style={styles.bookingHeader}>
                      <PixelText size="tiny" color={COLORS.white}>
                        {booking.isWhatsApp ? '📱 WhatsApp' : '🌐 Web'} - {booking.time}
                      </PixelText>
                      {booking.isReturning && (
                        <PixelText size="tiny" color={COLORS.gold}>⭐ Paciente Leal</PixelText>
                      )}
                    </View>
                    <PixelText size="small" color={COLORS.white}>{booking.name}</PixelText>
                    <PixelText size="tiny" color={COLORS.gray}>{booking.reason}</PixelText>
                    
                    <View style={styles.actions}>
                      <PixelButton 
                        title="ACEPTAR" 
                        color={COLORS.green} 
                        small 
                        onPress={() => {
                          soundManager.playClick();
                          onAccept(booking);
                        }} 
                        style={styles.actionBtn} 
                      />
                      <PixelButton 
                        title="RECHAZAR" 
                        color={COLORS.red} 
                        small 
                        onPress={() => {
                          soundManager.playClick();
                          onReject(booking);
                        }} 
                        style={styles.actionBtn} 
                      />
                    </View>
                  </PixelCard>
                ))
              )}
            </ScrollView>

            <PixelButton
              title="CERRAR"
              color={COLORS.bgMedium}
              onPress={() => {
                soundManager.playClick();
                onClose();
              }}
              style={styles.closeButton}
            />
          </View>

          {/* Monitor stand */}
          <View style={styles.stand} />
          <View style={styles.base} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  monitor: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#E2E8F0', // slate-200
    padding: 10,
    borderWidth: 4,
    borderColor: '#888',
    borderBottomWidth: 12,
    borderRightWidth: 8,
    alignItems: 'center',
  },
  monitorTop: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  screen: {
    width: '100%',
    backgroundColor: '#0F172A', // slate-900
    borderWidth: 8,
    borderColor: '#222',
    height: 400,
    padding: 10,
  },
  header: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  bookingCard: {
    marginBottom: 10,
    padding: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff33',
    paddingBottom: 4,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  closeButton: {
    marginTop: 10,
  },
  stand: {
    width: 60,
    height: 30,
    backgroundColor: '#CBD5E1',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#888',
  },
  base: {
    width: 140,
    height: 15,
    backgroundColor: '#E2E8F0',
    borderWidth: 4,
    borderColor: '#888',
  },
});
