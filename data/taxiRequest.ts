import type { TaxiDestination, TaxiDestinationCategory } from './taxiDestinations';

export const TAXI_TIME_ZONE = 'America/Mexico_City';
export const TAXI_TIME_OPTIONS = [
  { id: '07:00', label: '7:00 AM' }, { id: '09:00', label: '9:00 AM' },
  { id: '12:00', label: '12:00 PM' }, { id: '15:00', label: '3:00 PM' },
  { id: '18:00', label: '6:00 PM' }, { id: '21:00', label: '9:00 PM' },
] as const;
export const TAXI_PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6];

export interface TaxiRequestPayload {
  serviceType: 'taxi';
  destinationCategory: TaxiDestinationCategory;
  destinationId: string;
  destinationLabel: string;
  destinationCoords: { latitude: number; longitude: number };
  destinationPlaceId?: string;
  timeMode: 'now' | 'scheduled';
  scheduledAt?: string;
  passengerCount: number;
  hasLuggage: boolean;
  sourceMode: 'text_guided' | 'asl_guided';
  summary: string;
}

export interface TaxiRequestDraft {
  category: TaxiDestinationCategory | null;
  destination: TaxiDestination | null;
  date: string;
  time: string | null;
  passengers: number | null;
  luggage: boolean | null;
}

function cityParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAXI_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)!.value;
  return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}:${value('second')}` };
}

export function recommendedTaxiDate(now = new Date()) {
  return cityParts(new Date(now.getTime() + 48 * 3600000)).date;
}

export function shiftTaxiDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

// Resolve wall time using the named zone, never the device's local timezone.
export function buildScheduledAt(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !TAXI_TIME_OPTIONS.some(option => option.id === time)) {
    throw new Error('Select a valid date and time.');
  }
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 10) !== date) {
    throw new Error('Select a valid calendar date.');
  }
  let instant = wall;
  for (let i = 0; i < 3; i++) {
    const parts = cityParts(new Date(instant));
    instant += wall - Date.parse(`${parts.date}T${parts.time}Z`);
  }
  const resolved = cityParts(new Date(instant));
  if (resolved.date !== date || resolved.time !== `${time}:00`) throw new Error('This time is unavailable.');
  return new Date(instant).toISOString();
}

export function taxiScheduleError(date: string, time: string, now = new Date()): string | null {
  try {
    return Date.parse(buildScheduledAt(date, time)) - now.getTime() < 24 * 3600000
      ? 'Choose a time at least 24 hours ahead. 48 hours is recommended.' : null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Select a valid date and time.';
  }
}

export function buildTaxiRequestPayload(draft: TaxiRequestDraft, sourceMode: TaxiRequestPayload['sourceMode'], now = new Date()): TaxiRequestPayload {
  const { category, destination, date, time, passengers, luggage } = draft;
  if (!category || !destination || destination.category !== category || !time ||
    passengers === null || !TAXI_PASSENGER_OPTIONS.includes(passengers) || typeof luggage !== 'boolean') {
    throw new Error('Complete all request selections.');
  }
  const error = taxiScheduleError(date, time, now);
  if (error) throw new Error(error);
  const timeLabel = TAXI_TIME_OPTIONS.find(option => option.id === time)!.label;
  return {
    serviceType: 'taxi', destinationCategory: category, destinationId: destination.id,
    destinationLabel: destination.label, destinationCoords: destination.coordinates,
    destinationPlaceId: destination.placeId, timeMode: 'scheduled', scheduledAt: buildScheduledAt(date, time),
    passengerCount: passengers, hasLuggage: luggage, sourceMode,
    summary: `Taxi - ${destination.label} - ${date} ${timeLabel} (${TAXI_TIME_ZONE}) - ${passengers} ${passengers === 1 ? 'person' : 'people'} - ${luggage ? 'luggage' : 'no luggage'}`,
  };
}

export function buildTaxiStaticMapUri(destination: TaxiDestination) {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const point = `${destination.coordinates.latitude},${destination.coordinates.longitude}`;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${point}&zoom=14&size=600x240&scale=2&markers=color:red%7C${point}&key=${encodeURIComponent(key)}`;
}

export function buildTaxiMapUrl(destination: TaxiDestination) {
  const point = `${destination.coordinates.latitude},${destination.coordinates.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}${destination.placeId ? `&query_place_id=${encodeURIComponent(destination.placeId)}` : ''}`;
}
