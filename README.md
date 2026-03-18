# 📱ASL Mobile App 

Aplicación móvil para hoteles que permite a los huéspedes comunicarse con el personal del hotel mediante dos modos: ASL (Lenguaje de Señas Americano) y mensajería de texto.

## 📋 Características

### Modo Texto
- Comunicación mediante texto, desarrollado para lectores con discapacidad auditiva y publico en general

### Modo ASL
- Comunicación mediante lenguaje de señas (en desarrollo)

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
app/
├── (tabs)/          # Navegación principal con tabs
├── Text/            # Módulo de comunicación por texto
│   ├── TextHome.tsx
│   ├── TextServices.tsx
│   ├── TextRoomS.tsx
│   ├── TextReportProblem.tsx
│   └── TextMovilidad.tsx
├── ASL/             # Módulo de lenguaje de señas
└── _layout.tsx      # Layout raíz

components/
├── theme-provider.tsx
├── themed-view.tsx
├── haptic-tab.tsx
└── ui/
    └── icon-symbol.tsx

constants/
└── theme.ts         # Configuración de temas

styles/
└── common.ts        # Estilos compartidos
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
