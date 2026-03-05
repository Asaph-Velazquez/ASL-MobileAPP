import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/components/BothComponents/auth-provider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedView } from '@/components/BothComponents/themed-view';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  gif?: any;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Aurora Central Hotel',
    description: 'Your comfort is our priority. This app will help you communicate with our staff easily.',
    icon: 'hotel',
    gif: require('../assets/gifs/ComidaGif.gif'), // Cambiar por GIF de "Bienvenida" en ASL
  },
  {
    id: 2,
    title: 'Choose Your Communication Mode',
    description: 'Select between Sign Language (ASL) or Text to communicate with hotel staff.',
    icon: 'compare-arrows',
    gif: require('../assets/gifs/ComidaGif.gif'), // Cambiar por GIF de "Elegir modo" en ASL
  },
  {
    id: 3,
    title: 'Request Services Easily',
    description: 'Order room service, request housekeeping, report issues, and more with just a few taps.',
    icon: 'room-service',
    gif: require('../assets/gifs/ComidaGif.gif'), // Cambiar por GIF de "Servicios" en ASL
  },
  {
    id: 4,
    title: 'Get Started',
    description: 'Let\'s begin! Choose your preferred communication method on the next screen.',
    icon: 'check-circle',
    gif: require('../assets/gifs/ComidaGif.gif'), // Cambiar por GIF de "Comenzar" en ASL
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { roomNumber } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardBg = useThemeColor({}, 'card');

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const handleNext = () => {
    if (isLastSlide) {
      // Ir a la pantalla de selección de modo (index.tsx en tabs)
      router.replace('/(tabs)');
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const slide = slides[currentSlide];

  return (
    <ThemedView style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: mutedColor }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Room number badge */}
      <View style={[styles.roomBadge, { backgroundColor: cardBg }]}>
        <MaterialIcons name="door-front" size={20} color="#4A90E2" />
        <Text style={[styles.roomBadgeText, { color: textColor }]}>Room {roomNumber}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* GIF/Icon area */}
        <View style={styles.iconContainer}>
          {slide.gif ? (
            <View style={styles.gifContainer}>
              <Image 
                source={slide.gif}
                style={styles.gif}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: cardBg }]}>
              <MaterialIcons name={slide.icon as any} size={80} color="#4A90E2" />
            </View>
          )}
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: mutedColor }]}>
            {slide.description}
          </Text>
        </View>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide ? '#4A90E2' : '#D1D5DB',
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {/* Back button */}
          {!isFirstSlide && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <MaterialIcons name="arrow-back" size={24} color="#4A90E2" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {/* Next button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  roomBadge: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  gifContainer: {
    width: 280,
    height: 240,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
