import { useEffect } from 'react';
import { toast } from 'sonner-native';

interface NotificationConfig {
  ultimaActualizacion: any;
}

export function useNotifications({ ultimaActualizacion }: NotificationConfig) {
  useEffect(() => {
    if (ultimaActualizacion) {
      const { status } = ultimaActualizacion;

      // Configuración de mensajes según el estado
      const mensajes = {
        'in-progress': {
          titulo: 'Petición en proceso',
          mensaje: 'El personal del hotel está atendiendo tu solicitud.',
        },
        'completed': {
          titulo: 'Petición completada',
          mensaje: '¡Tu solicitud ha sido atendida exitosamente!',
        },
        'pending': {
          titulo: 'Petición pendiente',
          mensaje: 'Tu solicitud está en espera de ser atendida.',
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

        console.log(`Notificación [${status}]:`, config.titulo);
      }
    }
  }, [ultimaActualizacion]);
}
