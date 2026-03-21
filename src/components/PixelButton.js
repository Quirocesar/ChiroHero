import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS, SYSTEM_FONT, darken } from '../utils/theme';
import soundManager from '../utils/soundManager';

const VARIANT_STYLES = {
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: 'transparent',
    textColor: '#FFFFFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    textColor: COLORS.white,
  },
  danger: {
    backgroundColor: COLORS.red,
    borderColor: 'transparent',
    textColor: '#FFFFFF',
  },
};

const DISABLED_STYLES = {
  backgroundColor: COLORS.bgMedium,
  borderColor: COLORS.border,
  textColor: COLORS.grayDark,
};

export default function PixelButton({
  title, onPress, color, textColor,
  style, disabled, small, icon, variant, size
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    soundManager.init();
    soundManager.playClick();
    onPress?.();
  };

  const isLarge = size === 'large' || variant === 'primary';

  // Resolve colors
  let resolvedBg, resolvedBorder, resolvedText;
  if (disabled) {
    resolvedBg = DISABLED_STYLES.backgroundColor;
    resolvedBorder = DISABLED_STYLES.borderColor;
    resolvedText = DISABLED_STYLES.textColor;
  } else if (variant && VARIANT_STYLES[variant]) {
    const preset = VARIANT_STYLES[variant];
    resolvedBg = color || preset.backgroundColor;
    resolvedBorder = preset.borderColor;
    resolvedText = textColor || preset.textColor;
  } else {
    resolvedBg = color || COLORS.primary;
    resolvedBorder = 'transparent';
    resolvedText = textColor || '#FFFFFF';
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: resolvedBg,
            borderColor: resolvedBorder,
            borderWidth: resolvedBorder === 'transparent' ? 0 : 1.5,
          },
          isLarge && styles.large,
          small && styles.small,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Text style={[
          styles.text,
          { color: resolvedText },
          isLarge && styles.largeText,
          small && styles.smallText,
        ]}>
          {icon ? `${icon} ` : ''}{title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  text: {
    fontFamily: SYSTEM_FONT,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  largeText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
