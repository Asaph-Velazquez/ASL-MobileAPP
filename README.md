# 📱ASL Mobile App 

Aplicación móvil para hoteles que permite a los huéspedes comunicarse con el personal del hotel mediante dos modos: ASL (Lenguaje de Señas Americano) y mensajería de texto.

## 📋 Características

### Modo Texto
- Comunicación mediante texto, desarrollado para lectores con discapacidad auditiva y publico en general

### Modo ASL
- Comunicación mediante lenguaje de señas (en desarrollo)
- Las peticiones por cámara de Room Service, Report Problem y Valet usan un módulo nativo de MediaPipe. Requieren una development build (`npx expo run:android` o `npx expo run:ios`); Expo Go no reconoce señas.
- Configure `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_WS_URL` con la URL del gateway que expone `/api/asl/predict`. El huésped revisa y puede editar la glosa antes de enviarla al hotel.
- Las glosas con confianza >= 0.60 se incorporan al borrador; las menores se muestran como candidatos, sin enviarse automaticamente. Las respuestas posteriores a una cancelacion se descartan. `npm run test:asl` verifica estos contratos sin sustituir la prueba de camara en dispositivo.
- Ante HTTP 413, verifica que ngrok publique el gateway (8080), no el servidor del hotel (3001). No se recortan landmarks ni se reduce su precision para eludir un error de enrutamiento.

## 🚀 Comenzar

### Instalación

```bash
npm install
```

### Ejecutar la aplicación

```bash
npx expo start
```

En la salida, encontrarás opciones para abrir la app en:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## 🛠️ Tecnologías

- **Framework**: Expo Router v6.0.11
- **React Native**: 0.81.4
- **React**: 19.1.0
- **TypeScript**: 5.9.2
- **Navegación**: @react-navigation/bottom-tabs
- **Iconos**: @expo/vector-icons
- **Temas**: Soporte para modo claro/oscuro

## 📁 Estructura del Proyecto

```
ASL-MobileAPP/
├── app/                                  # Rutas de Expo Router
│   ├── (tabs)/                           # Navegacion principal
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── ASL/                              # Flujo de comunicacion por ASL
│   │   ├── ASLHome.tsx
│   │   ├── ASLServices.tsx
│   │   ├── ASLRoomS.tsx
│   │   ├── ASLReportProblem.tsx
│   │   ├── ASLMovilidad.tsx
│   │   └── _layout.tsx
│   ├── Text/                             # Flujo de comunicacion por texto
│   │   ├── TextHome.tsx
│   │   ├── TextServices.tsx
│   │   ├── TextRoomS.tsx
│   │   ├── TextReportProblem.tsx
│   │   ├── TextMovilidad.tsx
│   │   └── _layout.tsx
│   ├── login.tsx                         # Validacion de estancia/sesion
│   ├── onboarding.tsx                    # Pantalla inicial
│   └── _layout.tsx                       # Providers globales
├── components/
│   ├── ASLComponents/                    # Tarjetas, grillas, GIFs e historial ASL
│   ├── TextComponents/                   # Modales, tarjetas e historial de texto
│   └── BothComponents/                   # Componentes compartidos
│       └── ui/                           # Componentes UI por plataforma
├── constants/
│   └── theme.ts                          # Configuracion visual y temas
├── hooks/                                # Hooks de tema, color, notificaciones y envio
├── services/
│   ├── auth.ts                           # Validacion y registro contra la API
│   └── socket.tsx                        # Conexion WebSocket con el servidor
├── assets/                               # Imagenes, iconos y GIFs
├── app.json                              # Configuracion Expo
├── package.json
├── tsconfig.json
└── eslint.config.js
```

## 🎨 Sistema de Temas

La aplicación incluye un sistema de temas personalizado con:
- Modo claro y oscuro
- Colores personalizados para cada servicio
- ThemeProvider global
- Hook personalizado `useThemeColor`

## 🧪 Scripts Disponibles

```bash
npm start          # Iniciar el servidor de desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en web
npm run typecheck  # Verificar tipos de TypeScript
```

## 📝 Desarrollo

El proyecto utiliza:
- **File-based routing** con Expo Router
- **TypeScript** para type safety
- **Estilos compartidos** para consistencia
- **Componentes reutilizables** para UI
