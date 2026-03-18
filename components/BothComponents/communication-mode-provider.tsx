import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CommunicationMode = 'ASL' | 'Text';

interface CommunicationModeContextType {
  mode: CommunicationMode;
  setMode: (mode: CommunicationMode) => void;
  toggleMode: () => void;
}

const CommunicationModeContext = createContext<CommunicationModeContextType | undefined>(undefined);

export function CommunicationModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CommunicationMode>('ASL');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'ASL' ? 'Text' : 'ASL'));
  };

  return (
    <CommunicationModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </CommunicationModeContext.Provider>
  );
}

export function useCommunicationMode() {
  const context = useContext(CommunicationModeContext);
  if (context === undefined) {
    throw new Error('useCommunicationMode must be used within a CommunicationModeProvider');
  }
  return context;
}
