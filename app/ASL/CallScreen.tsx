import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const { token, guestName, roomNumber } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<CallStatus>('booting');
  const [message, setMessage] = useState('Preparing interpreter session...');
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [mediaMessage, setMediaMessage] = useState('Camera and microphone will start when the interpreter accepts the call.');
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

  function updateStatus(nextStatus: CallStatus, nextMessage: string) {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    setMessage(nextMessage);
  }

  function cleanupMediaSession() {
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
    setMediaMessage('Camera and microphone will start when the interpreter accepts the call.');
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
        setRemoteStreamUrl(stream.toURL());
        setMediaStatus('connected');
        setMediaMessage('Interpreter video is connected.');
        if (statusRef.current === 'accepted' || statusRef.current === 'connecting') {
          updateStatus('connected', 'Interpreter video and audio are now connected.');
        }
      },
      onConnectionStateChange: (connectionState) => {
        switch (connectionState) {
          case 'connecting':
            setMediaStatus('connecting');
            setMediaMessage('Negotiating secure media connection...');
            break;
          case 'connected':
            setMediaStatus('connected');
            setMediaMessage('Secure video call is active.');
            if (statusRef.current === 'accepted' || statusRef.current === 'connecting') {
              updateStatus('connected', 'Interpreter video and audio are now connected.');
            }
            break;
          case 'failed':
          case 'closed':
            setMediaStatus('error');
            setMediaMessage('The media connection failed. End the call and try again.');
            if (statusRef.current !== 'ended' && statusRef.current !== 'unavailable') {
              updateStatus('error', 'The call is still open, but the media connection failed.');
            }
            break;
          case 'disconnected':
            setMediaStatus('connecting');
            setMediaMessage('Media disconnected. Waiting for reconnection...');
            if (statusRef.current === 'connected') {
              updateStatus('accepted', 'Interpreter stayed on the call. Reconnecting media...');
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

  async function ensureLocalMedia(currentCallId: string, socket: WebSocket) {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    setMediaStatus('requesting');
    setMediaMessage('Requesting camera and microphone permissions...');
    const permissionResult = await requestCallMediaPermissions();
    if (!permissionResult.granted) {
      setMediaStatus('error');
      setMediaMessage(permissionResult.errorMessage || 'Permissions are required to continue.');
      throw new Error(permissionResult.errorMessage || 'Media permissions denied');
    }

    setMediaStatus('preparing');
    setMediaMessage('Starting local camera and microphone...');
    const stream = await createLocalMediaStream();
    const peer = await ensurePeerSession(currentCallId, socket);

    localStreamRef.current = stream;
    applyTrackEnabled('audio', isMicrophoneEnabled);
    applyTrackEnabled('video', isCameraEnabled);
    setLocalStreamUrl(stream.toURL());
    await attachLocalStream(peer, stream);
    setMediaStatus('ready');
    setMediaMessage('Local camera preview is ready. Waiting for interpreter media...');

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
        setMediaMessage('Interpreter offer accepted. Finalizing media connection...');
        break;
      }
      case 'WEBRTC_ANSWER': {
        const description = currentMessage.payload?.sdp;
        if (!description) {
          return;
        }

        await applyRemoteDescription(peer, description);
        setMediaStatus('connecting');
        setMediaMessage('Interpreter answered. Finalizing media connection...');
        break;
      }
      case 'WEBRTC_ICE_CANDIDATE': {
        const candidate = currentMessage.payload?.candidate;
        if (!candidate) {
          return;
        }

        await applyIceCandidate(peer, candidate);
        break;
      }
      default:
        break;
    }
  }

  useEffect(() => {
    if (!token) {
      updateStatus('error', 'Guest session is not available.');
      return;
    }

    let disposed = false;

    const boot = async () => {
      try {
        updateStatus('connecting', 'Requesting interpreter call session...');
        const session = await requestCallSession(token);
        if (disposed) return;
        setCallId(session.callId);
        callIdRef.current = session.callId;
        setMessage('Connecting to interpreter call server...');

        const socket = new WebSocket(buildCallSocketUrl(session.callServerUrl, session.callToken));
        wsRef.current = socket;

        socket.onopen = () => {
          sendCallServerMessage(socket, {
            type: 'CALL_REQUEST',
            payload: { callId: session.callId },
          });
        };

        socket.onmessage = (event) => {
          const incoming = parseCallServerMessage(String(event.data));
          if (!incoming) {
            return;
          }

          void (async () => {
            try {
              switch (incoming.type) {
                case 'CALL_PENDING':
                  updateStatus('pending', 'Interpreter has been notified. Waiting for acceptance...');
                  break;
                case 'CALL_ACCEPTED':
                  updateStatus(
                    'accepted',
                    `Interpreter ${incoming.payload?.interpreterName || ''} accepted the call. Starting your media...`.trim(),
                  );
                  await ensureLocalMedia(session.callId, socket);
                  break;
                case 'CALL_REJECTED':
                  cleanupMediaSession();
                  updateStatus('unavailable', 'The interpreter rejected the call. Please try again later.');
                  break;
                case 'CALL_UNAVAILABLE':
                  cleanupMediaSession();
                  updateStatus('unavailable', 'No interpreter is available at the moment.');
                  break;
                case 'CALL_ENDED':
                  cleanupMediaSession();
                  updateStatus('ended', 'The call has ended. Hotel follow-up will continue from ASL-Web if needed.');
                  break;
                case 'WEBRTC_OFFER':
                case 'WEBRTC_ANSWER':
                case 'WEBRTC_ICE_CANDIDATE':
                  await handleSignalingMessage(incoming, socket);
                  break;
                default:
                  break;
              }
            } catch (error) {
              setMediaStatus('error');
              setMediaMessage(error instanceof Error ? error.message : 'Unable to initialize guest media.');
              updateStatus('error', 'The call signaling failed while starting media.');
            }
          })();
        };

        socket.onerror = () => {
          updateStatus('error', 'Unable to connect to the call server.');
        };

        socket.onclose = () => {
          if (!disposed && statusRef.current !== 'ended') {
            cleanupMediaSession();
            if (
              statusRef.current === 'connected' ||
              statusRef.current === 'accepted' ||
              statusRef.current === 'pending' ||
              statusRef.current === 'connecting'
            ) {
              updateStatus('ended', 'The call server closed the session.');
            }
          }
        };
      } catch (error) {
        updateStatus('error', error instanceof Error ? error.message : 'Unable to start call');
      }
    };

    boot();

    return () => {
      disposed = true;
      wsRef.current?.close();
      wsRef.current = null;
      callIdRef.current = null;
      setCallId(null);
      cleanupMediaSession();
    };
  // Este efecto mantiene una sesión por token; los manejadores consultan el
  // estado actual en referencias y no deben recrear una llamada durante un render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const phaseDetails = useMemo(() => {
    if (status === 'error') {
      return { label: 'Error', tone: 'danger' as const };
    }
    if (status === 'ended') {
      return { label: 'Ended', tone: 'neutral' as const };
    }
    if (status === 'unavailable') {
      return { label: 'Unavailable', tone: 'danger' as const };
    }
    if (status === 'pending') {
      return { label: 'Pending', tone: 'info' as const };
    }
    if (mediaStatus === 'connected' || status === 'connected') {
      return { label: 'Connected', tone: 'success' as const };
    }
    if (mediaStatus === 'connecting') {
      return { label: 'Connecting', tone: 'info' as const };
    }
    if (status === 'accepted') {
      return { label: 'Accepted', tone: 'success' as const };
    }
    return { label: 'Connecting', tone: 'info' as const };
  }, [mediaStatus, status]);

  const remotePlaceholder = useMemo(() => {
    if (status === 'pending') {
      return 'Your interpreter has been notified. Remote video will appear once the call is accepted.';
    }
    if (status === 'accepted' || mediaStatus === 'requesting' || mediaStatus === 'preparing') {
      return 'The interpreter accepted the call. We are preparing your camera and microphone.';
    }
    if (mediaStatus === 'ready' || mediaStatus === 'connecting') {
      return 'Your local preview is ready. Waiting for the interpreter stream to finish connecting.';
    }
    if (status === 'ended') {
      return 'The video session ended. You can return to the previous screen.';
    }
    if (status === 'error' || mediaStatus === 'error') {
      return 'The call is open, but the video stream could not be established. Retry media or end the call.';
    }
    if (status === 'unavailable') {
      return 'No interpreter video is available for this session right now.';
    }
    return 'Video will appear here when the secure interpreter stream is ready.';
  }, [mediaStatus, status]);

  const localPlaceholder = useMemo(() => {
    if (!isCameraEnabled) {
      return 'Your camera is turned off.';
    }
    if (mediaStatus === 'requesting') {
      return 'Requesting permission...';
    }
    if (mediaStatus === 'preparing') {
      return 'Starting your local preview...';
    }
    if (mediaStatus === 'error') {
      return 'Unable to start your preview. Use Retry media to try again.';
    }
    return 'Your local camera preview will appear here.';
  }, [isCameraEnabled, mediaStatus]);

  const canToggleMedia = Boolean(localStreamRef.current) && status !== 'ended' && status !== 'unavailable';
  const canRetryMedia =
    Boolean(callIdRef.current) &&
    wsRef.current?.readyState === WebSocket.OPEN &&
    status !== 'ended' &&
    status !== 'unavailable';

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
    if (!currentCallId || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    setIsRetryingMedia(true);
    setMediaStatus('requesting');
    setMediaMessage('Retrying camera and microphone setup...');

    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStreamUrl(null);

    try {
      await ensureLocalMedia(currentCallId, socket);
      if (statusRef.current === 'error') {
        updateStatus('accepted', 'Media is retrying. Waiting for the interpreter stream...');
      }
    } catch (error) {
      setMediaStatus('error');
      setMediaMessage(error instanceof Error ? error.message : 'Unable to restart local media.');
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
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.eyebrow, { color: mutedColor }]}>ASL Interpreter Call</Text>
          <Text style={[styles.title, { color: textColor }]}>{guestName || 'Guest'} • Room {roomNumber || '--'}</Text>
          <Text style={[styles.message, { color: mutedColor }]}>{message}</Text>

          {(status === 'booting' || status === 'connecting') && (
            <ActivityIndicator size="large" color={textColor} style={styles.loader} />
          )}

          <GuestCallVideoStage
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
    maxWidth: 760,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    width: '100%',
    maxWidth: 760,
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
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  loader: {
    marginTop: 8,
  },
});
