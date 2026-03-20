import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, darken } from '../utils/theme';
import soundManager from '../utils/soundManager';

// Variant presets with richer colors
const VARIANT_STYLES = {
  primary: {
    backgroundColor: '#ffba35',
    borderColor: '#d4951a',
    bottomColor: '#b87c10',
    textColor: '#2b1810',
    highlightColor: '#ffd06a',
  },
  secondary: {
    backgroundColor: '#f7f3f2',
    borderColor: '#d7c8c4',
    bottomColor: '#c4b8b0',
    textColor: '#2b1810',
    highlightColor: '#ffffff',
  },
  danger: {
    backgroundColor: '#c1374f',
    borderColor: '#9b2a3d',
    bottomColor: '#7a1f2e',
    textColor: '#ffffff',
    highlightColor: '#e05068',
  },
};

const DISABLED_STYLES = {
  backgroundColor: '#7d6f6a',
  borderColor: '#6a5e5a',
  bottomColor: '#5a504c',
  textColor: '#a89c98',
  highlightColor: '#8d807c',
};

export default function PixelButton({
  title, onPress, color, textColor,
  style, disabled, small, icon, variant, size
}) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 60,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = () => {
    soundManager.init();
    soundManager.playClick();
    onPress?.();
  };

  const isLarge = size === 'large' || variant === 'primary';

  // Resolve colors
  let resolvedBg, resolvedBorder, resolvedText, resolvedBottom, resolvedHighlight;
  if (disabled) {
    resolvedBg = DISABLED_STYLES.backgroundColor;
    resolvedBorder = DISABLED_STYLES.borderColor;
    resolvedText = DISABLED_STYLES.textColor;
    resolvedBottom = DISABLED_STYLES.bottomColor;
    resolvedHighlight = DISABLED_STYLES.highlightColor;
  } else if (variant && VARIANT_STYLES[variant]) {
    const preset = VARIANT_STYLES[variant];
    resolvedBg = color || preset.backgroundColor;
    resolvedBorder = preset.borderColor;
    resolvedText = textColor || preset.textColor;
    resolvedBottom = color ? darken(color, 40) : preset.bottomColor;
    resolvedHighlight = color ? undefined : preset.highlightColor;
  } else {
    resolvedBg = color || COLORS.primary;
    resolvedBorder = color ? darken(color, 30) : '#d4951a';
    resolvedText = textColor || COLORS.ink;
    resolvedBottom = darken(color || COLORS.primary, 40);
    resolvedHighlight = undefined;
  }

  const bottomHeight = small ? 3 : isLarge ? 5 : 4;

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, bottomHeight - 1],
  });

  const bottomScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [bottomHeight, 1],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {/* 3D bottom edge */}
      <Animated.View style={[
        styles.bottomEdge,
        {
          backgroundColor: resolvedBottom,
          borderColor: resolvedBorder,
          height: bottomScale,
        },
        isLarge && styles.largeRadius,
        small && styles.smallRadius,
      ]} />

      {/* Main button surface */}
      <Animated.View style={{ transform: [{ translateY }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: resolvedBg,
              borderColor: resolvedBorder,
            },
            isLarge && styles.large,
            small && styles.small,
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.95}
        >
          {/* Top highlight line */}
          {resolvedHighlight && (
            <View style={[styles.highlight, { backgroundColor: resolvedHighlight }]} />
          )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 3,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  largeRadius: {
    borderRadius: 10,
  },
  smallRadius: {
    borderRadius: 6,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderRadius: 8,
    borderTopWidth: 0,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  largeText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  smallText: {
    fontSize: 11,
    letterSpacing: 1,
  },
});
