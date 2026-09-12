import { API_BASE_URL, buildCallSocketUrl } from '@/constants/network';

export interface CallSessionResponse {
  callId: string;
  callToken: string;
  callServerUrl: string;
  expiresAt: string;
}

export type WebRtcDescriptionType = 'offer' | 'answer' | 'pranswer' | 'rollback';

export interface WebRtcSessionDescriptionPayload {
  type: WebRtcDescriptionType;
  sdp?: string;
}

export interface WebRtcIceCandidatePayload {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export type CallServerMessageType =
  | 'CALL_REQUEST'
  | 'CALL_PENDING'
  | 'CALL_ACCEPTED'
  | 'CALL_REJECTED'
  | 'CALL_UNAVAILABLE'
  | 'CALL_ENDED'
  | 'WEBRTC_OFFER'
  | 'WEBRTC_ANSWER'
  | 'WEBRTC_ICE_CANDIDATE';

export interface CallServerMessage {
  type: CallServerMessageType;
  payload?: {
    callId?: string;
    reason?: string;
    interpreterName?: string;
    sdp?: WebRtcSessionDescriptionPayload;
    candidate?: WebRtcIceCandidatePayload;
  };
}

export async function requestCallSession(token: string): Promise<CallSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/calls/session`, {
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

export function parseCallServerMessage(raw: string): CallServerMessage | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CallServerMessage>;
    if (!parsed.type) {
      return null;
    }

    return {
      type: parsed.type,
      payload: parsed.payload,
    } as CallServerMessage;
  } catch {
    return null;
  }
}

export function sendCallServerMessage(socket: WebSocket, message: CallServerMessage): boolean {
  if (socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(message));
  return true;
}

export { buildCallSocketUrl };
