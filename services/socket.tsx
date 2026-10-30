import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
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

export function useWebSocketMobile(token: string | null, onSessionRevoked?: () => void) {
  const [estaConectado, setEstaConectado] = useState(false);
  const [misPeticiones, setMisPeticiones] = useState<Peticion[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<any>(null);
  const refWs = useRef<WebSocket | null>(null);
  const refTimeoutReconexion = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refInitTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refIntentosReconexion = useRef(0);
  const refActive = useRef(false);
  const refInitialized = useRef(false);
  const refSessionRevoked = useRef(false);
  const refOnSessionRevoked = useRef(onSessionRevoked);
  refOnSessionRevoked.current = onSessionRevoked;
  const requestRetry = useRef<{ key: string; request: Peticion } | null>(null);
  const sentConfirmedIds = useRef(new Set<string>());
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
    if (!refInitialized.current || !ws || ws.readyState !== WebSocket.OPEN) return Promise.reject(new Error('NO CONNECTION. TRY AGAIN.'));
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
    const request = requestRetry.current?.key === key ? requestRetry.current.request : {
      ...peticion, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date(), status: 'pending' as const,
    };
    requestRetry.current = { key, request };
    sentConfirmedIds.current.add(request.id);
    await sendTransportOperation('NEW_REQUEST', request);
    setMisPeticiones(previous => previous.some(item => item.id === request.id) ? previous : [...previous, request]);
    requestRetry.current = null;
    return true;
  };

  const enviarPeticionConfirmada = enviarTaxiConfirmado;

  // Conexión WebSocket con reconexión automática
  const conectar = useCallback(() => {
    if (!token || refSessionRevoked.current || !refActive.current) {
      setEstaConectado(false);
      return;
    }
    if (refWs.current && (refWs.current.readyState === WebSocket.OPEN || refWs.current.readyState === WebSocket.CONNECTING)) return;

    const scheduleReconnect = () => {
      if (!refActive.current || refSessionRevoked.current || refTimeoutReconexion.current !== undefined) return;
      const timeout = Math.min(1000 * Math.pow(2, Math.min(refIntentosReconexion.current++, 5)), 30000);
      refTimeoutReconexion.current = setTimeout(() => {
        refTimeoutReconexion.current = undefined;
        conectar();
      }, timeout);
    };

    try {
      const wsUrl = `${HOTEL_WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      refWs.current = ws;
      refInitialized.current = false;
      const isCurrent = () => refActive.current && !refSessionRevoked.current && refWs.current === ws;
      const handleDisconnect = () => {
        if (!isCurrent()) return;
        clearTimeout(refInitTimeout.current);
        refInitTimeout.current = undefined;
        rejectPendingTransport();
        refInitialized.current = false;
        setEstaConectado(false);
        refWs.current = null;
        scheduleReconnect();
      };
      refInitTimeout.current = setTimeout(() => {
        if (!isCurrent() || refInitialized.current) return;
        handleDisconnect();
        ws.close();
      }, 10000);

      // Escuchar mensajes del servidor (BIDIRECCIONAL)
      ws.onmessage = (evento) => {
        if (!isCurrent()) return;
        try {
          const mensaje = JSON.parse(evento.data);

          switch (mensaje.type) {
            case 'SESSION_REVOKED':
              refSessionRevoked.current = true;
              refInitialized.current = false;
              clearTimeout(refInitTimeout.current);
              refInitTimeout.current = undefined;
              clearTimeout(refTimeoutReconexion.current);
              refTimeoutReconexion.current = undefined;
              refWs.current = null;
              rejectPendingTransport();
              setEstaConectado(false);
              refOnSessionRevoked.current?.();
              ws.close();
              break;
            case 'NEW_REQUEST': {
              const id = mensaje.payload?.requestId || mensaje.payload?.id;
              if (sentConfirmedIds.current.has(id)) {
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
              clearTimeout(refInitTimeout.current);
              refInitTimeout.current = undefined;
              refInitialized.current = true;
              refIntentosReconexion.current = 0;
              setMisPeticiones(previous => {
                const incoming: Peticion[] = Array.isArray(mensaje.payload?.requests)
                  ? mensaje.payload.requests.map(mapPersistedRequestToPeticion) : [];
                return incoming.map(item => {
                  const current = previous.find(saved => saved.id === item.id);
                  return current && (current.mutationVersion ?? 0) > (item.mutationVersion ?? 0) ? current : item;
                }).concat(previous.filter(item => sentConfirmedIds.current.has(item.id) && !incoming.some(saved => saved.id === item.id)));
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

      ws.onclose = handleDisconnect;
      ws.onerror = () => {
        if (!isCurrent()) return;
        handleDisconnect();
        ws.close();
      };
    } catch {
      setEstaConectado(false);
      scheduleReconnect();
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
    if (refInitialized.current && refWs.current && refWs.current.readyState === WebSocket.OPEN) {
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
    if (refInitialized.current && refWs.current && refWs.current.readyState === WebSocket.OPEN) {
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
    if (refInitialized.current && refWs.current && refWs.current.readyState === WebSocket.OPEN) {
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
    clearTimeout(refTimeoutReconexion.current);
    refTimeoutReconexion.current = undefined;
    clearTimeout(refInitTimeout.current);
    refInitTimeout.current = undefined;
    refIntentosReconexion.current = 0;
    const previous = refWs.current;
    refWs.current = null;
    refInitialized.current = false;
    rejectPendingTransport();
    setEstaConectado(false);
    if (previous) {
      previous.onclose = null;
      previous.onmessage = null;
      previous.onerror = null;
      previous.close();
    }
    conectar();
  }, [conectar, rejectPendingTransport]);

  // Iniciar conexión al montar el componente
  useEffect(() => {
    refActive.current = Boolean(token);
    refSessionRevoked.current = false;
    requestRetry.current = null;
    sentConfirmedIds.current.clear();
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
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') reconectar();
    });
    const onOnline = () => reconectar();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', onOnline);
    }

    return () => {
      refActive.current = false;
      refInitialized.current = false;
      subscription.remove();
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('online', onOnline);
      }
      rejectPendingTransport();
      if (refTimeoutReconexion.current) {
        clearTimeout(refTimeoutReconexion.current);
      }
      refTimeoutReconexion.current = undefined;
      clearTimeout(refInitTimeout.current);
      refInitTimeout.current = undefined;
      const previous = refWs.current;
      refWs.current = null;
      if (previous) {
        previous.onclose = null;
        previous.onmessage = null;
        previous.onerror = null;
        previous.close();
      }
    };
  }, [conectar, token, rejectPendingTransport, reconectar]);

  return {
    estaConectado,
    acceptTransportOption,
    enviarTaxiConfirmado,
    enviarPeticionConfirmada,
    enviarPeticion,
    cancelarPeticion,
    ratePeticion,
    misPeticiones,       
    ultimaActualizacion, 
    reconectar,
  };
}

