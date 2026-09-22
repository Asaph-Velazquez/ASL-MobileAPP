import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaxiDateSelector } from './TaxiDateSelector';
import { buildTaxiRequestPayload, buildTaxiStaticMapUri, recommendedTaxiDate, taxiScheduleError, TAXI_TIME_OPTIONS as TIME_OPTIONS, TAXI_PASSENGER_OPTIONS as PASSENGER_OPTIONS, type TaxiRequestPayload } from '@/data/taxiRequest';
import {
  TAXI_DESTINATION_CATEGORIES,
  TaxiDestination,
  TaxiDestinationCategory,
  getDestinationsByCategory,
} from '@/data/taxiDestinations';
export type { TaxiRequestPayload } from '@/data/taxiRequest';

interface TaxiRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (payload: TaxiRequestPayload) => void | boolean | Promise<void | boolean>;
  isLoading?: boolean;
  sourceMode: TaxiRequestPayload['sourceMode'];
}

type TaxiStep = 'category' | 'destination' | 'time' | 'people' | 'luggage' | 'confirm';

export function TaxiRequestModal({
  visible,
  onClose,
  onSend,
  isLoading = false,
  sourceMode,
}: TaxiRequestModalProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = React.useState(recommendedTaxiDate);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const sendLock = React.useRef(false);
  const busy = isLoading || sending;

  const [step, setStep] = React.useState<TaxiStep>('category');
  const [selectedCategory, setSelectedCategory] = React.useState<TaxiDestinationCategory | null>(null);
  const [selectedDestination, setSelectedDestination] = React.useState<TaxiDestination | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<(typeof TIME_OPTIONS)[number] | null>(null);
  const [selectedPassengers, setSelectedPassengers] = React.useState<number | null>(null);
  const [hasLuggage, setHasLuggage] = React.useState<boolean | null>(null);

  const resetState = React.useCallback(() => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedDestination(null);
    setSelectedTime(null);
    setSelectedPassengers(null);
    setHasLuggage(null);
    setSelectedDate(recommendedTaxiDate());
    setError(null);
  }, []);

  const handleClose = React.useCallback(() => {
    if (busy) return;
    resetState();
    onClose();
  }, [busy, onClose, resetState]);

  React.useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [resetState, visible]);

  const handleBack = () => {
    if (busy) return;
    setError(null);
    if (step === 'destination') setStep('category');
    if (step === 'time') setStep('destination');
    if (step === 'people') setStep('time');
    if (step === 'luggage') setStep('people');
    if (step === 'confirm') setStep('luggage');
  };

  const handleSubmit = async () => {
    if (sendLock.current || isLoading) return;
    sendLock.current = true;
    setSending(true);
    setError(null);
    try {
      const payload = buildTaxiRequestPayload({ category: selectedCategory, destination: selectedDestination,
        date: selectedDate, time: selectedTime?.id ?? null, passengers: selectedPassengers, luggage: hasLuggage }, sourceMode);
      const result = await onSend(payload);
      if (result === false) throw new Error('Request failed. Please try again.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Request failed. Please try again.');
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  };

  const renderStepTitle = () => {
    switch (step) {
      case 'category':
        return 'SELECT DESTINATION CATEGORY';
      case 'destination':
        return 'SELECT DESTINATION';
      case 'time':
        return 'SELECT TIME';
      case 'people':
        return 'HOW MANY PEOPLE?';
      case 'luggage':
        return 'LUGGAGE SPACE?';
      case 'confirm':
        return 'CONFIRM TAXI REQUEST';
    }
  };

  const mapPreviewUri = selectedDestination ? buildTaxiStaticMapUri(selectedDestination) : null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <Pressable style={[styles.modalOverlay, { paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }]} onPress={handleClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{renderStepTitle()}</Text>
            <TouchableOpacity disabled={busy} onPress={handleClose} style={styles.iconButton}>
              <MaterialIcons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'category' && (
              <View style={styles.section}>
                {TAXI_DESTINATION_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: cardColor }]}
                    onPress={() => {
                      if (selectedCategory !== category.id) {
                        setSelectedDestination(null);
                        setSelectedDate(recommendedTaxiDate());
                        setSelectedTime(null);
                        setSelectedPassengers(null);
                        setHasLuggage(null);
                        setError(null);
                      }
                      setSelectedCategory(category.id);
                      setStep('destination');
                    }}
                  >
                    <View
                      style={[
                        styles.categoryIconContainer,
                        {
                          backgroundColor: category.iconBackground,
                          borderColor: category.iconColor,
                        },
                      ]}
                    >
                      <MaterialIcons name={category.icon as any} size={28} color={category.iconColor} />
                    </View>
                    <View style={styles.categoryTextBlock}>
                      <Text style={[styles.optionTitle, { color: textColor }]}>{category.label}</Text>
                      <Text style={[styles.optionDescription, { color: mutedColor }]}>
                        {category.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 'destination' && selectedCategory && (
              <View style={styles.section}>
                {getDestinationsByCategory(selectedCategory).map((destination) => (
                  <TouchableOpacity
                    key={destination.id}
                    style={[styles.destinationCard, { backgroundColor: cardColor }]}
                    onPress={() => {
                      setSelectedDestination(destination);
                      setStep('time');
                    }}
                  >
                    <Image
                      source={destination.images[0]}
                      resizeMode="cover"
                      style={styles.destinationCardImage}
                    />
                    <View style={styles.destinationCardOverlay} />
                    <View style={styles.destinationCardBadge}>
                      <MaterialIcons name="place" size={16} color="#FFFFFF" />
                      <Text style={styles.destinationCardBadgeText}>
                        #{destination.proximityOrder}
                      </Text>
                    </View>
                    <View style={styles.destinationCardContent}>
                      <Text style={styles.destinationCardTitle}>{destination.label}</Text>
                      <Text style={styles.destinationCardDescription}>{destination.shortDescription}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 'time' && (
              <View>
              <TaxiDateSelector value={selectedDate} onChange={(date) => { setSelectedDate(date); setSelectedTime(null); setError(null); }} />
              <View style={styles.chipGrid}>
                {TIME_OPTIONS.map((timeOption) => (
                  <TouchableOpacity
                    key={timeOption.id}
                    style={[styles.chip, { backgroundColor: cardColor }]}
                    onPress={() => {
                      const scheduleError = taxiScheduleError(selectedDate, timeOption.id);
                      if (scheduleError) { setError(scheduleError); return; }
                      setError(null);
                      setSelectedTime(timeOption);
                      setStep('people');
                    }}
                  >
                    <Text style={[styles.chipText, { color: textColor }]}>{timeOption.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              </View>
            )}

            {step === 'people' && (
              <View style={styles.chipGrid}>
                {PASSENGER_OPTIONS.map((passengerCount) => (
                  <TouchableOpacity
                    key={passengerCount}
                    style={[styles.chip, { backgroundColor: cardColor }]}
                    onPress={() => {
                      setSelectedPassengers(passengerCount);
                      setStep('luggage');
                    }}
                  >
                    <Text style={[styles.chipText, { color: textColor }]}>
                      {passengerCount} {passengerCount === 1 ? 'PERSON' : 'PEOPLE'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 'luggage' && (
              <View style={styles.section}>
                {[true, false].map((value) => (
                  <TouchableOpacity
                    key={String(value)}
                    style={[styles.optionCard, { backgroundColor: cardColor }]}
                    onPress={() => {
                      setHasLuggage(value);
                      setStep('confirm');
                    }}
                  >
                    <Text style={[styles.optionTitle, { color: textColor }]}>
                      {value ? 'YES, LUGGAGE' : 'NO LUGGAGE'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 'confirm' && selectedDestination && selectedTime && selectedPassengers && hasLuggage !== null && (
              <View style={styles.section}>
                <View style={[styles.summaryCard, { backgroundColor: cardColor }]}>
                  <Text style={[styles.summaryLine, { color: textColor }]}>
                    DESTINATION: {selectedDestination.label}
                  </Text>
                  <Text style={[styles.summaryLine, { color: textColor }]}>
                    TIME: {selectedDate} {selectedTime.label} (America/Mexico_City)
                  </Text>
                  <Text style={[styles.summaryLine, { color: textColor }]}>
                    PEOPLE: {selectedPassengers}
                  </Text>
                  <Text style={[styles.summaryLine, { color: textColor }]}>
                    LUGGAGE: {hasLuggage ? 'YES' : 'NO'}
                  </Text>
                </View>

                <View style={styles.carouselWrapper}>
                  <Text style={[styles.carouselTitle, { color: textColor }]}>
                    DESTINATION PHOTOS
                  </Text>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContainer}
                  >
                    {selectedDestination.images.map((imageSource, index) => (
                      <View key={`${selectedDestination.id}-${index}`} style={styles.carouselSlide}>
                        <Image source={imageSource} resizeMode="cover" style={styles.carouselImage} />
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {mapPreviewUri ? (
                  <Image source={{ uri: mapPreviewUri }} resizeMode="cover" style={styles.mapPreview} />
                ) : (
                  <View style={[styles.mapFallback, { backgroundColor: cardColor }]}>
                    <MaterialIcons name="map" size={28} color={mutedColor} />
                    <Text style={[styles.optionDescription, { color: mutedColor }]}>
                      GOOGLE MAP PREVIEW.
                    </Text>
                    <Text style={[styles.optionDescription, { color: mutedColor }]}>
                      {selectedDestination.coordinates.latitude.toFixed(4)}, {selectedDestination.coordinates.longitude.toFixed(4)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
          {error && <Text accessibilityRole="alert" style={{ color: textColor }}>{error}</Text>}

          <View style={styles.footer}>
            {step !== 'category' ? (
              <TouchableOpacity disabled={busy} style={[styles.secondaryButton, { borderColor: mutedColor }]} onPress={handleBack}>
                <Text style={[styles.secondaryButtonText, { color: textColor }]}>BACK</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonSpacer} />
            )}

            {step === 'confirm' ? (
              <TouchableOpacity
                style={[styles.primaryButton, busy && styles.disabledButton]}
                disabled={busy}
                onPress={handleSubmit}
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>SEND REQUEST</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.cancelButton, { borderColor: mutedColor }]} onPress={handleClose}>
                <Text style={[styles.cancelButtonText, { color: textColor }]}>CANCEL</Text>
              </TouchableOpacity>
            )}
          </View>
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
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 4,
  },
  section: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7E3F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  categoryIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    flexShrink: 0,
  },
  categoryTextBlock: {
    flex: 1,
    gap: 4,
  },
  optionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7E3F1',
  },
  destinationCard: {
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7E3F1',
    justifyContent: 'flex-end',
  },
  destinationCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  destinationCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 18, 34, 0.28)',
  },
  destinationCardBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 22, 39, 0.72)',
  },
  destinationCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  destinationCardContent: {
    padding: 16,
    gap: 6,
  },
  destinationCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  destinationCardDescription: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    minWidth: '47%',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E3F1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  summaryLine: {
    fontSize: 14,
    fontWeight: '600',
  },
  carouselWrapper: {
    gap: 8,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  carouselContainer: {
    gap: 12,
    paddingRight: 8,
  },
  carouselSlide: {
    width: 280,
  },
  carouselImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  mapPreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  mapFallback: {
    borderRadius: 14,
    padding: 16,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});






