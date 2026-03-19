const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ValidateTokenResponse {
  valid: boolean;
  roomNumber?: string;
  stayId?: string;
  expiresAt?: string;
  reason?: string;
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
  try {
    const response = await fetch(`${API_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        reason: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Registers a guest with their name and returns a session token
 * @param token - The validated QR token
 * @param guestName - The guest's name
 * @returns Session token and guest information
 */
export async function registerGuest(token: string, guestName: string): Promise<RegisterGuestResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
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
