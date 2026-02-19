import { useEffect, useRef, useState } from 'react';

const URL_WS = 'ws://localhost:8080';

export function useWebSocketMobile() {
  const [estaConectado, setEstaConectado] = useState(false);
  const refWs = useRef<WebSocket | null>(null);

  // Conexión WebSocket
  useEffect(() => {
    const ws = new WebSocket(URL_WS);

    ws.onopen = () => {
      console.log('✅ Conectado al servidor');
      setEstaConectado(true);
    };

    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('🔌 Desconectado del servidor');
      setEstaConectado(false);
    };

    refWs.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Enviar petición al panel web
  const enviarPeticion = (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    roomNumber: string;
    guestName: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (refWs.current && refWs.current.readyState === WebSocket.OPEN) {
      const carga = {
        id: Date.now().toString(),
        ...peticion,
        timestamp: new Date(),
        status: 'pending',
      };

      refWs.current.send(JSON.stringify({
        type: 'NEW_REQUEST',
        payload: carga,
      }));

      console.log('📤 Petición enviada:', carga);
      return true;
    } else {
      console.warn('⚠️ No hay conexión con el servidor');
      return false;
    }
  };

  return { estaConectado, enviarPeticion };
}