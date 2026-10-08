import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { appendRecognizedSign, MIN_SIGN_CONFIDENCE, predictSign } from '@/services/aslRecognition';
import { SignSequenceCollector } from '@/services/signSequence';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { SignCameraView } from './SignCameraView';
import { ASLVideoPreview } from './ASLVideoPreview';
import type { ASLOption } from './ASLGridView';

interface SignCaptureRequestDetails {
    sourceMode: 'asl';
    generatedFromSignCapture: true;
}

type CaptureState = 'starting' | 'noFrames' | 'removeHand' | 'recording' | 'wrongHand' | 'noHand';
type ProcessingState = 'session' | 'processing' | 'short' | 'camera' | 'connection' | 'busy' | 'timeout' | 'model';
const CAPTURE_MESSAGES: Record<CaptureState | ProcessingState, {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    instruction: string;
    tone: 'info' | 'warning' | 'error' | 'success';
}> = {
    starting: { icon: 'camera', title: 'CAMERA STARTING', instruction: 'HAND READY. WAIT.', tone: 'info' },
    noFrames: { icon: 'camera-off', title: 'CAMERA NO IMAGE', instruction: 'CAMERA CLOSE. REOPEN.', tone: 'error' },
    removeHand: { icon: 'hand-wave', title: 'NEXT SIGN', instruction: 'HAND REMOVE. NEXT SIGN.', tone: 'info' },
    recording: { icon: 'hand-back-right', title: 'HAND DETECTED', instruction: 'SIGN SHOW. THEN HAND REMOVE.', tone: 'success' },
    wrongHand: { icon: 'hand-back-left', title: 'OTHER HAND DETECTED', instruction: 'HAND SELECT ABOVE.', tone: 'warning' },
    noHand: { icon: 'hand-back-right-off', title: 'HAND NOT DETECTED', instruction: 'WHOLE HAND SHOW IN CAMERA.', tone: 'warning' },
    session: { icon: 'account-lock', title: 'SESSION EXPIRED', instruction: 'SIGN IN AGAIN.', tone: 'error' },
    processing: { icon: 'sync', title: 'SIGN PROCESSING', instruction: 'WAIT.', tone: 'info' },
    short: { icon: 'timer-outline', title: 'SIGN TOO SHORT', instruction: 'HAND KEEP VISIBLE LONGER.', tone: 'warning' },
    camera: { icon: 'camera-off', title: 'CAMERA UNAVAILABLE', instruction: 'CAMERA PERMISSION CHECK. REOPEN.', tone: 'error' },
    connection: { icon: 'wifi-off', title: 'CONNECTION ERROR', instruction: 'CONNECTION CHECK. SIGN TRY AGAIN.', tone: 'error' },
    busy: { icon: 'timer-sand', title: 'SERVICE BUSY', instruction: 'WAIT. SIGN TRY AGAIN.', tone: 'warning' },
    timeout: { icon: 'timer-off-outline', title: 'RESPONSE TIMEOUT', instruction: 'WAIT. SIGN TRY AGAIN.', tone: 'warning' },
    model: { icon: 'alert-circle-outline', title: 'SIGN PROCESSING FAILED', instruction: 'HOTEL STAFF HELP REQUEST.', tone: 'error' },
};

interface ASLPetitionModalProps {
    visible: boolean;
    onClose: () => void;
    selectedOption: ASLOption | null;
    cameraActive: boolean;
    onActivateCamera: () => void;
    onCloseCamera: () => void;
    cameraText?: string;
    onSend: (description: string, details: SignCaptureRequestDetails) => Promise<boolean>;
    isSending?: boolean;
}

export function ASLPetitionModal({
    visible,
    onClose,
    selectedOption,
    cameraActive,
    onActivateCamera,
    onCloseCamera,
    cameraText = "YOUR MESSAGE SHOW IN SIGN LANGUAGE",
    onSend,
    isSending = false,
}: ASLPetitionModalProps) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const modalVideoWidth = Math.max(Math.min(width - 40, 640) - 32, 0);
    const availableHeight = Math.max(height - Math.max(20, insets.top) - Math.max(20, insets.bottom), 0);
    const modalVideoHeight = Math.min(modalVideoWidth, availableHeight * 0.5, 360);
    const modalHeight = Math.min(availableHeight * 0.9, cameraActive ? 820 : modalVideoHeight + 328);
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const mutedColor = useThemeColor({}, 'muted');
    const secondaryColor = useThemeColor({ light: '#1565C0', dark: '#90CAF9' }, 'text');
    const dangerColor = useThemeColor({ light: '#B3261E', dark: '#FFB4AB' }, 'text');
    const successColor = useThemeColor({ light: '#21864B', dark: '#81C784' }, 'text');
    const warningColor = useThemeColor({ light: '#946200', dark: '#FFD54F' }, 'text');
    const confidenceTrackColor = useThemeColor({ light: '#E3E7EB', dark: '#343A40' }, 'background');
    const { token } = useAuth();
    const [draft, setDraft] = useState('');
    const [hand, setHand] = useState<'right' | 'left'>('right');
    const [status, setStatus] = useState<ProcessingState | null>(null);
    const [frameCount, setFrameCount] = useState(0);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [lastGlosa, setLastGlosa] = useState('');
    const [captureStatus, setCaptureStatus] = useState<CaptureState>('starting');
    const capture = useRef({ lastEventAt: 0, handPresent: false, detectedHands: [] as string[] });
    const sequence = useRef(new SignSequenceCollector());
    const busy = useRef(false);
    const generation = useRef(0);
    const controller = useRef<AbortController | null>(null);

    useEffect(() => {
        capture.current = { lastEventAt: 0, handPresent: false, detectedHands: [] };
        setCaptureStatus('starting');
        setFrameCount(0);
        if (!visible || !cameraActive) return;
        const startedAt = Date.now();
        const interval = setInterval(() => {
            const current = capture.current;
            const progress = sequence.current.getSnapshot();
            if (!current.lastEventAt && Date.now() - startedAt < 3000) {
                setCaptureStatus('starting');
            } else if (!current.lastEventAt || Date.now() - current.lastEventAt > 3000) {
                setCaptureStatus('noFrames');
            } else if (progress.waitingForExit) {
                setCaptureStatus('removeHand');
            } else if (current.handPresent) {
                setCaptureStatus('recording');
            } else if (current.detectedHands.length) {
                setCaptureStatus('wrongHand');
            } else {
                setCaptureStatus('noHand');
            }
        }, 250);
        return () => clearInterval(interval);
    }, [visible, cameraActive, hand]);

    useEffect(() => {
        if (visible && cameraActive) return;
        generation.current += 1;
        controller.current?.abort();
        sequence.current.reset();
        busy.current = false;
        setDraft('');
        setFrameCount(0);
        setConfidence(null);
        setLastGlosa('');
        setStatus(null);
    }, [visible, cameraActive]);

    useEffect(() => () => {
        generation.current += 1;
        controller.current?.abort();
    }, []);

    const submitFrames = async (sequence: number[][]) => {
        if (!token) {
            setStatus('session');
            return;
        }
        if (busy.current || sequence.length < 15) return;
        busy.current = true;
        const requestGeneration = generation.current;
        const abort = new AbortController();
        controller.current = abort;
        setStatus('processing');
        try {
            const result = await predictSign(sequence, token, abort.signal);
            if (requestGeneration !== generation.current) return;
            setConfidence(Math.max(0, Math.min(1, result.confidence)));
            setLastGlosa(result.glosa);
            if (result.confidence >= MIN_SIGN_CONFIDENCE) {
                setDraft(current => appendRecognizedSign(current, result));
            }
            setStatus(null);
        } catch (error) {
            if (requestGeneration === generation.current && !abort.signal.aborted) {
                const message = error instanceof Error ? error.message : '';
                setStatus(message.includes('SESSION') ? 'session'
                    : message.includes('TIMED OUT') ? 'timeout'
                    : message.includes('BUSY') ? 'busy'
                    : /ROUTE NOT FOUND|DATA REJECTED|INVALID MODEL|SIGN PROCESSING FAILED/.test(message) ? 'model'
                    : 'connection');
            }
        } finally {
            if (requestGeneration === generation.current) busy.current = false;
        }
    };

    const handleLandmarks = (landmarks: number[] | null, detectedHands: string[] = []) => {
        capture.current = { lastEventAt: Date.now(), handPresent: !!landmarks, detectedHands };
        const previous = sequence.current.getSnapshot();
        if (landmarks && previous.frameCount === 0 && !previous.waitingForExit && !busy.current) {
            setStatus(current => current === 'session' ? current : null);
        }
        const ready = sequence.current.feed(landmarks, Date.now(), busy.current);
        if (!busy.current) {
            const progress = sequence.current.getSnapshot();
            setFrameCount(ready ? ready.length : progress.waitingForExit ? 60 : progress.frameCount);
        }
        if (ready) void submitFrames(ready);
        else if (previous.frameCount > 0 && previous.frameCount < 15 && sequence.current.getSnapshot().frameCount === 0) {
            setStatus('short');
        }
    };

    const handleSend = async () => {
        if (!draft.trim() || isSending) return;
        const sendGeneration = generation.current;
        const success = await onSend(draft.trim(), {
            sourceMode: 'asl',
            generatedFromSignCapture: true,
        });
        if (success && generation.current === sendGeneration) onCloseCamera();
    };

    if (!visible || !selectedOption) return null;

    const confidencePercent = confidence === null ? null : Math.round(confidence * 100);
    const confidenceColor = confidence === null ? mutedColor
        : confidence >= 0.8 ? successColor
        : confidence >= MIN_SIGN_CONFIDENCE ? warningColor : dangerColor;
    const confidenceIcon = confidence === null ? 'help-outline'
        : confidence >= 0.8 ? 'check-circle'
        : confidence >= MIN_SIGN_CONFIDENCE ? 'info-outline' : 'error-outline';
    const hasDraft = !!draft.trim();
    const displayState = !token ? 'session' : status ?? captureStatus;
    const message = CAPTURE_MESSAGES[displayState];
    const messageColor = message.tone === 'error' ? dangerColor : message.tone === 'warning'
        ? warningColor : message.tone === 'success' ? successColor : secondaryColor;
    const handIcon = hand === 'left' ? 'hand-back-left' : 'hand-back-right';

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View
                style={[styles.modalOverlay, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="CLOSE" />
                <View
                    style={[styles.modalContent, { backgroundColor, height: modalHeight }]}
                >
                    {!cameraActive ? (
                        <ScrollView style={styles.instructionScroll} contentContainerStyle={styles.modalInner} nestedScrollEnabled>
                            {/* Header del modal */}
                            <View style={styles.modalHeader}>
                                <View style={[
                                    styles.modalIcon, 
                                    { 
                                        backgroundColor,
                                        borderColor: selectedOption.iconColor,
                                        borderWidth: 2
                                    }
                                ]}>
                                    {selectedOption.iconType === "material" ? (
                                        <MaterialIcons 
                                            name={selectedOption.icon as any} 
                                            size={48} 
                                            color={selectedOption.iconColor} 
                                        />
                                    ) : (
                                        <MaterialCommunityIcons 
                                            name={selectedOption.icon as any} 
                                            size={48} 
                                            color={selectedOption.iconColor} 
                                        />
                                    )}
                                </View>
                            </View>

                            {selectedOption.videoSource !== undefined ? (
                                <View pointerEvents="none" style={[styles.instructionGif, { height: modalVideoHeight }]}>
                                    <ASLVideoPreview
                                        source={selectedOption.videoSource}
                                        style={styles.instructionVideo}
                                    />
                                </View>
                            ) : selectedOption.gifSource ? (
                                <Image
                                    source={selectedOption.gifSource}
                                    style={styles.instructionGif}
                                    resizeMode="contain"
                                />
                            ) : null}
                            {/* Botones */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, { backgroundColor: selectedOption.iconColor }]} 
                                    onPress={onActivateCamera}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="videocam" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={onClose}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="close" size={24} color={textColor} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        <ScrollView style={styles.instructionScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
                            <View style={styles.heading}>
                                <Text style={[styles.cameraText, { color: textColor }]}>{cameraText}</Text>
                                <TouchableOpacity onPress={onCloseCamera}>
                                    <MaterialIcons name="close" size={26} color={textColor} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cameraViewContainer}>
                                <SignCameraView hand={hand} onLandmarks={handleLandmarks} onError={() => setStatus('camera')} />
                            </View>
                            <View style={styles.handSelector}>
                                {(['left', 'right'] as const).map(option => {
                                    const selected = hand === option;
                                    return <TouchableOpacity key={option}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${option.toUpperCase()} HAND`}
                                        accessibilityState={{ selected, disabled: isSending }}
                                        disabled={isSending}
                                        style={[styles.handButton, {
                                            borderColor: selected ? secondaryColor : confidenceTrackColor,
                                            backgroundColor: selected ? `${secondaryColor}18` : backgroundColor,
                                        }]}
                                        onPress={() => {
                                            if (selected) return;
                                            generation.current += 1;
                                            controller.current?.abort();
                                            busy.current = false;
                                            setHand(option);
                                            sequence.current.reset();
                                            setStatus(null);
                                            setFrameCount(0);
                                            setConfidence(null);
                                            setLastGlosa('');
                                        }}>
                                        <MaterialCommunityIcons name={option === 'left' ? 'hand-back-left' : 'hand-back-right'}
                                            size={32} color={selected ? secondaryColor : mutedColor} />
                                        <Text style={[styles.handLabel, { color: selected ? secondaryColor : textColor }]}>
                                            {option.toUpperCase()}
                                        </Text>
                                        {selected && <MaterialIcons name="check-circle" size={18} color={secondaryColor} />}
                                    </TouchableOpacity>;
                                })}
                            </View>
                            <View style={[styles.framePanel, { borderColor: confidenceTrackColor }]}>
                                <View accessible accessibilityRole="progressbar"
                                    accessibilityLabel="SIGN CAPTURE FRAMES"
                                    accessibilityValue={{ min: 0, max: 60, now: frameCount }}
                                    style={styles.frameCircle}>
                                    <Svg width={80} height={80} viewBox="0 0 80 80">
                                        <Circle cx={40} cy={40} r={34} stroke={confidenceTrackColor} strokeWidth={6} fill="none" />
                                        <Circle cx={40} cy={40} r={34}
                                            stroke={frameCount >= 15 ? successColor : secondaryColor}
                                            strokeWidth={6} fill="none" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 34}
                                            strokeDashoffset={2 * Math.PI * 34 * (1 - frameCount / 60)}
                                            rotation={-90} origin="40, 40" />
                                    </Svg>
                                    <View pointerEvents="none" style={styles.frameCircleLabel}>
                                        <Text style={[styles.frameNumber, { color: textColor }]}>{frameCount}</Text>
                                        <Text style={[styles.hint, { color: mutedColor }]}>/ 60</Text>
                                    </View>
                                </View>
                                <View style={styles.frameDescription}>
                                    <Text style={[styles.handLabel, { color: textColor }]}>FRAMES</Text>
                                    <View accessible accessibilityRole={message.tone === 'error' ? 'alert' : 'text'}
                                        accessibilityLiveRegion="polite"
                                        accessibilityLabel={`${message.title}. ${message.instruction}`}
                                        style={[styles.statusCard, { borderColor: messageColor, backgroundColor: `${messageColor}12` }]}>
                                        <View style={[styles.statusIcon, { backgroundColor: `${messageColor}18` }]}>
                                            {displayState === 'processing'
                                                ? <ActivityIndicator color={messageColor} size="small" />
                                                : <MaterialCommunityIcons name={displayState === 'recording' ? handIcon : message.icon}
                                                    size={26} color={messageColor} />}
                                        </View>
                                        <View style={styles.statusCopy}>
                                            <Text style={[styles.statusTitle, { color: messageColor }]}>{message.title}</Text>
                                            <Text style={[styles.hint, { color: textColor }]}>{message.instruction}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.confidencePanel, { borderColor: confidenceTrackColor }]}>
                                <View style={styles.confidenceHeading}>
                                    <MaterialIcons name={confidenceIcon} size={22} color={confidenceColor} />
                                    <Text style={[styles.confidenceLabel, { color: textColor }]}>CONFIDENCE</Text>
                                    {!!lastGlosa && <View style={[styles.glosaChip, { backgroundColor: `${confidenceColor}18` }]}>
                                        <Text style={[styles.glosaLabel, { color: confidenceColor }]}>{lastGlosa}</Text>
                                    </View>}
                                    <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                                        {confidencePercent === null ? '—' : `${confidencePercent}%`}
                                    </Text>
                                </View>
                                <View
                                    accessible accessibilityRole="progressbar"
                                    accessibilityLabel="LAST SIGN CONFIDENCE"
                                    accessibilityValue={confidencePercent === null
                                        ? { text: 'NO PREDICTION YET' }
                                        : { min: 0, max: 100, now: confidencePercent }}
                                    style={[styles.confidenceTrack, { backgroundColor: confidenceTrackColor }]}
                                >
                                    <View style={[styles.confidenceFill, {
                                        width: `${confidencePercent ?? 0}%`, backgroundColor: confidenceColor,
                                    }]} />
                                </View>
                            </View>
                            <TextInput multiline value={draft} onChangeText={setDraft}
                                placeholder="RECOGNIZED SIGNS / EDIT MESSAGE" placeholderTextColor="#888"
                                style={[styles.input, { color: textColor, borderColor: selectedOption.iconColor }]} />
                            <View style={styles.controls}>
                                <TouchableOpacity disabled={!hasDraft || isSending}
                                    accessibilityRole="button" accessibilityLabel="DELETE LAST WORD"
                                    accessibilityHint="REMOVE THE LAST WORD FROM YOUR MESSAGE"
                                    accessibilityState={{ disabled: !hasDraft || isSending }}
                                    style={[styles.editButton, { borderColor: secondaryColor, opacity: !hasDraft || isSending ? 0.4 : 1 }]}
                                    onPress={() => setDraft(current => current.trim().split(/\s+/).slice(0, -1).join(' '))}>
                                    <MaterialIcons name="backspace" size={26} color={secondaryColor} />
                                </TouchableOpacity>
                                <TouchableOpacity disabled={!hasDraft || isSending}
                                    accessibilityRole="button" accessibilityLabel="CLEAR MESSAGE"
                                    accessibilityHint="REMOVE ALL WORDS FROM YOUR MESSAGE"
                                    accessibilityState={{ disabled: !hasDraft || isSending }}
                                    style={[styles.editButton, { borderColor: dangerColor, opacity: !hasDraft || isSending ? 0.4 : 1 }]}
                                    onPress={() => setDraft('')}>
                                    <MaterialIcons name="delete-sweep" size={28} color={dangerColor} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity disabled={!draft.trim() || isSending}
                                accessibilityRole="button" accessibilityLabel={isSending ? 'SENDING REQUEST' : 'SEND REQUEST'}
                                accessibilityState={{ disabled: !hasDraft || isSending, busy: isSending }}
                                style={[styles.actionButton, { backgroundColor: '#21864B', opacity: !draft.trim() || isSending ? 0.5 : 1 }]}
                                onPress={handleSend}>
                                {isSending ? <ActivityIndicator size="small" color="#FFFFFF" />
                                    : <MaterialCommunityIcons name="send" size={30} color="#FFFFFF" />}
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 16,
        width: '100%',
        maxWidth: 640,
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalInner: {
        gap: 20,
    },
    instructionScroll: { flex: 1, minHeight: 0 },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 12,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionGif: {
        width: '100%',
        height: 200,
    },
    instructionVideo: { width: '100%', height: '100%' },
    buttonContainer: {
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        padding: 16,
    },
    cancelButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cameraViewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        height: 260,
    },
    cameraText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    form: { gap: 12 },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    hint: { fontSize: 12, fontWeight: '600' },
    input: { borderWidth: 1, borderRadius: 10, minHeight: 100, textAlignVertical: 'top', padding: 12, fontSize: 16 },
    controls: { flexDirection: 'row', gap: 12 },
    handSelector: { flexDirection: 'row', gap: 12 },
    handButton: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderWidth: 2, borderRadius: 12, minHeight: 60, padding: 10, alignItems: 'center', justifyContent: 'center' },
    handLabel: { fontSize: 12, fontWeight: '700' },
    framePanel: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
    frameCircle: { width: 80, height: 80 },
    frameCircleLabel: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    frameNumber: { fontSize: 22, fontWeight: '700' },
    frameDescription: { flex: 1, gap: 6 },
    statusCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderRadius: 12 },
    statusIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statusCopy: { flex: 1, minWidth: 90, gap: 4 },
    statusTitle: { fontSize: 12, fontWeight: '800' },
    editButton: { flex: 1, minHeight: 52, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    confidencePanel: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
    confidenceHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    confidenceLabel: { fontSize: 12, fontWeight: '700' },
    glosaChip: { flexShrink: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    glosaLabel: { fontSize: 13, fontWeight: '700' },
    confidenceValue: { fontSize: 17, fontWeight: '700' },
    confidenceTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    confidenceFill: { height: '100%', borderRadius: 4 },
});
