import React from 'react';
import { View } from 'react-native';

export default function Px({ x, y, w, h, color, style }) {
  return (
    <View style={[{
      position: 'absolute', left: x, top: y,
      width: w || 4, height: h || 4,
      backgroundColor: color,
    }, style]} />
  );
}
