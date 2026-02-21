import { useEffect, useRef, useState, useCallback } from 'react';

const URL_WS = 'ws://localhost:8080';

interface Peticion {
  id: string;
  type: 'services' | 'room-service' | 'problem' | 'extra';
  roomNumber: string;
  guestName: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: Date;
}

export function useWebSocketMobile() {
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
      const ws = new WebSocket(URL_WS);

      ws.onopen = () => {
        console.log('✅ Conectado al servidor');
        setEstaConectado(true);
        refIntentosReconexion.current = 0;
      };

      // Escuchar mensajes del servidor (BIDIRECCIONAL)
      ws.onmessage = (evento) => {
        try {
          const mensaje = JSON.parse(evento.data);
          console.log('📨 Mensaje recibido:', mensaje);

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
              console.log('✅ Petición actualizada:', mensaje.payload);
              break;

            case 'INIT_CONFIG':
              console.log('⚙️ Configuración inicial:', mensaje.payload);
              break;

            case 'CONFIG_UPDATED':
              console.log('⚙️ Configuración actualizada:', mensaje.payload);
              break;

            default:
              console.log('⚠️ Mensaje no manejado:', mensaje.type);
          }
        } catch (error) {
          console.error('❌ Error al procesar mensaje:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('🔌 Desconectado del servidor');
        setEstaConectado(false);
        refWs.current = null;

        // Reconexión automática con backoff exponencial
        if (refIntentosReconexion.current < maxIntentosReconexion) {
          const timeout = Math.min(1000 * Math.pow(2, refIntentosReconexion.current), 30000);
          console.log(`🔄 Reintentando conexión en ${timeout}ms...`);

          refTimeoutReconexion.current = setTimeout(() => {
            refIntentosReconexion.current++;
            conectar();
          }, timeout) as any;
        } else {
          console.log('❌ Máximo de intentos de reconexión alcanzado');
        }
      };

      refWs.current = ws;
    } catch (error) {
      console.error('❌ Error al crear WebSocket:', error);
    }
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

      console.log('📤 Petición enviada:', carga);
      return true;
    } else {
      console.warn('⚠️ No hay conexión con el servidor');
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
    misPeticiones,       // Historial de peticiones del huésped
    ultimaActualizacion, // Última actualización de estado recibida
  };
}