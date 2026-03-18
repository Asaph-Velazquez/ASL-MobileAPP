import { useEffect } from 'react';
import { toast } from 'sonner-native';

interface NotificationConfig {
  ultimaActualizacion: any;
}

export function useNotifications({ ultimaActualizacion }: NotificationConfig) {
  useEffect(() => {
    if (ultimaActualizacion) {
      const { status } = ultimaActualizacion;

      // Notification messages by request status
      const mensajes = {
        'in-progress': {
          titulo: 'Request in progress',
          mensaje: 'Hotel staff is currently handling your request.',
        },
        'completed': {
          titulo: 'Request completed',
          mensaje: 'Your request has been successfully completed!',
        },
        'pending': {
          titulo: 'Request pending',
          mensaje: 'Your request is waiting to be handled.',
        },
      };

      const config = mensajes[status as keyof typeof mensajes];

      if (config) {
        switch (status) {
          case 'completed':
            toast.success(config.titulo, {
              description: config.mensaje,
            });
            break;
          case 'in-progress':
            toast.info(config.titulo, {
              description: config.mensaje,
            });
            break;
          case 'pending':
            toast.warning(config.titulo, {
              description: config.mensaje,
            });
            break;
        }

        console.log(`Notification [${status}]:`, config.titulo);
      }
    }
  }, [ultimaActualizacion]);
}
