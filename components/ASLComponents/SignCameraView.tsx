import { requireNativeViewManager } from 'expo-modules-core';
import { View, Text, StyleSheet } from 'react-native';

type LandmarkEvent = { nativeEvent: { landmarks: number[] | null; detectedHands?: string[] } };
type Props = { hand: 'right' | 'left'; onLandmarks: (landmarks: number[] | null, detectedHands?: string[]) => void; onError?: (message: string) => void };

let NativeSignCamera: React.ComponentType<any> | null = null;
try {
  NativeSignCamera = requireNativeViewManager('ExpoSignCamera');
} catch {
  // Expo Go and web do not bundle the development-build camera module.
}

export function SignCameraView({ hand, onLandmarks, onError }: Props) {
  if (!NativeSignCamera) {
    return <View style={styles.unavailable}><Text style={styles.text}>SIGN CAMERA UNAVAILABLE. INSTALL DEVELOPMENT BUILD.</Text></View>;
  }
  return <NativeSignCamera style={styles.camera} hand={hand}
    onLandmarks={({ nativeEvent }: LandmarkEvent) => onLandmarks(nativeEvent.landmarks?.length === 63 ? nativeEvent.landmarks : null, nativeEvent.detectedHands)}
    onCameraError={({ nativeEvent }: { nativeEvent: { message: string } }) => onError?.(nativeEvent.message)} />;
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  unavailable: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', padding: 20 },
  text: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
