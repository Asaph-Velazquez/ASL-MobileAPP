import { Camera } from 'expo-camera';
import { Platform } from 'react-native';
import type {
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

import type {
  WebRtcDescriptionType,
  WebRtcIceCandidatePayload,
  WebRtcSessionDescriptionPayload,
} from '@/services/call';

export type MediaPermissionResult = {
  granted: boolean;
  errorMessage?: string;
};

type GuestPeerHandlers = {
  onIceCandidate: (candidate: WebRtcIceCandidatePayload) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnection['connectionState']) => void;
};

const DEFAULT_ICE_SERVERS: RTCConfiguration['iceServers'] = [{ urls: 'stun:stun.l.google.com:19302' }];

function getWebRtcModule() {
  if (Platform.OS === 'web') {
    throw new Error('WebRTC native media is not available in the web bundle. Use a native Expo dev build.');
  }

  // El módulo nativo no debe cargarse en el paquete web.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-webrtc') as typeof import('react-native-webrtc');
}

export async function requestCallMediaPermissions(): Promise<MediaPermissionResult> {
  const [camera, microphone] = await Promise.all([
    Camera.requestCameraPermissionsAsync(),
    Camera.requestMicrophonePermissionsAsync(),
  ]);

  const granted = camera.granted && microphone.granted;
  if (granted) {
    return { granted: true };
  }

  return {
    granted: false,
    errorMessage: 'Camera and microphone permissions are required to start the video call.',
  };
}

export async function createLocalMediaStream(): Promise<MediaStream> {
  const { mediaDevices } = getWebRtcModule();

  return mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user',
      frameRate: 24,
    },
  });
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
  stream?.release();
}

export function serializeSessionDescription(
  description: RTCSessionDescription | RTCSessionDescriptionInit | null,
): WebRtcSessionDescriptionPayload | null {
  if (!description || !description.type) {
    return null;
  }

  return {
    type: description.type as WebRtcDescriptionType,
    sdp: description.sdp,
  };
}

export function serializeIceCandidate(candidate: RTCIceCandidate): WebRtcIceCandidatePayload {
  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
  };
}

export function createGuestPeerConnection({
  onIceCandidate,
  onRemoteStream,
  onConnectionStateChange,
}: GuestPeerHandlers): RTCPeerConnection {
  const { MediaStream, RTCPeerConnection } = getWebRtcModule();
  const connection = new RTCPeerConnection({
    iceServers: DEFAULT_ICE_SERVERS,
  });
  const remoteStream = new MediaStream();

  connection.ontrack = (event: { streams: MediaStream[]; track: MediaStreamTrack }) => {
    const [stream] = event.streams;
    if (stream) {
      onRemoteStream(stream);
      return;
    }

    event.track && remoteStream.addTrack(event.track);
    onRemoteStream(remoteStream);
  };

  connection.onicecandidate = (event: { candidate: RTCIceCandidate | null }) => {
    if (!event.candidate) {
      return;
    }

    onIceCandidate(serializeIceCandidate(event.candidate));
  };

  connection.onconnectionstatechange = () => {
    onConnectionStateChange(connection.connectionState);
  };
  return connection;
}

export async function attachLocalStream(connection: RTCPeerConnection, stream: MediaStream) {
  const senders = connection.getSenders();

  stream.getTracks().forEach((track) => {
    const sender = senders.find((entry) => entry.track?.kind === track.kind);
    if (sender) {
      void sender.replaceTrack(track);
      return;
    }

    connection.addTrack(track, stream);
  });
}

export async function applyRemoteDescription(
  connection: RTCPeerConnection,
  description: WebRtcSessionDescriptionPayload,
) {
  const { RTCSessionDescription } = getWebRtcModule();

  await connection.setRemoteDescription(
    new RTCSessionDescription({
      type: description.type,
      sdp: description.sdp ?? '',
    }),
  );
}

export async function applyIceCandidate(
  connection: RTCPeerConnection,
  candidate: WebRtcIceCandidatePayload,
) {
  const { RTCIceCandidate } = getWebRtcModule();

  await connection.addIceCandidate(new RTCIceCandidate(candidate));
}

export function closePeerConnection(connection: RTCPeerConnection | null) {
  connection?.close();
}
