import type { ImageSourcePropType } from 'react-native';

export type TaxiHelpResource = { source: ImageSourcePropType; accessibilityLabel: string };
export type TaxiHelpResources = Record<string, TaxiHelpResource | undefined>;

/**
 * Add verified ASL images/GIFs by destination ID (for example, 'zocalo-cdmx')
 * or exact step title: SELECT CATEGORY, SELECT DESTINATION, SELECT DATE / TIME,
 * HOW MANY PEOPLE?, LUGGAGE?, CONFIRM REQUEST.
 * Each entry needs source: require('../assets/...') or { uri: 'https://...' }
 * and an accessibilityLabel describing the resource. Destination help always includes
 * fingerspelling from its label (or fingerspellingText). Missing step keys show pending help.
 */
export const taxiAslResources: TaxiHelpResources = {};
