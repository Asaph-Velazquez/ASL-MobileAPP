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
          titulo: 'REQUEST IN PROGRESS',
          mensaje: 'HOTEL STAFF YOUR REQUEST HANDLE NOW.',
        },
        'completed': {
          titulo: 'REQUEST COMPLETED',
          mensaje: 'YOUR REQUEST FINISH SUCCESS.',
        },
        'pending': {
          titulo: 'REQUEST PENDING',
          mensaje: 'YOUR REQUEST WAIT. HOTEL STAFF HANDLE SOON.',
        },
        'cancelled': {
          titulo: 'REQUEST CANCELLED',
          mensaje: 'YOUR REQUEST CANCELLED.',
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
          case 'cancelled':
            toast.error(config.titulo, {
              description: config.mensaje,
            });
            break;
        }

      }
    }
  }, [ultimaActualizacion]);
}
