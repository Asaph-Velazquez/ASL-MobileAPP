import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocketMobile } from '@/services/socket';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from './auth-provider';

interface WebSocketContextType {
  estaConectado: boolean;
  puedeEnviar: boolean;
  enviarPeticion: (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    details?: unknown;
  }) => boolean;
  cancelarPeticion: (peticionId: string) => boolean;
  ratePeticion: (peticionId: string, rating: number) => boolean;
  misPeticiones: any[];
  ultimaActualizacion: any;
  reconectar: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { guestName, roomNumber, token, isAuthenticated, isOffline } = useAuth();
  const socketData = useWebSocketMobile(token);
  
  // Hook de notificaciones global
  useNotifications({ ultimaActualizacion: socketData.ultimaActualizacion });

  // Manejar cierre de sesión: desconectar WebSocket cuando se limpia el token
  const prevIsAuthenticatedRef = React.useRef(isAuthenticated);
  React.useEffect(() => {
    if (prevIsAuthenticatedRef.current && !isAuthenticated) {
      // Usuario cerró sesión, WebSocket se desconectará en la próxima reconexión
    }
    prevIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  /**
   * Determina si se puede enviar peticiones
   * No se puede enviar si:
   * - Está offline
   * - No está autenticado
   * - No tiene datos de sesión
   */
  const puedeEnviar = !isOffline && isAuthenticated && !!guestName && !!roomNumber;

  // Función envolvente que inyecta automáticamente roomNumber y guestName del contexto de autenticación
  const enviarPeticionWrapper = (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    details?: unknown;
  }) => {
    if (!puedeEnviar) {
      return false;
    }

    return socketData.enviarPeticion({
      ...peticion,
      guestName: guestName!,
      roomNumber: roomNumber!,
    });
  };

  return (
    <WebSocketContext.Provider value={{
      estaConectado: socketData.estaConectado,
      puedeEnviar,
      enviarPeticion: enviarPeticionWrapper,
      cancelarPeticion: socketData.cancelarPeticion,
      ratePeticion: socketData.ratePeticion,
      misPeticiones: socketData.misPeticiones,
      ultimaActualizacion: socketData.ultimaActualizacion,
      reconectar: socketData.reconectar,
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
