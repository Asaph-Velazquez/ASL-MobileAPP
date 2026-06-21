import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  TAXI_DESTINATION_CATEGORIES,
  TaxiDestination,
  TaxiDestinationCategory,
  getDestinationsByCategory,
} from '@/data/taxiDestinations';

export interface TaxiRequestPayload {
  serviceType: 'taxi';
  destinationCategory: TaxiDestinationCategory;
  destinationId: string;
  destinationLabel: string;
  destinationCoords: {
    latitude: number;
    longitude: number;
  };
  destinationPlaceId?: string;
  timeMode: 'now' | 'scheduled';
  scheduledAt?: string;
  passengerCount: number;
  hasLuggage: boolean;
  sourceMode: 'text_guided' | 'asl_guided';
  summary: string;
}

interface TaxiRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (payload: TaxiRequestPayload) => void | Promise<void>;
  isLoading?: boolean;
  sourceMode: TaxiRequestPayload['sourceMode'];
}

type TaxiStep = 'category' | 'destination' | 'time' | 'people' | 'luggage' | 'confirm';

const TIME_OPTIONS = [
  { id: '07:00', label: '7:00 AM', mode: 'scheduled' as const },
  { id: '09:00', label: '9:00 AM', mode: 'scheduled' as const },
  { id: '12:00', label: '12:00 PM', mode: 'scheduled' as const },
  { id: '15:00', label: '3:00 PM', mode: 'scheduled' as const },
  { id: '18:00', label: '6:00 PM', mode: 'scheduled' as const },
  { id: '21:00', label: '9:00 PM', mode: 'scheduled' as const },
];

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6];

function buildScheduledAt(timeValue: string) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const scheduledAt = new Date();
  scheduledAt.setHours(hours, minutes, 0, 0);
  return scheduledAt.toISOString();
}

function buildSummary(
  destination: TaxiDestination,
  timeLabel: string,
  passengerCount: number,
  hasLuggage: boolean,
) {
  const passengerLabel = passengerCount === 1 ? 'person' : 'people';
  return `Taxi - ${destination.label} - ${timeLabel} - ${passengerCount} ${passengerLabel}${hasLuggage ? ' - luggage' : ''}`;
}

function buildStaticMapUri(destination: TaxiDestination) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return null;
  }

  const marker = `${destination.coordinates.latitude},${destination.coordinates.longitude}`;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${marker}&zoom=14&size=600x240&scale=2&markers=color:red%7C${marker}&key=${apiKey}`;
}

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
  }, []);

  const handleClose = React.useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  React.useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [resetState, visible]);

  const handleBack = () => {
    if (step === 'destination') setStep('category');
    if (step === 'time') setStep('destination');
    if (step === 'people') setStep('time');
    if (step === 'luggage') setStep('people');
    if (step === 'confirm') setStep('luggage');
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedDestination || !selectedTime || !selectedPassengers || hasLuggage === null) {
      return;
    }

    await onSend({
      serviceType: 'taxi',
      destinationCategory: selectedCategory,
      destinationId: selectedDestination.id,
      destinationLabel: selectedDestination.label,
      destinationCoords: selectedDestination.coordinates,
      destinationPlaceId: selectedDestination.placeId,
      timeMode: selectedTime.mode,
      scheduledAt: selectedTime.mode === 'scheduled' ? buildScheduledAt(selectedTime.id) : undefined,
      passengerCount: selectedPassengers,
      hasLuggage,
      sourceMode,
      summary: buildSummary(selectedDestination, selectedTime.label, selectedPassengers, hasLuggage),
    });
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

  const mapPreviewUri = selectedDestination ? buildStaticMapUri(selectedDestination) : null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{renderStepTitle()}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
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
              <View style={styles.chipGrid}>
                {TIME_OPTIONS.map((timeOption) => (
                  <TouchableOpacity
                    key={timeOption.id}
                    style={[styles.chip, { backgroundColor: cardColor }]}
                    onPress={() => {
                      setSelectedTime(timeOption);
                      setStep('people');
                    }}
                  >
                    <Text style={[styles.chipText, { color: textColor }]}>{timeOption.label}</Text>
                  </TouchableOpacity>
                ))}
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
                    TIME: {selectedTime.label}
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

          <View style={styles.footer}>
            {step !== 'category' ? (
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: mutedColor }]} onPress={handleBack}>
                <Text style={[styles.secondaryButtonText, { color: textColor }]}>BACK</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonSpacer} />
            )}

            {step === 'confirm' ? (
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                disabled={isLoading}
                onPress={handleSubmit}
              >
                {isLoading ? (
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






