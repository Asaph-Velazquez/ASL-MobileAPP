import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { requestCallSession } from '@/services/call';

type CallStatus = 'booting' | 'connecting' | 'pending' | 'active' | 'unavailable' | 'ended' | 'error';

export default function CallScreen() {
  const { token, guestName, roomNumber } = useAuth();
  const [status, setStatus] = useState<CallStatus>('booting');
  const [message, setMessage] = useState('Preparing interpreter session...');
  const [callId, setCallId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Guest session is not available.');
      return;
    }

    let disposed = false;

    const boot = async () => {
      try {
        setStatus('connecting');
        const session = await requestCallSession(token);
        if (disposed) return;
        setCallId(session.callId);
        setMessage('Connecting to interpreter call server...');

        const socket = new WebSocket(`${session.callServerUrl}?token=${encodeURIComponent(session.callToken)}`);
        wsRef.current = socket;

        socket.onopen = () => {
          socket.send(JSON.stringify({ type: 'CALL_REQUEST', payload: { callId: session.callId } }));
        };

        socket.onmessage = (event) => {
          try {
            const incoming = JSON.parse(event.data);
            switch (incoming.type) {
              case 'CALL_PENDING':
                setStatus('pending');
                setMessage('Interpreter has been notified. Waiting for acceptance...');
                break;
              case 'CALL_ACCEPTED':
                setStatus('active');
                setMessage(`Interpreter ${incoming.payload?.interpreterName || ''} is now connected.`.trim());
                break;
              case 'CALL_REJECTED':
                setStatus('unavailable');
                setMessage('The interpreter rejected the call. Please try again later.');
                break;
              case 'CALL_UNAVAILABLE':
                setStatus('unavailable');
                setMessage('No interpreter is available at the moment.');
                break;
              case 'CALL_ENDED':
                setStatus('ended');
                setMessage('The call has ended. Hotel follow-up will continue from ASL-Web if needed.');
                break;
              default:
                break;
            }
          } catch (_error) {
          }
        };

        socket.onerror = () => {
          setStatus('error');
          setMessage('Unable to connect to the call server.');
        };

        socket.onclose = () => {
          if (!disposed && status !== 'ended') {
            setStatus((current) => (current === 'active' ? 'ended' : current));
          }
        };
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unable to start call');
      }
    };

    boot();

    return () => {
      disposed = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token]);

  const accentColor = useMemo(() => {
    switch (status) {
      case 'active':
        return '#0f766e';
      case 'pending':
      case 'connecting':
        return '#2563eb';
      case 'unavailable':
      case 'error':
        return '#dc2626';
      default:
        return '#334155';
    }
  }, [status]);

  function handleEndCall() {
    if (callId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CALL_ENDED', payload: { callId, reason: 'guest_cancelled' } }));
    }
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: accentColor }]}> 
        <Text style={styles.eyebrow}>ASL Interpreter Call</Text>
        <Text style={styles.title}>{guestName || 'Guest'} • Room {roomNumber || '--'}</Text>
        <Text style={styles.message}>{message}</Text>

        {(status === 'booting' || status === 'connecting') && (
          <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Current implementation</Text>
          <Text style={styles.noteText}>This screen already requests a real call session, connects to ASL-CallAPP, and handles call acceptance/end states. Live media rendering can be layered on top of this signaling flow.</Text>
        </View>

        <Pressable style={[styles.button, { backgroundColor: accentColor }]} onPress={handleEndCall}>
          <Text style={styles.buttonText}>{status === 'active' ? 'End Call' : 'Back'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe6',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    gap: 18,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  loader: {
    marginTop: 8,
  },
  noteBox: {
    backgroundColor: '#f1e7d4',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
