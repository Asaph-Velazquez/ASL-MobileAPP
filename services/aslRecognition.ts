import { API_BASE_URL } from '@/constants/network';

export type Prediction = { glosa: string; confidence: number; index: number };

export const MIN_SIGN_CONFIDENCE = 0.60;

export function appendRecognizedSign(draft: string, prediction: Prediction): string {
  if (prediction.confidence < MIN_SIGN_CONFIDENCE) return draft;
  return `${draft.trim()} ${prediction.glosa.trim()}`.trim();
}

export async function predictSign(frames: number[][], token: string, signal: AbortSignal): Promise<Prediction> {
  if (frames.length < 15 || frames.length > 60 || frames.some(frame =>
    frame.length !== 63 || frame.some(value => !Number.isFinite(value)))) {
    throw new Error('INVALID LANDMARK SEQUENCE');
  }
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener('abort', cancel);
  if (signal.aborted) request.abort();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    request.abort();
  }, 15000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/asl/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ landmarks: frames }),
      signal: request.signal,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('SESSION INVALID OR STAY INACTIVE. SIGN IN AGAIN.');
      if (response.status === 404) throw new Error('MODEL ROUTE NOT FOUND. CHECK GATEWAY.');
      if (response.status === 413) throw new Error('SIGN DATA REJECTED (413). CHECK MODEL GATEWAY CONFIGURATION.');
      throw new Error(response.status === 429 ? 'MODEL BUSY. TRY AGAIN.' : `SIGN PROCESSING FAILED (${response.status})`);
    }
    const result = await response.json() as Prediction;
    // Some transports can finish JSON parsing after cancellation.
    if (request.signal.aborted) {
      const error = new Error('Sign processing cancelled');
      error.name = 'AbortError';
      throw error;
    }
    if (!result || typeof result.glosa !== 'string' || !result.glosa.trim() ||
        !Number.isFinite(result.confidence) || result.confidence < 0 || result.confidence > 1 ||
        !Number.isInteger(result.index) || result.index < 0) {
      throw new Error('INVALID MODEL RESPONSE');
    }
    return { ...result, glosa: result.glosa.trim() };
  } catch (error) {
    if (timedOut && !signal.aborted) throw new Error('MODEL RESPONSE TIMED OUT. TRY AGAIN.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
  }
}
