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
  | 'CALL_ERROR'
  | 'WEBRTC_OFFER'
  | 'WEBRTC_ANSWER'
  | 'WEBRTC_ICE_CANDIDATE';

export interface CallServerMessage {
  type: CallServerMessageType;
  payload?: {
    callId?: string;
    reason?: string;
    endReason?: string;
    interpreterName?: string;
    sdp?: WebRtcSessionDescriptionPayload;
    candidate?: WebRtcIceCandidatePayload;
  };
}

export async function requestCallSession(token: string, signal?: AbortSignal): Promise<CallSessionResponse> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);
  if (signal?.aborted) cancel();
  const timeout = setTimeout(cancel, 15000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/calls/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (controller.signal.aborted) throw new Error('CALL SESSION REQUEST CANCELLED OR TIMED OUT');
    if (!response.ok || !data) {
      const error = new Error(data?.error || 'Unable to create call session');
      throw Object.assign(error, { status: response.status });
    }

    return data as CallSessionResponse;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
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
