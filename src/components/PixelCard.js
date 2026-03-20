import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export default function PixelCard({
  children,
  style,
  color = COLORS.paper,
  borderColor = COLORS.border,
  glow = false,
  headerColor,
  headerContent,
  foldedCorner = false,
  elevated = false,
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: color, borderColor },
        glow && {
          shadowColor: COLORS.gold,
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          elevation: 8,
        },
        elevated && styles.elevated,
        style,
      ]}
    >
      {/* Inner highlight - top/left light edge */}
      <View style={[styles.innerHighlight, { borderColor: borderColor + '30' }]} />

      {/* Optional file-folder header tab */}
      {headerContent && (
        <View
          style={[
            styles.header,
            { backgroundColor: headerColor || borderColor },
          ]}
        >
          {headerContent}
          {/* Header bottom border accent */}
          <View style={[styles.headerAccent, { backgroundColor: (headerColor || borderColor) + '60' }]} />
        </View>
      )}

      {/* Optional folded corner */}
      {foldedCorner && (
        <View style={styles.foldedCornerWrap}>
          <View style={styles.foldedCorner} />
          <View style={styles.foldedShadow} />
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  elevated: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  headerAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  foldedCornerWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  foldedCorner: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 20,
    borderLeftWidth: 20,
    borderTopColor: COLORS.paperDark,
    borderLeftColor: 'transparent',
    borderTopRightRadius: 9,
  },
  foldedShadow: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    transform: [{ rotate: '45deg' }],
  },
});
