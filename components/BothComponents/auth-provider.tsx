import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { validateToken } from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  guestName: string | null;
  roomNumber: string | null;
  token: string | null;
  login: (token: string, guestName: string, roomNumber: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Claves de AsyncStorage
const AUTH_TOKEN_KEY = 'auth_token';
const GUEST_NAME_KEY = 'guest_name';
const ROOM_NUMBER_KEY = 'room_number';

// Intervalo de validación de sesión (60 segundos)
const SESSION_CHECK_INTERVAL = 60000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Función de inicio de sesión - almacena credenciales en AsyncStorage
  const login = async (newToken: string, newGuestName: string, newRoomNumber: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken),
        AsyncStorage.setItem(GUEST_NAME_KEY, newGuestName),
        AsyncStorage.setItem(ROOM_NUMBER_KEY, newRoomNumber),
      ]);

      setToken(newToken);
      setGuestName(newGuestName);
      setRoomNumber(newRoomNumber);
      setIsAuthenticated(true);
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
    }
  };

  // Función de cierre de sesión - limpia AsyncStorage y navega a login
  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(GUEST_NAME_KEY),
        AsyncStorage.removeItem(ROOM_NUMBER_KEY),
      ]);

      setToken(null);
      setGuestName(null);
      setRoomNumber(null);
      setIsAuthenticated(false);
      // Nota: No se puede navegar a /login - la pantalla aún no existe
    } catch (error) {
    }
  };

  // Verificar credenciales almacenadas al montar
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const [storedToken, storedGuestName, storedRoomNumber] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(GUEST_NAME_KEY),
          AsyncStorage.getItem(ROOM_NUMBER_KEY),
        ]);
        if (storedToken && storedGuestName && storedRoomNumber) {
          // Validar token con el backend
          const validationResult = await validateToken(storedToken);

          if (validationResult.valid) {
            // Token aún es válido, restaurar sesión
            setToken(storedToken);
            setGuestName(storedGuestName);
            setRoomNumber(storedRoomNumber);
            setIsAuthenticated(true);
          } else {
            // Token es inválido, limpiar almacenamiento
            await Promise.all([
              AsyncStorage.removeItem(AUTH_TOKEN_KEY),
              AsyncStorage.removeItem(GUEST_NAME_KEY),
              AsyncStorage.removeItem(ROOM_NUMBER_KEY),
            ]);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  // Verificación de expiración de sesión - validar token cada 60 segundos
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const validationResult = await validateToken(token);

        if (!validationResult.valid) {
          await logout();
        }
      } catch (error) {
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, token]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    guestName,
    roomNumber,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
