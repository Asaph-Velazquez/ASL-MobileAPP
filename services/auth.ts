import { API_BASE_URL } from '@/constants/network';

interface ValidateTokenResponse {
  valid: boolean;
  roomNumber?: string;
  stayId?: string;
  expiresAt?: string;
  reason?: string;
  status?: number;
  isNetworkError?: boolean;
}

interface RegisterGuestResponse {
  sessionToken: string;
  guestName: string;
  roomNumber: string;
}

/**
 * Validates a QR token with the backend
 * @param token - The QR token to validate
 * @returns Validation result with room number and stay information if valid
 */
export async function validateToken(token: string): Promise<ValidateTokenResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        reason: errorData?.reason || errorData?.error || errorData?.message || `HTTP ${response.status}`,
        status: response.status,
        isNetworkError: response.status === 429 || response.status >= 500,
      };
    }

    const data = await response.json().catch(() => null);
    if (typeof data?.valid !== 'boolean') return { valid: false, status: 502, isNetworkError: true, reason: 'INVALID_SERVER_RESPONSE' };
    return data;
  } catch (error) {
    return {
      valid: false,
      isNetworkError: true,
      reason: controller.signal.aborted ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Validates token with network error handling
 * Returns detailed info about the validation result
 * @param token - The QR token to validate
 * @returns Object with validation result and network status
 */
export async function validateTokenWithNetworkStatus(token: string): Promise<{
  isValid: boolean;
  isNetworkError: boolean;
  expiresAt?: string;
  roomNumber?: string;
  reason?: string;
}> {
  const result = await validateToken(token);
  return {
    isValid: result.valid,
    isNetworkError: result.isNetworkError ?? false,
    expiresAt: result.expiresAt,
    roomNumber: result.roomNumber,
    reason: result.reason,
  };
}

/**
 * Registers a guest with their name and returns a session token
 * @param token - The validated QR token
 * @param guestName - The guest's name
 * @returns Session token and guest information
 */
export async function registerGuest(token: string, guestName: string): Promise<RegisterGuestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ guestName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
