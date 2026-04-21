import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { validateToken, validateTokenWithNetworkStatus } from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  sessionExpired: boolean;
  guestName: string | null;
  roomNumber: string | null;
  token: string | null;
  expiresAt: string | null;
  login: (token: string, guestName: string, roomNumber: string, expiresAt?: string) => Promise<void>;
  logout: () => Promise<void>;
  revalidateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Claves de AsyncStorage
const AUTH_TOKEN_KEY = 'auth_token';
const GUEST_NAME_KEY = 'guest_name';
const ROOM_NUMBER_KEY = 'room_number';
const SESSION_EXPIRES_KEY = 'session_expires';

// Intervalo de validación de sesión (60 segundos)
const SESSION_CHECK_INTERVAL = 60000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Verifica si la sesión ha expirado localmente (usando expiresAt)
   */
  const isSessionLocallyExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    return now >= expiry;
  };

  /**
   * Re-valida la sesión con el servidor al reconectar
   */
  const revalidateSession = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const result = await validateTokenWithNetworkStatus(token);

      if (result.isValid) {
        setIsOffline(false);
        setSessionExpired(false);
        setIsAuthenticated(true);
        return true;
      } else if (!result.isNetworkError) {
        // Token realmente inválido (no es error de red)
        setSessionExpired(true);
        setIsAuthenticated(false);
        return false;
      } else {
        // Error de red - mantener sesión si no ha expirado localmente
        setIsOffline(true);
        if (!isSessionLocallyExpired(expiresAt)) {
          setIsAuthenticated(true);
          return true;
        } else {
          setSessionExpired(true);
          setIsAuthenticated(false);
          return false;
        }
      }
    } catch (error) {
      setIsOffline(true);
      // Mantener sesión si no ha expirado localmente
      if (!isSessionLocallyExpired(expiresAt)) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  };

  /**
   * Función de inicio de sesión - almacena credenciales en AsyncStorage
   */
  const login = async (
    newToken: string,
    newGuestName: string,
    newRoomNumber: string,
    newExpiresAt?: string
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken),
        AsyncStorage.setItem(GUEST_NAME_KEY, newGuestName),
        AsyncStorage.setItem(ROOM_NUMBER_KEY, newRoomNumber),
        newExpiresAt
          ? AsyncStorage.setItem(SESSION_EXPIRES_KEY, newExpiresAt)
          : Promise.resolve(),
      ]);

      setToken(newToken);
      setGuestName(newGuestName);
      setRoomNumber(newRoomNumber);
      setExpiresAt(newExpiresAt || null);
      setIsAuthenticated(true);
      setIsOffline(false);
      setSessionExpired(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  /**
   * Función de cierre de sesión - limpia AsyncStorage
   */
  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(GUEST_NAME_KEY),
        AsyncStorage.removeItem(ROOM_NUMBER_KEY),
        AsyncStorage.removeItem(SESSION_EXPIRES_KEY),
      ]);

      setToken(null);
      setGuestName(null);
      setRoomNumber(null);
      setExpiresAt(null);
      setIsAuthenticated(false);
      setIsOffline(false);
      setSessionExpired(false);
    } catch (error) {
    }
  };

  /**
   * Verificar credenciales almacenadas al montar
   */
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const [storedToken, storedGuestName, storedRoomNumber, storedExpiresAt] =
          await Promise.all([
            AsyncStorage.getItem(AUTH_TOKEN_KEY),
            AsyncStorage.getItem(GUEST_NAME_KEY),
            AsyncStorage.getItem(ROOM_NUMBER_KEY),
            AsyncStorage.getItem(SESSION_EXPIRES_KEY),
          ]);

        if (storedToken && storedGuestName && storedRoomNumber) {
          // Primero verificar expiración local
          if (isSessionLocallyExpired(storedExpiresAt)) {
            // Sesión expirada localmente, limpiar
            await Promise.all([
              AsyncStorage.removeItem(AUTH_TOKEN_KEY),
              AsyncStorage.removeItem(GUEST_NAME_KEY),
              AsyncStorage.removeItem(ROOM_NUMBER_KEY),
              AsyncStorage.removeItem(SESSION_EXPIRES_KEY),
            ]);
            setSessionExpired(true);
            setIsLoading(false);
            return;
          }

          // Intentar validar con el servidor
          const validationResult = await validateTokenWithNetworkStatus(storedToken);

          if (validationResult.isValid) {
            // Token válido - restaurar sesión
            setToken(storedToken);
            setGuestName(storedGuestName);
            setRoomNumber(storedRoomNumber);
            setExpiresAt(validationResult.expiresAt || storedExpiresAt);
            setIsAuthenticated(true);
            setIsOffline(false);
            setSessionExpired(false);

            // Guardar expiresAt si viene del servidor
            if (validationResult.expiresAt && validationResult.expiresAt !== storedExpiresAt) {
              await AsyncStorage.setItem(
                SESSION_EXPIRES_KEY,
                validationResult.expiresAt
              );
            }
          } else if (validationResult.isNetworkError) {
            // Error de red - mantener sesión offline si no ha expirado localmente
            setToken(storedToken);
            setGuestName(storedGuestName);
            setRoomNumber(storedRoomNumber);
            setExpiresAt(storedExpiresAt);
            setIsAuthenticated(true);
            setIsOffline(true);
            setSessionExpired(false);
          } else {
            // Token realmente inválido
            await Promise.all([
              AsyncStorage.removeItem(AUTH_TOKEN_KEY),
              AsyncStorage.removeItem(GUEST_NAME_KEY),
              AsyncStorage.removeItem(ROOM_NUMBER_KEY),
              AsyncStorage.removeItem(SESSION_EXPIRES_KEY),
            ]);
            setSessionExpired(true);
          }
        }
      } catch (error) {
        // Error al leer storage
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  /**
   * Verificación periódica de sesión
   */
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const result = await validateTokenWithNetworkStatus(token);

        if (result.isValid) {
          setIsOffline(false);
          setSessionExpired(false);
        } else if (!result.isNetworkError) {
          // Token realmente inválido
          await logout();
        } else {
          // Error de red - verificar expiración local
          setIsOffline(true);
          if (isSessionLocallyExpired(expiresAt)) {
            setSessionExpired(true);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        setIsOffline(true);
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, token, expiresAt]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    isOffline,
    sessionExpired,
    guestName,
    roomNumber,
    token,
    expiresAt,
    login,
    logout,
    revalidateSession,
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
