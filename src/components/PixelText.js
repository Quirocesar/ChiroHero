import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { COLORS, SYSTEM_FONT } from '../utils/theme';

export default function PixelText({ children, style, size = 'normal', color = COLORS.white, center, shadow = false, glow = false, outline = false, badge = false, badgeColor, fontFamily = 'default' }) {
  const fontStyle = {
    fontFamily: SYSTEM_FONT,
    fontWeight: sizes[size]?.fontWeight || '400',
    letterSpacing: 0.3,
  };

  const shadowStyle = shadow
    ? {
        textShadowColor: 'rgba(0,0,0,0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      }
    : {};

  const textElement = (
    <Text
      style={[
        styles.base,
        fontStyle,
        { fontSize: sizes[size]?.fontSize || 15, lineHeight: sizes[size]?.lineHeight || 21 },
        { color },
        center && styles.center,
        shadowStyle,
        glow && { textShadowColor: COLORS.primary, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
        outline && { textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
        style,
      ]}
    >
      {children}
    </Text>
  );

  if (badge) {
    return (
      <View style={[styles.badge, { backgroundColor: (badgeColor || color) + '18', borderColor: (badgeColor || color) + '40' }]}>
        {textElement}
      </View>
    );
  }

  return textElement;
}

const sizes = {
  tiny:   { fontSize: 11, lineHeight: 16, fontWeight: '400' },
  small:  { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  normal: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  medium: { fontSize: 19, lineHeight: 26, fontWeight: '600' },
  large:  { fontSize: 25, lineHeight: 32, fontWeight: '600' },
  xlarge: { fontSize: 33, lineHeight: 40, fontWeight: '700' },
  title:  { fontSize: 41, lineHeight: 48, fontWeight: '700' },
  giant:  { fontSize: 57, lineHeight: 64, fontWeight: '700' },
};

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0.3,
  },
  center: {
    textAlign: 'center',
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
});
