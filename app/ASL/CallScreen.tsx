import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { type MediaStream, type RTCPeerConnection } from 'react-native-webrtc';

import { GuestCallVideoStage } from '@/components/ASLComponents/GuestCallVideoStage';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { GuestCallControls } from '@/components/BothComponents/GuestCallControls';
import {
  buildCallSocketUrl,
  parseCallServerMessage,
  requestCallSession,
  sendCallServerMessage,
  type CallServerMessage,
  type WebRtcIceCandidatePayload,
} from '@/services/call';
import {
  applyIceCandidate,
  applyRemoteDescription,
  attachLocalStream,
  closePeerConnection,
  createGuestPeerConnection,
  createLocalMediaStream,
  requestCallMediaPermissions,
  serializeSessionDescription,
  stopStream,
} from '@/services/webrtc';

type CallStatus = 'booting' | 'connecting' | 'pending' | 'accepted' | 'connected' | 'unavailable' | 'ended' | 'error';
type MediaStatus = 'idle' | 'requesting' | 'preparing' | 'ready' | 'connecting' | 'connected' | 'error';

export default function CallScreen() {
  const isFocused = useIsFocused();
  const { token, guestName, roomNumber } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sideBySide = width - insets.left - insets.right >= 768;
  const [status, setStatus] = useState<CallStatus>('booting');
  const [message, setMessage] = useState('PREPARE INTERPRETER SESSION...');
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [mediaMessage, setMediaMessage] = useState('CAMERA AND MICROPHONE START AFTER INTERPRETER ACCEPT CALL.');
  const [callId, setCallId] = useState<string | null>(null);
  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isRetryingMedia, setIsRetryingMedia] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef<CallStatus>('booting');
  const callIdRef = useRef<string | null>(null);
  const mediaPendingRef = useRef<Promise<MediaStream> | null>(null);
  const mediaGenerationRef = useRef(0);
  const pendingIceRef = useRef<WebRtcIceCandidatePayload[]>([]);

  function updateStatus(nextStatus: CallStatus, nextMessage: string) {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    setMessage(nextMessage);
  }

  function cleanupMediaSession() {
    mediaGenerationRef.current += 1;
    mediaPendingRef.current = null;
    pendingIceRef.current = [];
    closePeerConnection(peerRef.current);
    peerRef.current = null;

    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStreamUrl(null);

    stopStream(remoteStreamRef.current);
    remoteStreamRef.current = null;
    setRemoteStreamUrl(null);

    setIsMicrophoneEnabled(true);
    setIsCameraEnabled(true);
    setIsRetryingMedia(false);
    setMediaStatus('idle');
    setMediaMessage('CAMERA AND MICROPHONE START AFTER INTERPRETER ACCEPT CALL.');
  }

  function applyTrackEnabled(kind: 'audio' | 'video', enabled: boolean) {
    localStreamRef.current
      ?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => {
        track.enabled = enabled;
      });
  }

  async function ensurePeerSession(currentCallId: string, socket: WebSocket) {
    if (peerRef.current) {
      return peerRef.current;
    }

    const peer = createGuestPeerConnection({
      onIceCandidate: (candidate) => {
        sendCallServerMessage(socket, {
          type: 'WEBRTC_ICE_CANDIDATE',
          payload: { callId: currentCallId, candidate },
        });
      },
      onRemoteStream: (stream) => {
        if (remoteStreamRef.current && remoteStreamRef.current !== stream) {
          stopStream(remoteStreamRef.current);
        }

        remoteStreamRef.current = stream;
        // RTCView binds the video track when streamURL changes. Do not mount it
        // for an audio-only stream: the later video event has the same URL.
        const hasVideo = stream.getVideoTracks().length > 0;
        setRemoteStreamUrl(hasVideo ? stream.toURL() : null);
        setMediaStatus(hasVideo ? 'connected' : 'connecting');
        setMediaMessage(hasVideo ? 'INTERPRETER VIDEO RECEIVED.' : 'INTERPRETER AUDIO RECEIVED. WAIT VIDEO...');
        if (hasVideo && (statusRef.current === 'accepted' || statusRef.current === 'connecting')) {
          updateStatus('connected', 'INTERPRETER VIDEO AND AUDIO CONNECTED.');
        }
      },
      onConnectionStateChange: (connectionState) => {
        switch (connectionState) {
          case 'connecting':
            setMediaStatus('connecting');
            setMediaMessage('SECURE MEDIA CONNECTION IN PROGRESS...');
            break;
          case 'connected':
            setMediaStatus('connected');
            setMediaMessage('SECURE VIDEO CALL ACTIVE.');
            if (statusRef.current === 'accepted' || statusRef.current === 'connecting') {
              updateStatus('connected', 'INTERPRETER VIDEO AND AUDIO CONNECTED.');
            }
            break;
          case 'failed':
          case 'closed':
            setMediaStatus('error');
            setMediaMessage('MEDIA CONNECTION FAILED. END CALL. TRY AGAIN.');
            if (statusRef.current !== 'ended' && statusRef.current !== 'unavailable') {
              updateStatus('error', 'CALL OPEN. MEDIA CONNECTION FAILED.');
            }
            break;
          case 'disconnected':
            setMediaStatus('connecting');
            setMediaMessage('MEDIA DISCONNECTED. WAIT RECONNECT...');
            if (statusRef.current === 'connected') {
              updateStatus('accepted', 'INTERPRETER STILL CONNECTED. RECONNECT MEDIA...');
            }
            break;
          default:
            break;
        }
      },
    });

    peerRef.current = peer;
    return peer;
  }

  function ensureLocalMedia(currentCallId: string, socket: WebSocket): Promise<MediaStream> {
    if (localStreamRef.current) {
      return Promise.resolve(localStreamRef.current);
    }
    if (mediaPendingRef.current) return mediaPendingRef.current;
    const pending = captureLocalMedia(currentCallId, socket);
    mediaPendingRef.current = pending;
    const clearPending = () => {
      if (mediaPendingRef.current === pending) mediaPendingRef.current = null;
    };
    void pending.then(clearPending, clearPending);
    return pending;
  }

  async function captureLocalMedia(currentCallId: string, socket: WebSocket) {
    const generation = mediaGenerationRef.current;
    const isCurrent = () => generation === mediaGenerationRef.current &&
      callIdRef.current === currentCallId && socket.readyState === WebSocket.OPEN;

    setMediaStatus('requesting');
    setMediaMessage('CAMERA AND MICROPHONE PERMISSION REQUEST...');
    const permissionResult = await requestCallMediaPermissions();
    if (!isCurrent()) throw new Error('CALL ENDED DURING MEDIA REQUEST.');
    if (!permissionResult.granted) {
      setMediaStatus('error');
      setMediaMessage('CAMERA AND MICROPHONE PERMISSION REQUIRED.');
      throw new Error('MEDIA PERMISSION DENIED.');
    }

    setMediaStatus('preparing');
    setMediaMessage('START CAMERA AND MICROPHONE...');
    const stream = await createLocalMediaStream();
    if (!isCurrent()) {
      stopStream(stream);
      throw new Error('CALL ENDED DURING MEDIA START.');
    }
    const peer = await ensurePeerSession(currentCallId, socket);
    if (!isCurrent()) {
      stopStream(stream);
      throw new Error('CALL ENDED DURING MEDIA SETUP.');
    }

    localStreamRef.current = stream;
    applyTrackEnabled('audio', isMicrophoneEnabled);
    applyTrackEnabled('video', isCameraEnabled);
    setLocalStreamUrl(stream.toURL());
    await attachLocalStream(peer, stream);
    if (!isCurrent()) throw new Error('CALL ENDED DURING MEDIA CONNECTION.');
    setMediaStatus('ready');
    setMediaMessage('CAMERA PREVIEW READY. WAIT INTERPRETER MEDIA...');

    return stream;
  }

  async function handleSignalingMessage(currentMessage: CallServerMessage, socket: WebSocket) {
    const currentCallId = currentMessage.payload?.callId;
    if (!currentCallId || currentCallId !== callIdRef.current) {
      return;
    }

    const peer = await ensurePeerSession(currentCallId, socket);

    switch (currentMessage.type) {
      case 'WEBRTC_OFFER': {
        const description = currentMessage.payload?.sdp;
        if (!description) {
          return;
        }

        await ensureLocalMedia(currentCallId, socket);
        await applyRemoteDescription(peer, description);
        for (const candidate of pendingIceRef.current.splice(0)) await applyIceCandidate(peer, candidate);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = serializeSessionDescription(peer.localDescription);
        if (payload) {
          sendCallServerMessage(socket, {
            type: 'WEBRTC_ANSWER',
            payload: { callId: currentCallId, sdp: payload },
          });
        }
        setMediaStatus('connecting');
        setMediaMessage('INTERPRETER OFFER ACCEPTED. CONNECT MEDIA...');
        break;
      }
      case 'WEBRTC_ANSWER': {
        const description = currentMessage.payload?.sdp;
        if (!description) {
          return;
        }

        await applyRemoteDescription(peer, description);
        for (const candidate of pendingIceRef.current.splice(0)) await applyIceCandidate(peer, candidate);
        setMediaStatus('connecting');
        setMediaMessage('INTERPRETER ANSWER RECEIVED. CONNECT MEDIA...');
        break;
      }
      case 'WEBRTC_ICE_CANDIDATE': {
        const candidate = currentMessage.payload?.candidate;
        if (!candidate) {
          return;
        }

        if (peer.remoteDescription) {
          await applyIceCandidate(peer, candidate);
        } else {
          pendingIceRef.current.push(candidate);
        }
        break;
      }
      default:
        break;
    }
  }

  useEffect(() => {
    if (!isFocused) return;
    if (!token) {
      updateStatus('error', 'GUEST SESSION NOT AVAILABLE.');
      return;
    }

    let disposed = false;
    let signalingQueue = Promise.resolve();
    let connectionTimer: ReturnType<typeof setTimeout> | undefined;
    const clearConnectionTimer = () => {
      if (connectionTimer) clearTimeout(connectionTimer);
      connectionTimer = undefined;
    };

    const boot = async () => {
      try {
        updateStatus('connecting', 'REQUEST INTERPRETER CALL...');
        const session = await requestCallSession(token);
        if (disposed) return;
        setCallId(session.callId);
        callIdRef.current = session.callId;
        setMessage('CONNECT TO INTERPRETER CALL SERVER...');

        const socket = new WebSocket(buildCallSocketUrl(session.callServerUrl, session.callToken));
        wsRef.current = socket;

        connectionTimer = setTimeout(() => {
          if (disposed) return;
          updateStatus('error', 'CALL SERVER NO RESPONSE. END CALL. TRY AGAIN.');
          socket.close();
        }, 15000);

        socket.onopen = () => {
          if (disposed) return;
          setMessage('CALL SERVER CONNECTED. FIND INTERPRETER...');
          sendCallServerMessage(socket, {
            type: 'CALL_REQUEST',
            payload: { callId: session.callId },
          });
        };

        socket.onmessage = (event) => {
          if (disposed) return;
          const incoming = parseCallServerMessage(String(event.data));
          if (!incoming) {
            return;
          }
          if (['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_UNAVAILABLE', 'CALL_REJECTED', 'CALL_ENDED', 'CALL_ERROR'].includes(incoming.type)) {
            clearConnectionTimer();
          }

          const generation = mediaGenerationRef.current;
          const processMessage = async () => {
            try {
              if (disposed || generation !== mediaGenerationRef.current) return;
              switch (incoming.type) {
                case 'CALL_PENDING':
                  updateStatus('pending', 'INTERPRETER NOTIFIED. WAIT ACCEPTANCE...');
                  break;
                case 'CALL_ACCEPTED':
                  updateStatus(
                    'accepted',
                    `INTERPRETER ${incoming.payload?.interpreterName || ''} ACCEPTED. START MEDIA...`.trim().toUpperCase(),
                  );
                  await ensureLocalMedia(session.callId, socket);
                  break;
                case 'CALL_REJECTED':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  updateStatus('unavailable', 'INTERPRETER DECLINED. TRY AGAIN LATER.');
                  break;
                case 'CALL_UNAVAILABLE':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  updateStatus('unavailable', 'INTERPRETER NOT AVAILABLE NOW.');
                  break;
                case 'CALL_ENDED':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  updateStatus('ended', 'CALL ENDED. HOTEL STAFF FOLLOW-UP IF NEEDED.');
                  break;
                case 'CALL_ERROR':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  updateStatus('error', 'CALL SERVER REQUEST FAILED. END CALL. TRY AGAIN.');
                  break;
                case 'WEBRTC_OFFER':
                case 'WEBRTC_ANSWER':
                case 'WEBRTC_ICE_CANDIDATE':
                  await handleSignalingMessage(incoming, socket);
                  break;
                default:
                  break;
              }
            } catch {
              if (disposed || generation !== mediaGenerationRef.current) return;
              setMediaStatus('error');
              setMediaMessage('GUEST MEDIA SETUP FAILED. CHECK PERMISSION AND CONNECTION.');
              updateStatus('error', 'CALL SIGNAL FAILED. MEDIA START FAILED.');
            }
          };
          // Serialize SDP/ICE, but allow CALL_ENDED to cancel pending permissions.
          if (incoming.type.startsWith('WEBRTC_')) {
            signalingQueue = signalingQueue.then(processMessage);
          } else {
            void processMessage();
          }
        };

        socket.onerror = () => {
          if (disposed) return;
          clearConnectionTimer();
          updateStatus('error', 'CANNOT CONNECT TO CALL SERVER.');
        };

        socket.onclose = () => {
          clearConnectionTimer();
          if (!disposed && statusRef.current !== 'ended') {
            callIdRef.current = null;
            cleanupMediaSession();
            if (
              statusRef.current === 'connected' ||
              statusRef.current === 'accepted' ||
              statusRef.current === 'pending' ||
              statusRef.current === 'connecting'
            ) {
              updateStatus('ended', 'CALL SERVER CLOSED SESSION.');
            }
          }
        };
      } catch {
        updateStatus('error', 'CANNOT START CALL. CHECK CONNECTION. TRY AGAIN.');
      }
    };

    boot();

    return () => {
      disposed = true;
      clearConnectionTimer();
      wsRef.current?.close();
      wsRef.current = null;
      callIdRef.current = null;
      setCallId(null);
      cleanupMediaSession();
    };
  // Este efecto mantiene una sesión por token; los manejadores consultan el
  // estado actual en referencias y no deben recrear una llamada durante un render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isFocused]);

  const phaseDetails = useMemo(() => {
    if (status === 'error') {
      return { label: 'ERROR', tone: 'danger' as const };
    }
    if (status === 'ended') {
      return { label: 'ENDED', tone: 'neutral' as const };
    }
    if (status === 'unavailable') {
      return { label: 'NOT AVAILABLE', tone: 'danger' as const };
    }
    if (status === 'pending') {
      return { label: 'PENDING', tone: 'info' as const };
    }
    if (mediaStatus === 'connected' || status === 'connected') {
      return { label: 'CONNECTED', tone: 'success' as const };
    }
    if (mediaStatus === 'connecting') {
      return { label: 'CONNECTING', tone: 'info' as const };
    }
    if (status === 'accepted') {
      return { label: 'ACCEPTED', tone: 'success' as const };
    }
    return { label: 'CONNECTING', tone: 'info' as const };
  }, [mediaStatus, status]);

  const remotePlaceholder = useMemo(() => {
    if (status === 'pending') {
      return 'INTERPRETER NOTIFIED. VIDEO START AFTER ACCEPTANCE.';
    }
    if (status === 'accepted' || mediaStatus === 'requesting' || mediaStatus === 'preparing') {
      return 'INTERPRETER ACCEPTED. PREPARE CAMERA AND MICROPHONE.';
    }
    if (mediaStatus === 'ready' || mediaStatus === 'connecting') {
      return 'CAMERA PREVIEW READY. WAIT INTERPRETER VIDEO...';
    }
    if (status === 'ended') {
      return 'VIDEO SESSION ENDED. RETURN PREVIOUS SCREEN.';
    }
    if (status === 'error' && mediaStatus === 'idle') {
      return 'CALL SERVER NOT REACHABLE. CHECK CONNECTION. START NEW CALL.';
    }
    if (status === 'error' || mediaStatus === 'error') {
      return 'CALL OPEN. VIDEO STREAM FAILED. RETRY MEDIA OR END CALL.';
    }
    if (status === 'unavailable') {
      return 'INTERPRETER VIDEO NOT AVAILABLE NOW.';
    }
    return 'SECURE INTERPRETER VIDEO APPEAR HERE WHEN READY.';
  }, [mediaStatus, status]);

  const localPlaceholder = useMemo(() => {
    if (!isCameraEnabled) {
      return 'CAMERA OFF.';
    }
    if (mediaStatus === 'requesting') {
      return 'REQUEST PERMISSION...';
    }
    if (mediaStatus === 'preparing') {
      return 'START CAMERA PREVIEW...';
    }
    if (mediaStatus === 'error') {
      return 'CAMERA PREVIEW FAILED. RETRY MEDIA.';
    }
    return 'CAMERA PREVIEW APPEAR HERE.';
  }, [isCameraEnabled, mediaStatus]);

  const canToggleMedia = Boolean(localStreamRef.current) && status !== 'ended' && status !== 'unavailable';
  const canRetryMedia =
    Boolean(callIdRef.current) &&
    wsRef.current?.readyState === WebSocket.OPEN &&
    status !== 'ended' &&
    status !== 'unavailable' &&
    status !== 'pending' && status !== 'connecting' && status !== 'booting' &&
    mediaStatus !== 'requesting' && mediaStatus !== 'preparing' && !isRetryingMedia;

  function handleToggleMicrophone() {
    if (!localStreamRef.current) {
      return;
    }

    const nextEnabled = !isMicrophoneEnabled;
    applyTrackEnabled('audio', nextEnabled);
    setIsMicrophoneEnabled(nextEnabled);
  }

  function handleToggleCamera() {
    if (!localStreamRef.current) {
      return;
    }

    const nextEnabled = !isCameraEnabled;
    applyTrackEnabled('video', nextEnabled);
    setIsCameraEnabled(nextEnabled);
  }

  async function handleRetryMedia() {
    const currentCallId = callIdRef.current;
    const socket = wsRef.current;
    if (!canRetryMedia || mediaPendingRef.current || !currentCallId || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    setIsRetryingMedia(true);
    setMediaStatus('requesting');
    setMediaMessage('RETRY CAMERA AND MICROPHONE SETUP...');

    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStreamUrl(null);

    try {
      await ensureLocalMedia(currentCallId, socket);
      if (statusRef.current === 'error') {
        updateStatus('accepted', 'MEDIA RETRY. WAIT INTERPRETER VIDEO...');
      }
    } catch {
      if (callIdRef.current !== currentCallId) return;
      setMediaStatus('error');
      setMediaMessage('CANNOT RESTART CAMERA AND MICROPHONE. CHECK PERMISSION.');
    } finally {
      setIsRetryingMedia(false);
    }
  }

  function handleEndCall() {
    if (callId && wsRef.current?.readyState === WebSocket.OPEN) {
      sendCallServerMessage(wsRef.current, {
        type: 'CALL_ENDED',
        payload: { callId, reason: 'guest_cancelled' },
      });
    }
    cleanupMediaSession();
    callIdRef.current = null;
    wsRef.current?.close();
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, {
        paddingBottom: Math.max(insets.bottom, 20),
        paddingLeft: Math.max(insets.left, 16),
        paddingRight: Math.max(insets.right, 16),
      }]}>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.eyebrow, { color: mutedColor }]}>ASL INTERPRETER CALL</Text>
          <Text style={[styles.title, { color: textColor }]}>{(guestName || 'GUEST').toUpperCase()} • ROOM {roomNumber || '--'}</Text>
          <Text style={[styles.message, { color: mutedColor }]}>{message}</Text>

          {(status === 'booting' || status === 'connecting') && (
            <ActivityIndicator size="large" color={textColor} style={styles.loader} />
          )}

          <GuestCallVideoStage
            sideBySide={sideBySide}
            localPlaceholder={localPlaceholder}
            localStreamUrl={localStreamUrl}
            mediaMessage={mediaMessage}
            mediaStatusLabel={mediaStatus}
            phaseLabel={phaseDetails.label}
            phaseTone={phaseDetails.tone}
            remotePlaceholder={remotePlaceholder}
            remoteStreamUrl={remoteStreamUrl}
            showLocalVideo={Boolean(localStreamUrl) && isCameraEnabled}
          />


        </View>
      </ScrollView>
      <View style={[styles.controlsPanel, { backgroundColor: cardColor, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <GuestCallControls
            horizontal={sideBySide}
            canRetryMedia={canRetryMedia}
            canToggleMedia={canToggleMedia}
            isCameraEnabled={isCameraEnabled}
            isMicrophoneEnabled={isMicrophoneEnabled}
            isRetryingMedia={isRetryingMedia}
            onEndCall={handleEndCall}
            onRetryMedia={() => {
              void handleRetryMedia();
            }}
            onToggleCamera={handleToggleCamera}
            onToggleMicrophone={handleToggleMicrophone}
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  controlsPanel: {
    padding: 16,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    gap: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  loader: {
    marginTop: 8,
  },
});
