import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PixelText from './PixelText';
import { COLORS } from '../utils/theme';

/**
 * Reusable top header with a back arrow button.
 * Props:
 *   title  — optional string shown centered
 *   onBack — optional function, defaults to navigation.goBack()
 */
export default function BackHeader({ title, onBack }) {
  const navigation = useNavigation();
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <PixelText size="large" color={COLORS.accent}>←</PixelText>
      </TouchableOpacity>

      {/* Title MUST be in a View (not directly on PixelText) for flex:1 to work */}
      <View style={styles.titleWrapper}>
        {title ? (
          <PixelText size="small" color={COLORS.white} center>
            {title}
          </PixelText>
        ) : null}
      </View>

      {/* Right spacer balances the left back button */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 10,
    backgroundColor: COLORS.deskDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  backBtn: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    minWidth: 40,
  },
});
