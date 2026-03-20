import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../utils/theme';

export default function PixelText({ children, style, size = 'normal', color = COLORS.white, center, shadow = true, glow = false, outline = false, badge = false, badgeColor, fontFamily = 'mono' }) {
  const isUI = fontFamily === 'ui';

  const fontStyle = isUI
    ? {
        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: undefined }),
        fontWeight: 'normal',
        letterSpacing: 0.5,
      }
    : {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
      };

  const shadowStyle = isUI
    ? {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    : {
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 1,
      };

  const textElement = (
    <Text
      style={[
        styles.base,
        fontStyle,
        sizes[size] || sizes.normal,
        { color },
        center && styles.center,
        shadow && shadowStyle,
        glow && { textShadowColor: color, textShadowRadius: 8 },
        outline && { textShadowColor: COLORS.dark, textShadowRadius: 3 },
        style,
      ]}
    >
      {children}
    </Text>
  );

  if (badge) {
    return (
      <View style={[styles.badge, { backgroundColor: badgeColor || color + '25', borderColor: color + '50' }]}>
        {textElement}
      </View>
    );
  }

  return textElement;
}

const sizes = {
  tiny: { fontSize: 11, lineHeight: 15 },
  small: { fontSize: 13, lineHeight: 17 },
  normal: { fontSize: 15, lineHeight: 21 },
  medium: { fontSize: 19, lineHeight: 25 },
  large: { fontSize: 25, lineHeight: 31 },
  xlarge: { fontSize: 33, lineHeight: 39 },
  title: { fontSize: 41, lineHeight: 47 },
  giant: { fontSize: 57, lineHeight: 63 },
};

const styles = StyleSheet.create({
  base: {
    letterSpacing: 1,
  },
  center: {
    textAlign: 'center',
  },
  badge: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
});
