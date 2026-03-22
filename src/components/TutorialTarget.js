import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useTutorial } from '../utils/TutorialContext';

/**
 * Wrap any element with TutorialTarget to register its screen position
 * for the tutorial highlight system.
 *
 * Props:
 *   id    — unique string key (e.g. 'playButton')
 *   style — optional style passed to the wrapper View
 */
export default function TutorialTarget({ id, children, style }) {
  const { registerTarget } = useTutorial();
  const viewRef = useRef(null);

  const handleLayout = useCallback(() => {
    if (viewRef.current?.measure) {
      viewRef.current.measure((x, y, w, h, pageX, pageY) => {
        registerTarget(id, { x: pageX, y: pageY, width: w, height: h });
      });
    }
  }, [id, registerTarget]);

  return (
    <View ref={viewRef} onLayout={handleLayout} style={style}>
      {children}
    </View>
  );
}
