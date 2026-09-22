import { useEffect, useRef, useState, useCallback } from 'react';
import { HOTEL_WS_URL } from '@/constants/network';

interface Peticion {
  id: string;
  type: 'services' | 'room-service' | 'problem' | 'extra' | 'interpreter-follow-up';
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
  details?: unknown;
  mutationVersion?: number;
}

interface PersistedRequestPayload {
  requestId: string;
  type: Peticion['type'];
  roomNumber: string;
  guestName: string;
  message: string;
  priority: Peticion['priority'];
  status: Peticion['status'];
  timestamp: string;
  cancelledBy?: Peticion['cancelledBy'];
  cancelledByName?: string;
  cancelledAt?: string;
  rating?: number;
  ratedAt?: string;
  details?: unknown;
  mutationVersion?: number;
}

function mapPersistedRequestToPeticion(request: PersistedRequestPayload): Peticion {
  return {
    id: request.requestId,
    type: request.type,
    roomNumber: request.roomNumber,
    guestName: request.guestName,
    message: request.message,
    priority: request.priority,
    status: request.status,
    timestamp: new Date(request.timestamp),
    cancelledBy: request.cancelledBy,
    cancelledByName: request.cancelledByName,
    cancelledAt: request.cancelledAt,
    rating: request.rating,
    ratedAt: request.ratedAt,
    details: request.details,
    mutationVersion: request.mutationVersion,
  };
}

export function useWebSocketMobile(token: string | null) {
  const [estaConectado, setEstaConectado] = useState(false);
  const [misPeticiones, setMisPeticiones] = useState<Peticion[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<any>(null);
  const refWs = useRef<WebSocket | null>(null);
  const refTimeoutReconexion = useRef<number | undefined>(undefined);
  const refIntentosReconexion = useRef(0);
  const refReconectandoManual = useRef(false);
  const maxIntentosReconexion = 5;
  const taxiRetry = useRef<{ key: string; request: Peticion } | null>(null);
  const sentTaxiIds = useRef(new Set<string>());
  const pendingTransport = useRef(new Map<string, { resolve: () => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>());

  const rejectPendingTransport = useCallback(() => {
    pendingTransport.current.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error('CONNECTION LOST. CHECK REQUEST BEFORE RETRY.'));
    });
    pendingTransport.current.clear();
  }, []);

  const sendTransportOperation = (type: string, payload: unknown): Promise<void> => {
    const ws = refWs.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.reject(new Error('NO CONNECTION. TRY AGAIN.'));
    const operationId = `transport-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingTransport.current.delete(operationId);
        reject(new Error('CONFIRMATION NOT RECEIVED. CHECK REQUEST BEFORE RETRY.'));
      }, 15000);
      pendingTransport.current.set(operationId, { resolve, reject, timer });
      try {
        ws.send(JSON.stringify({ type, operationId, payload }));
      } catch {
        clearTimeout(timer);
        pendingTransport.current.delete(operationId);
        reject(new Error('SEND FAILED. TRY AGAIN.'));
      }
    });
  };

  const acceptTransportOption = (id: string, revision: number, optionId: string) =>
    sendTransportOperation('ACCEPT_TRANSPORT_OPTION', { id, revision, optionId });

  const enviarTaxiConfirmado = async (peticion: Omit<Peticion, 'id' | 'timestamp' | 'status'>): Promise<boolean> => {
    const key = JSON.stringify(peticion);
    const request = taxiRetry.current?.key === key ? taxiRetry.current.request : {
      ...peticion, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date(), status: 'pending' as const,
    };
    taxiRetry.current = { key, request };
    sentTaxiIds.current.add(request.id);
    await sendTransportOperation('NEW_REQUEST', request);
    setMisPeticiones(previous => previous.some(item => item.id === request.id) ? previous : [...previous, request]);
    taxiRetry.current = null;
    return true;
  };

  // Conexión WebSocket con reconexión automática
  const conectar = useCallback(() => {
    if (!token) {
      setEstaConectado(false);
      return;
    }

    try {
      const wsUrl = `${HOTEL_WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        refIntentosReconexion.current = 0;
      };

      // Escuchar mensajes del servidor (BIDIRECCIONAL)
      ws.onmessage = (evento) => {
        try {
          const mensaje = JSON.parse(evento.data);

          switch (mensaje.type) {
            case 'NEW_REQUEST': {
              const id = mensaje.payload?.requestId || mensaje.payload?.id;
              if (sentTaxiIds.current.has(id)) {
                const saved = mapPersistedRequestToPeticion({ ...mensaje.payload, requestId: id });
                setMisPeticiones(previous => previous.some(item => item.id === id)
                  ? previous.map(item => item.id === id && (saved.mutationVersion ?? 0) >= (item.mutationVersion ?? 0) ? saved : item) : [...previous, saved]);
              }
              break;
            }
            case 'TRANSPORT_RESULT': {
              const result = mensaje.payload;
              const pending = pendingTransport.current.get(result?.operationId);
              if (pending) {
                clearTimeout(pending.timer);
                pendingTransport.current.delete(result.operationId);
                if (result.ok) pending.resolve();
                else pending.reject(new Error(result.error || 'OPTION NOT ACCEPTED. CHECK LATEST OPTIONS.'));
              }
              break;
            }
            case 'UPDATE_REQUEST':
              // Actualizar el estado de una petición específica
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id && (mensaje.payload.mutationVersion ?? pet.mutationVersion ?? 0) >= (pet.mutationVersion ?? 0)
                    ? {
                        ...pet,
                        status: mensaje.payload.status || pet.status,
                        details: mensaje.payload.details ?? pet.details,
                        mutationVersion: mensaje.payload.mutationVersion ?? pet.mutationVersion,
                      }
                    : pet
                )
              );
              setUltimaActualizacion(mensaje.payload);
              break;

            case 'CANCEL_REQUEST':
              // Marcar petición como cancelada (no eliminar)
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id && (mensaje.payload.mutationVersion ?? pet.mutationVersion ?? 0) >= (pet.mutationVersion ?? 0)
                    ? { 
                        ...pet, 
                        status: 'cancelled' as const,
                        cancelledBy: mensaje.payload.cancelledBy,
                        cancelledByName: mensaje.payload.cancelledByName,
                        cancelledAt: mensaje.payload.cancelledAt,
                        mutationVersion: mensaje.payload.mutationVersion ?? pet.mutationVersion,
                      }
                    : pet
                )
              );
              break;

            case 'RATE_REQUEST':
              // Actualizar la calificación de una petición
              setMisPeticiones((prev) =>
                prev.map((pet) =>
                  pet.id === mensaje.payload.id && (mensaje.payload.mutationVersion ?? pet.mutationVersion ?? 0) >= (pet.mutationVersion ?? 0)
                    ? { 
                        ...pet, 
                        rating: mensaje.payload.rating,
                        ratedAt: mensaje.payload.ratedAt,
                        mutationVersion: mensaje.payload.mutationVersion ?? pet.mutationVersion,
                      }
                    : pet
                )
              );
              break;

            case 'INIT_CONFIG':
              break;

            case 'INIT_REQUESTS':
              setMisPeticiones(previous => {
                const incoming: Peticion[] = Array.isArray(mensaje.payload?.requests)
                  ? mensaje.payload.requests.map(mapPersistedRequestToPeticion) : [];
                return incoming.map(item => {
                  const current = previous.find(saved => saved.id === item.id);
                  return current && (current.mutationVersion ?? 0) > (item.mutationVersion ?? 0) ? current : item;
                }).concat(previous.filter(item => sentTaxiIds.current.has(item.id) && !incoming.some(saved => saved.id === item.id)));
              });
              setEstaConectado(true);
              break;

            case 'CONFIG_UPDATED':
              break;

            default:
          }
        } catch {
          return;
        }
      };

      ws.onclose = () => {
        rejectPendingTransport();
        setEstaConectado(false);
        refWs.current = null;

        if (refReconectandoManual.current) {
          refReconectandoManual.current = false;
          return;
        }

        // Reconexión automática con backoff exponencial
        if (token && refIntentosReconexion.current < maxIntentosReconexion) {
          const timeout = Math.min(1000 * Math.pow(2, refIntentosReconexion.current), 30000);

          refTimeoutReconexion.current = setTimeout(() => {
            refIntentosReconexion.current++;
            conectar();
          }, timeout) as any;
        }
      };

      refWs.current = ws;
    } catch {
      setEstaConectado(false);
    }
  }, [token, rejectPendingTransport]);

  // Enviar petición al panel web
  const enviarPeticion = (peticion: {
    type: 'services' | 'room-service' | 'problem' | 'extra' | 'interpreter-follow-up';
    roomNumber: string;
    guestName: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    details?: unknown;
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

  const reconectar = useCallback(() => {
    refReconectandoManual.current = true;

    if (refTimeoutReconexion.current) {
      clearTimeout(refTimeoutReconexion.current);
      refTimeoutReconexion.current = undefined;
    }

    refIntentosReconexion.current = 0;

    if (refWs.current) {
      refWs.current.close();
      return;
    }

    refReconectandoManual.current = false;
    conectar();
  }, [conectar]);

  // Iniciar conexión al montar el componente
  useEffect(() => {
    taxiRetry.current = null;
    sentTaxiIds.current.clear();
    if (!token) {
      if (refTimeoutReconexion.current) {
        clearTimeout(refTimeoutReconexion.current);
        refTimeoutReconexion.current = undefined;
      }
      if (refWs.current) {
        refWs.current.close();
        refWs.current = null;
      }
      setEstaConectado(false);
      return;
    }

    conectar();

    return () => {
      rejectPendingTransport();
      if (refTimeoutReconexion.current) {
        clearTimeout(refTimeoutReconexion.current);
      }
      if (refWs.current) {
        refWs.current.close();
      }
    };
  }, [conectar, token, rejectPendingTransport]);

  return {
    estaConectado,
    acceptTransportOption,
    enviarTaxiConfirmado,
    enviarPeticion,
    cancelarPeticion,
    ratePeticion,
    misPeticiones,       
    ultimaActualizacion, 
    reconectar,
  };
}

