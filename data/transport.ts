export interface TransportOption {
  id: string;
  vehicleType: 'car' | 'van' | 'bus';
  vehicleCount: number;
  totalCapacity: number;
  priceCents: number;
  description?: string;
}

export interface TransportVehicle {
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor?: string;
}

export interface TransportDetails {
  serviceType?: string;
  destinationId?: string;
  destinationLabel?: string;
  destinationCoords?: { latitude: number; longitude: number };
  scheduledAt?: string;
  passengerCount?: number;
  hasLuggage?: boolean;
  transportProposals?: { revision: number; options: TransportOption[] };
  transportAcceptance?: { revision: number; optionId: string; option: TransportOption; acceptedAt: string };
  transportResponse?: {
    vehicles?: TransportVehicle[];
    vehiclePlate?: string;
    vehicleModel?: string;
    transportCost?: string;
    revision?: number;
  };
}

export function transportDetails(value: unknown): TransportDetails {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as TransportDetails : {};
}

export function formatTransportPrice(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

export const transportVehicleLabels = { car: 'Small car', van: 'Van', bus: 'Bus' };
export const transportVehicleIcons = { car: 'directions-car', van: 'airport-shuttle', bus: 'directions-bus' } as const;

export function isCurrentAcceptance(details: TransportDetails) {
  return !!details.transportAcceptance && details.transportAcceptance.revision === details.transportProposals?.revision;
}

export function assignedVehicles(details: TransportDetails): TransportVehicle[] {
  if (details.transportProposals && !isCurrentAcceptance(details)) return [];
  const response = details.transportResponse;
  if (Array.isArray(response?.vehicles)) return response.vehicles;
  return response?.vehiclePlate && response.vehicleModel
    ? [{ vehiclePlate: response.vehiclePlate, vehicleModel: response.vehicleModel }] : [];
}

export function transportStage(details: TransportDetails, status: string) {
  if (status === 'cancelled') return 'REQUEST CANCELLED';
  if (status === 'completed') return 'SERVICE COMPLETED';
  if (assignedVehicles(details).length) return 'VEHICLE ASSIGNED';
  if (isCurrentAcceptance(details)) return 'OPTION ACCEPTED';
  if (details.transportProposals) return details.transportProposals.revision > 1 ? 'NEW OPTIONS - ACCEPT AGAIN' : 'OPTIONS AVAILABLE';
  return 'REQUEST SENT - WAIT STAFF';
}
