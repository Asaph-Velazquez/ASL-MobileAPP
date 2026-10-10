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
  const [, setCallId] = useState<string | null>(null);
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
  const retryCallRef = useRef<(() => void) | null>(null);
  const stopCallRetryRef = useRef<(() => void) | null>(null);
  const mediaRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRetryBusyRef = useRef(false);

  function clearMediaRetryTimer() {
    if (mediaRetryTimerRef.current) clearTimeout(mediaRetryTimerRef.current);
    mediaRetryTimerRef.current = null;
  }

  function scheduleMediaRetry() {
    if (mediaRetryTimerRef.current || statusRef.current === 'ended') return;
    mediaRetryTimerRef.current = setTimeout(() => {
      mediaRetryTimerRef.current = null;
      void handleRetryMedia();
    }, 10000);
  }

  function updateStatus(nextStatus: CallStatus, nextMessage: string) {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    setMessage(nextMessage);
  }

  function cleanupMediaSession() {
    clearMediaRetryTimer();
    mediaRetryBusyRef.current = false;
    mediaGenerationRef.current += 1;
    mediaPendingRef.current = null;
    pendingIceRef.current = [];
    const previousPeer = peerRef.current;
    peerRef.current = null;
    closePeerConnection(previousPeer);

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
        if (peerRef.current !== peer) return;
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
        if (peerRef.current !== peer) return;
        switch (connectionState) {
          case 'connecting':
            setMediaStatus('connecting');
            setMediaMessage('SECURE MEDIA CONNECTION IN PROGRESS...');
            break;
          case 'connected':
            clearMediaRetryTimer();
            setMediaStatus('connected');
            setMediaMessage('SECURE VIDEO CALL ACTIVE.');
            if (statusRef.current === 'accepted' || statusRef.current === 'connecting') {
              updateStatus('connected', 'INTERPRETER VIDEO AND AUDIO CONNECTED.');
            }
            break;
          case 'failed':
          case 'closed':
            setMediaStatus('error');
            setMediaMessage('MEDIA CONNECTION FAILED. RETRY IN 10 SECONDS.');
            if (statusRef.current !== 'ended' && statusRef.current !== 'unavailable') {
              updateStatus('error', 'CALL OPEN. MEDIA CONNECTION FAILED.');
              scheduleMediaRetry();
            }
            break;
          case 'disconnected':
            setMediaStatus('connecting');
            setMediaMessage('MEDIA DISCONNECTED. WAIT RECONNECT...');
            if (statusRef.current === 'connected') {
              updateStatus('accepted', 'INTERPRETER STILL CONNECTED. RECONNECT MEDIA...');
            }
            scheduleMediaRetry();
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
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let booting = false;
    let sessionController: AbortController | null = null;
    const isCurrentSocket = (socket: WebSocket) => !disposed && wsRef.current === socket;
    const clearRetryTimer = () => {
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const clearConnectionTimer = () => {
      if (connectionTimer) clearTimeout(connectionTimer);
      connectionTimer = undefined;
    };

    const scheduleRetry = () => {
      if (disposed || retryTimer || statusRef.current === 'ended') return;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        retryCallRef.current?.();
      }, 10000);
    };

    const requestInterpreter = (socket: WebSocket) => {
      if (!isCurrentSocket(socket) || !callIdRef.current) return;
      clearConnectionTimer();
      sendCallServerMessage(socket, { type: 'CALL_REQUEST', payload: { callId: callIdRef.current } });
      connectionTimer = setTimeout(() => {
        if (!isCurrentSocket(socket)) return;
        updateStatus('error', 'CALL SERVER NO RESPONSE. RETRY IN 10 SECONDS.');
        socket.close();
        scheduleRetry();
      }, 15000);
    };

    const releaseSocket = () => {
      const socket = wsRef.current;
      wsRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
    stopCallRetryRef.current = () => {
      sessionController?.abort();
      clearRetryTimer();
      clearConnectionTimer();
      retryCallRef.current = null;
    };

    const boot = async () => {
      if (disposed || booting) return;
      booting = true;
      clearRetryTimer();
      clearConnectionTimer();
      releaseSocket();
      callIdRef.current = null;
      setCallId(null);
      cleanupMediaSession();
      signalingQueue = Promise.resolve();
      try {
        updateStatus('connecting', 'REQUEST INTERPRETER CALL...');
        sessionController = new AbortController();
        const session = await requestCallSession(token, sessionController.signal);
        if (disposed || statusRef.current === 'ended') return;
        setCallId(session.callId);
        callIdRef.current = session.callId;
        setMessage('CONNECT TO INTERPRETER CALL SERVER...');

        const socket = new WebSocket(buildCallSocketUrl(session.callServerUrl, session.callToken));
        wsRef.current = socket;

        connectionTimer = setTimeout(() => {
          if (!isCurrentSocket(socket)) return;
          updateStatus('error', 'CALL SERVER NO RESPONSE. RETRY IN 10 SECONDS.');
          socket.close();
          scheduleRetry();
        }, 15000);

        socket.onopen = () => {
          if (!isCurrentSocket(socket)) return;
          setMessage('CALL SERVER CONNECTED. FIND INTERPRETER...');
          requestInterpreter(socket);
        };

        socket.onmessage = (event) => {
          if (!isCurrentSocket(socket)) return;
          const incoming = parseCallServerMessage(String(event.data));
          if (!incoming) {
            return;
          }
          if (incoming.payload?.callId && incoming.payload.callId !== callIdRef.current) return;
          if (['CALL_PENDING', 'CALL_ACCEPTED', 'CALL_UNAVAILABLE', 'CALL_REJECTED', 'CALL_ENDED', 'CALL_ERROR'].includes(incoming.type)) {
            clearConnectionTimer();
          }

          const generation = mediaGenerationRef.current;
          const processMessage = async () => {
            try {
              if (!isCurrentSocket(socket) || generation !== mediaGenerationRef.current) return;
              switch (incoming.type) {
                case 'CALL_PENDING':
                  clearRetryTimer();
                  updateStatus('pending', 'INTERPRETER NOTIFIED. WAIT ACCEPTANCE...');
                  break;
                case 'CALL_ACCEPTED':
                  clearRetryTimer();
                  updateStatus(
                    'accepted',
                    `INTERPRETER ${incoming.payload?.interpreterName || ''} ACCEPTED. START MEDIA...`.trim().toUpperCase(),
                  );
                  await ensureLocalMedia(session.callId, socket);
                  break;
                case 'CALL_REJECTED':
                  cleanupMediaSession();
                  updateStatus('unavailable', 'INTERPRETER DECLINED. SEARCH AGAIN IN 10 SECONDS.');
                  scheduleRetry();
                  break;
                case 'CALL_UNAVAILABLE':
                  cleanupMediaSession();
                  updateStatus('unavailable', 'INTERPRETER NOT AVAILABLE. SEARCH AGAIN EVERY 10 SECONDS.');
                  scheduleRetry();
                  break;
                case 'CALL_ENDED':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  if (incoming.payload?.endReason === 'network_error' || incoming.payload?.reason === 'network_error') {
                    updateStatus('error', 'CALL CONNECTION LOST. RECONNECT IN 10 SECONDS.');
                    scheduleRetry();
                  } else {
                    clearRetryTimer();
                    updateStatus('ended', 'CALL ENDED. HOTEL STAFF FOLLOW-UP IF NEEDED.');
                  }
                  break;
                case 'CALL_ERROR':
                  callIdRef.current = null;
                  cleanupMediaSession();
                  updateStatus('error', 'CALL SERVER REQUEST FAILED. RETRY IN 10 SECONDS.');
                  scheduleRetry();
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
          if (!isCurrentSocket(socket)) return;
          clearConnectionTimer();
          updateStatus('error', 'CALL CONNECTION FAILED. RECONNECT IN 10 SECONDS.');
          socket.close();
          scheduleRetry();
        };

        socket.onclose = () => {
          if (!isCurrentSocket(socket)) return;
          clearConnectionTimer();
          if (!disposed && statusRef.current !== 'ended') {
            callIdRef.current = null;
            cleanupMediaSession();
            updateStatus('error', 'CALL CONNECTION LOST. RECONNECT IN 10 SECONDS.');
            scheduleRetry();
          }
        };
      } catch (error) {
        if (disposed || statusRef.current === 'ended') return;
        const httpStatus = (error as { status?: number }).status;
        if (httpStatus === 401 || httpStatus === 403) {
          updateStatus('error', 'GUEST SESSION EXPIRED. SIGN IN AGAIN.');
          retryCallRef.current = null;
        } else {
          updateStatus('error', 'CANNOT START CALL. CHECK CONNECTION. RETRY IN 10 SECONDS.');
          scheduleRetry();
        }
      } finally {
        booting = false;
      }
    };

    retryCallRef.current = () => {
      if (disposed || booting || statusRef.current === 'ended') return;
      clearRetryTimer();
      const socket = wsRef.current;
      if (statusRef.current === 'unavailable' && socket?.readyState === WebSocket.OPEN && callIdRef.current) {
        updateStatus('connecting', 'SEARCH AVAILABLE INTERPRETER...');
        requestInterpreter(socket);
      } else {
        void boot();
      }
    };

    boot();

    return () => {
      disposed = true;
      sessionController?.abort();
      stopCallRetryRef.current = null;
      retryCallRef.current = null;
      clearRetryTimer();
      clearConnectionTimer();
      releaseSocket();
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
      return { label: 'WAITING', tone: 'info' as const };
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
      return 'CALL CONNECTION LOST. AUTOMATIC RETRY IN 10 SECONDS.';
    }
    if (status === 'error' || mediaStatus === 'error') {
      return 'CALL OPEN. VIDEO STREAM FAILED. RETRY MEDIA OR END CALL.';
    }
    if (status === 'unavailable') {
      return 'WAIT INTERPRETER. SEARCH AGAIN EVERY 10 SECONDS.';
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
    if (mediaRetryBusyRef.current || mediaPendingRef.current || !currentCallId || !socket || socket.readyState !== WebSocket.OPEN ||
        !['accepted', 'connected', 'error'].includes(statusRef.current)) {
      return;
    }

    clearMediaRetryTimer();
    mediaRetryBusyRef.current = true;
    setIsRetryingMedia(true);
    setMediaStatus('requesting');
    setMediaMessage('RETRY CAMERA AND MICROPHONE SETUP...');

    const generation = mediaGenerationRef.current;
    const isCurrent = () => generation === mediaGenerationRef.current && callIdRef.current === currentCallId && socket === wsRef.current;
    try {
      const previousPeer = peerRef.current;
      if (previousPeer?.connectionState === 'failed' || previousPeer?.connectionState === 'closed') {
        peerRef.current = null;
        pendingIceRef.current = [];
        closePeerConnection(previousPeer);
        stopStream(remoteStreamRef.current);
        remoteStreamRef.current = null;
        setRemoteStreamUrl(null);
      }
      const stream = await ensureLocalMedia(currentCallId, socket);
      if (!isCurrent()) return;
      const peer = await ensurePeerSession(currentCallId, socket);
      await attachLocalStream(peer, stream);
      const offer = await peer.createOffer({ iceRestart: true });
      if (!isCurrent()) return;
      await peer.setLocalDescription(offer);
      if (!isCurrent()) return;
      const sdp = serializeSessionDescription(peer.localDescription);
      if (!sdp || !sendCallServerMessage(socket, { type: 'WEBRTC_OFFER', payload: { callId: currentCallId, sdp } })) {
        throw new Error('MEDIA RECONNECT OFFER NOT SENT');
      }
      setMediaStatus('connecting');
      updateStatus('accepted', 'RECONNECT MEDIA. WAIT INTERPRETER VIDEO...');
      scheduleMediaRetry();
    } catch {
      if (!isCurrent()) return;
      setMediaStatus('error');
      setMediaMessage('CANNOT RECONNECT MEDIA. CHECK PERMISSION AND CONNECTION. RETRY.');
    } finally {
      if (isCurrent()) {
        mediaRetryBusyRef.current = false;
        setIsRetryingMedia(false);
      }
    }
  }

  function handleEndCall() {
    updateStatus('ended', 'CALL ENDED.');
    stopCallRetryRef.current?.();
    const currentCallId = callIdRef.current;
    if (currentCallId && wsRef.current?.readyState === WebSocket.OPEN) {
      sendCallServerMessage(wsRef.current, {
        type: 'CALL_ENDED',
        payload: { callId: currentCallId, reason: 'guest_cancelled' },
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

          {(status === 'booting' || status === 'connecting' || status === 'unavailable') && (
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
            canRetryMedia={canRetryMedia || ((status === 'error' || status === 'unavailable') && Boolean(retryCallRef.current))}
            retryLabel={status === 'unavailable' ? 'SEARCH NOW' : status === 'error' && mediaStatus === 'idle' ? 'RECONNECT' : 'RETRY MEDIA'}
            canToggleMedia={canToggleMedia}
            isCameraEnabled={isCameraEnabled}
            isMicrophoneEnabled={isMicrophoneEnabled}
            isRetryingMedia={isRetryingMedia}
            onEndCall={handleEndCall}
            onRetryMedia={() => {
              if (status === 'unavailable' || (status === 'error' && (!callIdRef.current || wsRef.current?.readyState !== WebSocket.OPEN))) {
                retryCallRef.current?.();
              } else {
                void handleRetryMedia();
              }
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
