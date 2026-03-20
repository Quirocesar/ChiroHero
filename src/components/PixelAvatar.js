import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';

// Simple hash from string to get deterministic variety per character
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Shirt color palette - vibrant pixel-art colors
const SHIRT_COLORS = [
  '#4a90d9', // blue
  '#e94560', // red
  '#06d6a0', // green
  '#f4d35e', // gold
  '#533483', // purple
  '#ff6b35', // orange
  '#00b4d8', // cyan
  '#c1440e', // brown
];

// Hair style types
const HAIR_STYLES = ['short', 'tall', 'bald', 'mohawk', 'side'];

export default function PixelAvatar({
  avatar,
  size = 60,
  expression = 'neutral',
  animated = false,
  name = '',
}) {
  const hash = useMemo(() => hashStr(name || avatar?.hairColor || 'default'), [name, avatar?.hairColor]);

  // Pixel unit - everything is built on this grid
  const px = size / 16;

  // Colors derived from avatar + hash
  const skinColor = avatar?.skinTone || '#ffdbac';
  const skinShadow = darkenColor(skinColor, 30);
  const hairColor = avatar?.hairColor || '#2b1b0e';
  const hairHighlight = lightenColor(hairColor, 25);
  const shirtColor = SHIRT_COLORS[hash % SHIRT_COLORS.length];
  const shirtShadow = darkenColor(shirtColor, 40);
  const shirtHighlight = lightenColor(shirtColor, 30);
  const hairStyle = HAIR_STYLES[hash % HAIR_STYLES.length];
  const eyeColor = '#1a1a2e';
  const mouthColor = '#c1440e';
  const outlineColor = '#1a1a2e';

  // Walking animation
  const walkAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Leg swing
      Animated.loop(
        Animated.sequence([
          Animated.timing(walkAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(walkAnim, {
            toValue: -1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(walkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      // Body bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      walkAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [animated, walkAnim, bounceAnim]);

  const leftLegTranslate = walkAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-px, 0, px],
  });
  const rightLegTranslate = walkAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [px, 0, -px],
  });
  const bodyBounce = bounceAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: [-px * 0.5, 0],
  });

  // Helper: render a single "pixel" block with unique key via counter
  let _pxKey = 0;
  const P = (col, row, color, w = 1, h = 1) => (
    <View
      key={`px_${_pxKey++}`}
      style={{
        position: 'absolute',
        left: col * px,
        top: row * px,
        width: w * px,
        height: h * px,
        backgroundColor: color,
      }}
    />
  );

  // Build the hair based on style
  const renderHair = () => {
    const pixels = [];
    switch (hairStyle) {
      case 'tall':
        // Tall spiked hair
        pixels.push(P(5, 0, hairColor, 6, 1));
        pixels.push(P(4, 1, hairColor, 8, 1));
        pixels.push(P(4, 2, hairColor, 8, 1));
        pixels.push(P(4, 3, hairHighlight, 8, 1));
        pixels.push(P(6, 0, hairHighlight, 2, 1)); // highlight
        break;
      case 'mohawk':
        // Mohawk
        pixels.push(P(7, 0, hairColor, 2, 1));
        pixels.push(P(6, 1, hairColor, 4, 1));
        pixels.push(P(7, 1, hairHighlight, 1, 1));
        pixels.push(P(6, 2, hairColor, 4, 1));
        pixels.push(P(4, 3, hairColor, 8, 1));
        break;
      case 'side':
        // Side-swept hair
        pixels.push(P(3, 2, hairColor, 10, 1));
        pixels.push(P(4, 3, hairColor, 8, 1));
        pixels.push(P(3, 3, hairColor, 2, 1)); // hangs to left
        pixels.push(P(3, 4, hairColor, 1, 2)); // sideburn
        pixels.push(P(5, 2, hairHighlight, 3, 1));
        break;
      case 'bald':
        // Just a thin outline on top, no hair
        pixels.push(P(5, 3, skinShadow, 6, 1));
        break;
      case 'short':
      default:
        // Short cropped hair
        pixels.push(P(4, 2, hairColor, 8, 1));
        pixels.push(P(4, 3, hairColor, 8, 1));
        pixels.push(P(5, 2, hairHighlight, 3, 1));
        break;
    }
    return pixels;
  };

  // Build eyes based on expression
  const renderEyes = () => {
    const pixels = [];
    const expr = expression || 'neutral';
    switch (expr) {
      case 'pain':
        // X eyes
        pixels.push(P(5, 6, eyeColor, 1, 1));
        pixels.push(P(7, 6, eyeColor, 1, 1));
        pixels.push(P(6, 5, eyeColor, 1, 1));
        pixels.push(P(6, 7, eyeColor, 1, 1));
        // right X
        pixels.push(P(9, 6, eyeColor, 1, 1));
        pixels.push(P(11, 6, eyeColor, 1, 1));
        pixels.push(P(10, 5, eyeColor, 1, 1));
        pixels.push(P(10, 7, eyeColor, 1, 1));
        break;
      case 'happy':
        // U-shaped / closed happy eyes (arcs)
        pixels.push(P(5, 5, eyeColor, 1, 1));
        pixels.push(P(7, 5, eyeColor, 1, 1));
        pixels.push(P(6, 6, eyeColor, 1, 1));
        // right eye
        pixels.push(P(9, 5, eyeColor, 1, 1));
        pixels.push(P(11, 5, eyeColor, 1, 1));
        pixels.push(P(10, 6, eyeColor, 1, 1));
        break;
      case 'determined':
        // Angled / angry eyes (brow line + dot)
        pixels.push(P(5, 5, eyeColor, 3, 1)); // left brow angled
        pixels.push(P(6, 6, eyeColor, 1, 1)); // left pupil
        pixels.push(P(9, 5, eyeColor, 3, 1)); // right brow angled
        pixels.push(P(10, 6, eyeColor, 1, 1)); // right pupil
        break;
      case 'worried':
        // Wide worried eyes with raised inner brows
        pixels.push(P(6, 4, eyeColor, 1, 1)); // left brow raised
        pixels.push(P(10, 4, eyeColor, 1, 1)); // right brow raised
        pixels.push(P(5, 5, eyeColor, 3, 2)); // left eye wide
        pixels.push(P(6, 5, '#ffffff', 1, 1)); // white glint
        pixels.push(P(9, 5, eyeColor, 3, 2)); // right eye wide
        pixels.push(P(10, 5, '#ffffff', 1, 1)); // white glint
        break;
      case 'neutral':
      default:
        // Standard dot eyes with a white glint
        pixels.push(P(5, 5, eyeColor, 2, 2));
        pixels.push(P(5, 5, '#ffffff', 1, 1)); // glint
        pixels.push(P(9, 5, eyeColor, 2, 2));
        pixels.push(P(9, 5, '#ffffff', 1, 1)); // glint
        break;
    }
    return pixels;
  };

  // Build mouth based on expression
  const renderMouth = () => {
    const pixels = [];
    const expr = expression || 'neutral';
    switch (expr) {
      case 'pain':
        // Open mouth - oval/circle
        pixels.push(P(6, 8, outlineColor, 4, 1));
        pixels.push(P(6, 9, mouthColor, 4, 2));
        pixels.push(P(7, 9, '#c0392b', 2, 1)); // tongue/inner
        pixels.push(P(6, 11, outlineColor, 4, 1));
        break;
      case 'happy':
        // Wide smile
        pixels.push(P(5, 8, mouthColor, 1, 1));
        pixels.push(P(6, 9, mouthColor, 4, 1));
        pixels.push(P(11, 8, mouthColor, 1, 1));
        break;
      case 'worried':
        // Wavy/squiggly mouth
        pixels.push(P(6, 9, mouthColor, 1, 1));
        pixels.push(P(7, 8, mouthColor, 1, 1));
        pixels.push(P(8, 9, mouthColor, 1, 1));
        pixels.push(P(9, 8, mouthColor, 1, 1));
        break;
      case 'determined':
        // Tight flat line with down corners
        pixels.push(P(6, 9, mouthColor, 4, 1));
        pixels.push(P(5, 8, mouthColor, 1, 1));
        pixels.push(P(10, 8, mouthColor, 1, 1));
        break;
      case 'neutral':
      default:
        // Simple straight line
        pixels.push(P(6, 9, mouthColor, 4, 1));
        break;
    }
    return pixels;
  };

  return (
    <View style={[styles.container, { width: size, height: size * 1.25 }]}>
      {/* Body (animated bounce) */}
      <Animated.View
        style={{
          width: size,
          height: size * 1.25,
          transform: [{ translateY: bodyBounce }],
        }}
      >
        {/* === HAIR === */}
        {renderHair()}

        {/* === HEAD (skin) === */}
        {/* Head block */}
        {P(4, 3, outlineColor, 8, 1)}
        {P(3, 4, outlineColor, 1, 7)}
        {P(12, 4, outlineColor, 1, 7)}
        {P(4, 11, outlineColor, 8, 1)}
        {/* Fill skin */}
        {P(4, 4, skinColor, 8, 7)}
        {/* Skin shadow on right/bottom */}
        {P(11, 5, skinShadow, 1, 5)}
        {P(5, 10, skinShadow, 6, 1)}
        {/* Ear left */}
        {P(3, 6, skinColor, 1, 2)}
        {P(3, 6, skinShadow, 1, 1)}
        {/* Ear right */}
        {P(12, 6, skinColor, 1, 2)}
        {P(12, 7, skinShadow, 1, 1)}

        {/* === EYES === */}
        {renderEyes()}

        {/* === MOUTH === */}
        {renderMouth()}

        {/* === NECK === */}
        {P(6, 11, skinColor, 4, 1)}
        {P(7, 11, skinShadow, 2, 1)}

        {/* === BODY / SHIRT === */}
        {/* Shirt outline */}
        {P(3, 12, outlineColor, 10, 1)}
        {P(2, 13, outlineColor, 1, 5)}
        {P(13, 13, outlineColor, 1, 5)}
        {P(3, 18, outlineColor, 10, 1)}
        {/* Shirt fill */}
        {P(3, 13, shirtColor, 10, 5)}
        {/* Shirt highlight (left/top) */}
        {P(3, 13, shirtHighlight, 2, 1)}
        {P(3, 14, shirtHighlight, 1, 2)}
        {/* Shirt shadow (right/bottom) */}
        {P(11, 14, shirtShadow, 2, 3)}
        {P(5, 17, shirtShadow, 6, 1)}
        {/* Collar detail */}
        {P(6, 12, shirtHighlight, 1, 1)}
        {P(9, 12, shirtHighlight, 1, 1)}
        {P(7, 12, darkenColor(shirtColor, 15), 2, 1)}

        {/* Arms outline */}
        {P(1, 13, outlineColor, 2, 1)}
        {P(13, 13, outlineColor, 2, 1)}
        {P(0, 14, outlineColor, 1, 3)}
        {P(15, 14, outlineColor, 1, 3)}
        {P(1, 17, outlineColor, 2, 1)}
        {P(13, 17, outlineColor, 2, 1)}
        {/* Arms fill */}
        {P(1, 14, shirtColor, 2, 3)}
        {P(1, 14, shirtHighlight, 1, 1)}
        {P(13, 14, shirtColor, 2, 3)}
        {P(14, 16, shirtShadow, 1, 1)}
        {/* Hands */}
        {P(1, 17, skinColor, 1, 1)}
        {P(14, 17, skinColor, 1, 1)}
      </Animated.View>

      {/* === LEGS (animated walk) === */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 4 * px,
          top: 18 * px,
          width: 3 * px,
          height: 3 * px,
          transform: [{ translateX: leftLegTranslate }],
        }}
      >
        {/* Left leg outline */}
        <View style={{ position: 'absolute', left: -px, top: 0, width: px, height: 3 * px, backgroundColor: outlineColor }} />
        <View style={{ position: 'absolute', left: 3 * px, top: 0, width: px, height: 3 * px, backgroundColor: outlineColor }} />
        <View style={{ position: 'absolute', left: 0, top: 2 * px, width: 3 * px, height: px, backgroundColor: outlineColor }} />
        {/* Left leg fill */}
        <View style={{ position: 'absolute', left: 0, top: 0, width: 3 * px, height: 2 * px, backgroundColor: '#3d5a80' }} />
        {/* Left shoe */}
        <View style={{ position: 'absolute', left: -px, top: 2 * px, width: 4 * px, height: px, backgroundColor: '#2b2d42' }} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          left: 9 * px,
          top: 18 * px,
          width: 3 * px,
          height: 3 * px,
          transform: [{ translateX: rightLegTranslate }],
        }}
      >
        {/* Right leg outline */}
        <View style={{ position: 'absolute', left: -px, top: 0, width: px, height: 3 * px, backgroundColor: outlineColor }} />
        <View style={{ position: 'absolute', left: 3 * px, top: 0, width: px, height: 3 * px, backgroundColor: outlineColor }} />
        <View style={{ position: 'absolute', left: 0, top: 2 * px, width: 3 * px, height: px, backgroundColor: outlineColor }} />
        {/* Right leg fill */}
        <View style={{ position: 'absolute', left: 0, top: 0, width: 3 * px, height: 2 * px, backgroundColor: '#3d5a80' }} />
        <View style={{ position: 'absolute', left: -px, top: 2 * px, width: 4 * px, height: px, backgroundColor: '#2b2d42' }} />
      </Animated.View>
    </View>
  );
}

// Color utility functions
function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    // Subtle drop shadow for avatar depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
