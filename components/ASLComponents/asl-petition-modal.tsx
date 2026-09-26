import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { appendRecognizedSign, MIN_SIGN_CONFIDENCE, predictSign } from '@/services/aslRecognition';
import { SignSequenceCollector } from '@/services/signSequence';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SignCameraView } from './SignCameraView';

interface ASLPetitionModalProps {
    visible: boolean;
    onClose: () => void;
    selectedOption: {
        id: string;
        gifSource: any;
        icon: string;
        iconType: 'material' | 'community';
        iconColor: string;
        bgColor: string;
    } | null;
    cameraActive: boolean;
    onActivateCamera: () => void;
    onCloseCamera: () => void;
    cameraText?: string;
    onSend: (description: string) => Promise<boolean>;
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
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const { token } = useAuth();
    const [draft, setDraft] = useState('');
    const [hand, setHand] = useState<'right' | 'left'>('right');
    const [status, setStatus] = useState('');
    const [candidate, setCandidate] = useState('');
    const [captureStatus, setCaptureStatus] = useState('WAITING FOR CAMERA FRAMES...');
    const capture = useRef({ lastEventAt: 0, handPresent: false, detectedHands: [] as string[] });
    const sequence = useRef(new SignSequenceCollector());
    const busy = useRef(false);
    const generation = useRef(0);
    const controller = useRef<AbortController | null>(null);

    useEffect(() => {
        capture.current = { lastEventAt: 0, handPresent: false, detectedHands: [] };
        setCaptureStatus('WAITING FOR CAMERA FRAMES...');
        if (!visible || !cameraActive) return;
        const interval = setInterval(() => {
            const current = capture.current;
            const progress = sequence.current.getSnapshot();
            if (!current.lastEventAt || Date.now() - current.lastEventAt > 3000) {
                setCaptureStatus('NO CAMERA FRAMES. CLOSE AND REOPEN CAMERA.');
            } else if (progress.waitingForExit) {
                setCaptureStatus('REMOVE YOUR HAND BEFORE THE NEXT SIGN');
            } else if (current.handPresent) {
                setCaptureStatus(`${hand.toUpperCase()} HAND DETECTED - ${progress.frameCount}/60 FRAMES (15 MIN)`);
            } else if (current.detectedHands.length) {
                setCaptureStatus(`DETECTED: ${current.detectedHands.join(', ').toUpperCase()}. SELECT THAT HAND OR USE ${hand.toUpperCase()}.`);
            } else {
                setCaptureStatus(`NO ${hand.toUpperCase()} HAND DETECTED. SHOW YOUR WHOLE HAND.`);
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
        setCandidate('');
        setStatus('');
    }, [visible, cameraActive]);

    useEffect(() => () => {
        generation.current += 1;
        controller.current?.abort();
    }, []);

    const submitFrames = async (sequence: number[][]) => {
        if (!token) {
            setStatus('SESSION REQUIRED. SIGN IN AGAIN.');
            return;
        }
        if (busy.current || sequence.length < 15) return;
        busy.current = true;
        const requestGeneration = generation.current;
        const abort = new AbortController();
        controller.current = abort;
        setStatus('PROCESSING SIGN...');
        try {
            const result = await predictSign(sequence, token, abort.signal);
            if (requestGeneration !== generation.current) return;
            const confidence = `${Math.round(result.confidence * 100)}%`;
            if (result.confidence >= MIN_SIGN_CONFIDENCE) {
                setDraft(current => appendRecognizedSign(current, result));
                setCandidate('');
                setStatus(`${result.glosa} - ${confidence}`);
            } else {
                setCandidate(`${result.glosa} - ${confidence}`);
                setStatus('LOW CONFIDENCE. CHECK CANDIDATE.');
            }
        } catch (error) {
            if (requestGeneration === generation.current && !abort.signal.aborted) {
                setStatus(error instanceof Error ? error.message : 'SIGN PROCESSING FAILED');
            }
        } finally {
            if (requestGeneration === generation.current) busy.current = false;
        }
    };

    const handleLandmarks = (landmarks: number[] | null, detectedHands: string[] = []) => {
        capture.current = { lastEventAt: Date.now(), handPresent: !!landmarks, detectedHands };
        const previous = sequence.current.getSnapshot();
        const ready = sequence.current.feed(landmarks, Date.now(), busy.current);
        if (ready) void submitFrames(ready);
        else if (previous.frameCount > 0 && previous.frameCount < 15 && sequence.current.getSnapshot().frameCount === 0) {
            setStatus('SIGN TOO SHORT. KEEP YOUR HAND VISIBLE LONGER.');
        }
    };

    const handleSend = async () => {
        if (!draft.trim() || isSending) return;
        const sendGeneration = generation.current;
        const success = await onSend(draft.trim());
        if (success && generation.current === sendGeneration) onCloseCamera();
    };

    if (!selectedOption) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable 
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <Pressable 
                    style={[styles.modalContent, { backgroundColor: backgroundColor }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {!cameraActive ? (
                        <View style={styles.modalInner}>
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

                            {/* GIF de la petición del servicio seleccionado */}
                            <Image 
                                source={selectedOption.gifSource}
                                style={styles.instructionGif}
                                resizeMode="contain"
                            />
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
                        </View>
                    ) : (
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
                            <View style={styles.heading}>
                                <Text style={[styles.cameraText, { color: textColor }]}>{cameraText}</Text>
                                <TouchableOpacity onPress={onCloseCamera}>
                                    <MaterialIcons name="close" size={26} color={textColor} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cameraViewContainer}>
                                <SignCameraView hand={hand} onLandmarks={handleLandmarks} onError={setStatus} />
                            </View>
                            <TouchableOpacity onPress={() => {
                                generation.current += 1;
                                controller.current?.abort();
                                busy.current = false;
                                setHand(current => current === 'right' ? 'left' : 'right');
                                sequence.current.reset();
                                setStatus('');
                                setCandidate('');
                            }}>
                                <Text style={[styles.hint, { color: textColor }]}>HAND: {hand.toUpperCase()} - TAP TO CHANGE</Text>
                            </TouchableOpacity>
                            <Text style={[styles.hint, { color: textColor }]}>{captureStatus}</Text>
                            {!token && <Text style={[styles.hint, { color: textColor }]}>SESSION REQUIRED. SIGN IN AGAIN.</Text>}
                            <Text style={[styles.hint, { color: textColor }]}>{status || 'SHOW A SIGN, THEN REMOVE YOUR HAND'}</Text>
                            {!!candidate && <Text style={[styles.hint, { color: textColor }]}>CANDIDATE: {candidate}</Text>}
                            <TextInput multiline value={draft} onChangeText={setDraft}
                                placeholder="RECOGNIZED SIGNS / EDIT MESSAGE" placeholderTextColor="#888"
                                style={[styles.input, { color: textColor, borderColor: selectedOption.iconColor }]} />
                            <View style={styles.controls}>
                                <TouchableOpacity onPress={() => setDraft(current => current.trim().split(/\s+/).slice(0, -1).join(' '))}>
                                    <Text style={[styles.hint, { color: textColor }]}>DELETE LAST</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDraft('')}>
                                    <Text style={[styles.hint, { color: textColor }]}>CLEAR</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity disabled={!draft.trim() || isSending}
                                style={[styles.actionButton, { backgroundColor: '#21864B', opacity: !draft.trim() || isSending ? 0.5 : 1 }]}
                                onPress={handleSend}>
                                <Text style={styles.sendText}>{isSending ? 'SENDING...' : 'SEND REQUEST'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </Pressable>
            </Pressable>
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
        padding: 24,
        width: '100%',
        maxWidth: 500,
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
    controls: { flexDirection: 'row', justifyContent: 'space-between' },
    sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
