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
    priority = 'medium'
  }: SendPetitionParams): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Validar descripción
      if (!description.trim()) {
        toast.error('Incomplete fields', {
          description: 'Please add a description for your request',
        });
        return false;
      }

      // Validar autenticación
      if (!roomNumber || !guestName) {
        toast.error('Not authenticated', {
          description: 'Please log in with your QR code',
        });
        return false;
      }

      // Validar conexión
      if (!estaConectado) {
        toast.error('Connection error', {
          description: 'No connection to server. Check your connection.',
        });
        return false;
      }

      // Enviar petición
      const success = enviarPeticion({
        type,
        message: `${serviceName}: ${description}`,
        priority,
      });

      if (success) {
        // Mensajes personalizados según tipo
        const messages = {
          'services': 'Service Request Sent',
          'room-service': 'Room Service Requested',
          'problem': 'Problem Reported',
          'extra': 'Request Sent',
        };

        toast.success(messages[type] || 'Request Sent', {
          description: `Your ${serviceName} request has been sent to hotel staff.`,
        });
        return true;
      } else {
        toast.error('Failed to send', {
          description: 'Could not send your request. Please try again.',
        });
        return false;
      }
    } catch (error) {
      console.error('Error sending petition:', error);
      toast.error('Unexpected error', {
        description: 'An error occurred while sending your request.',
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
