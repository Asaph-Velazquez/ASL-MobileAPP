import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocketMobile } from '@/services/socket';
import { useNotifications } from '@/hooks/useNotifications';

interface WebSocketContextType {
  estaConectado: boolean;
  enviarPeticion: (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    roomNumber: string;
    guestName: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => boolean;
  misPeticiones: any[];
  ultimaActualizacion: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const socketData = useWebSocketMobile();
  
  // Hook de notificaciones global
  useNotifications({ ultimaActualizacion: socketData.ultimaActualizacion });

  return (
    <WebSocketContext.Provider value={socketData}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket debe ser usado dentro de WebSocketProvider');
  }
  return context;
}
