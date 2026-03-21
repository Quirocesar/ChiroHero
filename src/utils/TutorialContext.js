import React, { createContext, useContext, useRef, useCallback } from 'react';

const TutorialContext = createContext({
  registerTarget: () => {},
  getTarget: () => null,
});

export function TutorialProvider({ children }) {
  const targets = useRef({});

  const registerTarget = useCallback((id, layout) => {
    targets.current[id] = layout;
  }, []);

  const getTarget = useCallback((id) => {
    return targets.current[id] || null;
  }, []);

  return (
    <TutorialContext.Provider value={{ registerTarget, getTarget }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}
