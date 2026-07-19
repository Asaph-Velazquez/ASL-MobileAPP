const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface CallSessionResponse {
  callId: string;
  callToken: string;
  callServerUrl: string;
  expiresAt: string;
}

export async function requestCallSession(token: string): Promise<CallSessionResponse> {
  const response = await fetch(`${API_URL}/api/calls/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error || 'Unable to create call session');
  }

  return data as CallSessionResponse;
}
