import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocketMobile } from '@/services/socket';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/components/auth-provider';

interface WebSocketContextType {
  estaConectado: boolean;
  enviarPeticion: (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => boolean;
  misPeticiones: any[];
  ultimaActualizacion: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const socketData = useWebSocketMobile();
  const { guestName, roomNumber } = useAuth();
  
  // Hook de notificaciones global
  useNotifications({ ultimaActualizacion: socketData.ultimaActualizacion });

  // Wrapper function that auto-injects roomNumber and guestName from auth context
  const enviarPeticionWrapper = (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (!guestName || !roomNumber) {
      console.warn('⚠️ Cannot send request: user not authenticated');
      return false;
    }

    return socketData.enviarPeticion({
      ...peticion,
      guestName,
      roomNumber,
    });
  };

  return (
    <WebSocketContext.Provider value={{
      ...socketData,
      enviarPeticion: enviarPeticionWrapper,
    }}>
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
