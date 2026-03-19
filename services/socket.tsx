import { useEffect, useRef, useState, useCallback } from 'react';

const URL_WS = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001';

interface Peticion {
  id: string;
  type: 'services' | 'room-service' | 'problem' | 'extra';
  roomNumber: string;
  guestName: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  timestamp: Date;
  cancelledBy?: 'staff' | 'guest';
  cancelledByName?: string;
  cancelledAt?: string;
  rating?: number;
  ratedAt?: string;
}

export function useWebSocketMobile(token: string | null) {
  const [estaConectado, setEstaConectado] = useState(false);
  const [misPeticiones, setMisPeticiones] = useState<Peticion[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<any>(null);
  const refWs = useRef<WebSocket | null>(null);
  const refTimeoutReconexion = useRef<number | undefined>(undefined);
  const refIntentosReconexion = useRef(0);
  const maxIntentosReconexion = 5;

  // Conexión WebSocket con reconexión automática
  const conectar = useCallback(() => {
    try {
      // Build WebSocket URL with token as query parameter
      // Use wss:// for secure connections (ngrok, https sites)
      let baseUrl = URL_WS;
      if (baseUrl.includes('ngrok') || baseUrl.includes('https://')) {
        baseUrl = baseUrl.replace('ws://', 'wss://').replace('http://', 'wss://');
      }
      const wsUrl = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setEstaConectado(true);
        refIntentosReconexion.current = 0;
      };

      // Escuchar mensajes del servidor (BIDIRECCIONAL)
      ws.onmessage = (evento) => {
        try {
          const mensaje = JSON.parse(evento.data);

          switch (mensaje.type) {
            case 'UPDATE_REQUEST':
              // Actualizar el estado de una petición específica
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id
                    ? { ...pet, status: mensaje.payload.status }
                    : pet
                )
              );
              setUltimaActualizacion(mensaje.payload);
              break;

            case 'CANCEL_REQUEST':
              // Marcar petición como cancelada (no eliminar)
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id
                    ? { 
                        ...pet, 
                        status: 'cancelled' as const,
                        cancelledBy: mensaje.payload.cancelledBy,
                        cancelledByName: mensaje.payload.cancelledByName,
                        cancelledAt: mensaje.payload.cancelledAt
                      }
                    : pet
                )
              );
              break;

            case 'RATE_REQUEST':
              // Actualizar la calificación de una petición
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id
                    ? { 
                        ...pet, 
                        rating: mensaje.payload.rating,
                        ratedAt: mensaje.payload.ratedAt
                      }
                    : pet
                )
              );
              break;

            case 'INIT_CONFIG':
              break;

            case 'CONFIG_UPDATED':
              break;

            default:
          }
        } catch (error) {
        }
      };

      ws.onerror = (error) => {
      };

      ws.onclose = () => {
        setEstaConectado(false);
        refWs.current = null;

        // Reconexión automática con backoff exponencial
        if (refIntentosReconexion.current < maxIntentosReconexion) {
          const timeout = Math.min(1000 * Math.pow(2, refIntentosReconexion.current), 30000);

          refTimeoutReconexion.current = setTimeout(() => {
            refIntentosReconexion.current++;
            conectar();
          }, timeout) as any;
        } else {
        }
      };

      refWs.current = ws;
    } catch (error) {
    }
  }, [token]);

  // Enviar petición al panel web
  const enviarPeticion = (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra';
    roomNumber: string;
    guestName: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (refWs.current && refWs.current.readyState === WebSocket.OPEN) {
      const carga: Peticion = {
        id: Date.now().toString(),
        ...peticion,
        timestamp: new Date(),
        status: 'pending',
      };

      refWs.current.send(
        JSON.stringify({
          type: 'NEW_REQUEST',
          payload: carga,
        })
      );

      // Guardar en el estado local para seguimiento
      setMisPeticiones((prev) => [...prev, carga]);

      return true;
    } else {
      return false;
    }
  };

  // Cancelar petición
  const cancelarPeticion = (peticionId: string) => {
    if (refWs.current && refWs.current.readyState === WebSocket.OPEN) {
      refWs.current.send(
        JSON.stringify({
          type: 'CANCEL_REQUEST',
          payload: { id: peticionId, requestedBy: 'guest' },
        })
      );

      // Marcar como cancelada en el estado local (no eliminar)
      setMisPeticiones((prev) => 
        prev.map((pet) =>
          pet.id === peticionId
            ? { ...pet, status: 'cancelled' as const, cancelledBy: 'guest' as const }
            : pet
        )
      );

      return true;
    } else {
      return false;
    }
  };

  // Calificar petición
  const ratePeticion = (peticionId: string, rating: number) => {
    if (refWs.current && refWs.current.readyState === WebSocket.OPEN) {
      const ratedAt = new Date().toISOString();
      
      refWs.current.send(
        JSON.stringify({
          type: 'RATE_REQUEST',
          payload: { 
            id: peticionId, 
            rating,
            ratedAt
          },
        })
      );

      // Actualizar en el estado local
      setMisPeticiones((prev) => 
        prev.map((pet) =>
          pet.id === peticionId
            ? { ...pet, rating, ratedAt }
            : pet
        )
      );

      return true;
    } else {
      return false;
    }
  };

  // Iniciar conexión al montar el componente
  useEffect(() => {
    conectar();

    return () => {
      if (refTimeoutReconexion.current) {
        clearTimeout(refTimeoutReconexion.current);
      }
      if (refWs.current) {
        refWs.current.close();
      }
    };
  }, [conectar]);

  return {
    estaConectado,
    enviarPeticion,
    cancelarPeticion,
    ratePeticion,
    misPeticiones,       
    ultimaActualizacion, 
  };
}