import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export default function PixelCard({
  children,
  style,
  color = COLORS.bgLight,
  borderColor = COLORS.border,
  glow = false,
  headerColor,
  headerContent,
  foldedCorner = false, // kept for API compat, ignored
  elevated = false,
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: color, borderColor },
        glow && {
          shadowColor: COLORS.primary,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 10,
        },
        elevated && styles.elevated,
        style,
      ]}
    >
      {/* Optional header bar */}
      {headerContent && (
        <View
          style={[
            styles.header,
            { backgroundColor: headerColor || COLORS.primary },
          ]}
        >
          {headerContent}
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    // Clean shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  elevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});
