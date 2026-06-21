import { useState } from 'react';
import { toast } from 'sonner-native';
import { useWebSocket } from '@/components/BothComponents/websocket-provider';
import { useAuth } from '@/components/BothComponents/auth-provider';

type RequestType = 'services' | 'room-service' | 'problem' | 'extra';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface SendPetitionParams {
  type: RequestType;
  serviceName: string;
  description: string;
  priority?: Priority;
  details?: unknown;
}

/**
 * Hook personalizado para enviar peticiones via WebSocket
 * Centraliza la lógica de validación y envío usada en múltiples pantallas
 */
export function usePetitionSender() {
  const [isLoading, setIsLoading] = useState(false);
  const { estaConectado, enviarPeticion } = useWebSocket();
  const { guestName, roomNumber } = useAuth();

  const sendPetition = async ({
    type,
    serviceName,
    description,
    priority = 'medium',
    details,
  }: SendPetitionParams): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Validar descripción
      if (!description.trim()) {
        toast.error('FIELDS INCOMPLETE', {
          description: 'REQUEST DESCRIPTION ADD.',
        });
        return false;
      }

      // Validar autenticación
      if (!roomNumber || !guestName) {
        toast.error('NOT AUTHENTICATED', {
          description: 'QR CODE LOGIN.',
        });
        return false;
      }

      // Validar conexión
      if (!estaConectado) {
        toast.error('CONNECTION ERROR', {
          description: 'SERVER CONNECTION NONE. INTERNET CHECK.',
        });
        return false;
      }

      // Enviar petición
      const success = enviarPeticion({
        type,
        message: `${serviceName}: ${description}`,
        priority,
        details,
      });

      if (success) {
        // Mensajes personalizados según tipo
        const messages = {
          'services': 'SERVICE REQUEST SENT',
          'room-service': 'ROOM SERVICE REQUEST SENT',
          'problem': 'PROBLEM REPORT SENT',
          'extra': 'REQUEST SENT',
        };

        toast.success(messages[type] || 'REQUEST SENT', {
          description: `${serviceName} REQUEST HOTEL STAFF RECEIVE.`,
        });
        return true;
      } else {
        toast.error('SEND FAIL', {
          description: 'REQUEST SEND NOT. TRY AGAIN.',
        });
        return false;
      }
    } catch (error) {
      toast.error('UNEXPECTED ERROR', {
        description: 'REQUEST SEND, ERROR HAPPEN.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendPetition,
    isLoading,
    isConnected: estaConectado,
  };
}
