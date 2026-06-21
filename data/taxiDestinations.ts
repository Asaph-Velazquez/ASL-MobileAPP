import type { ImageSourcePropType } from 'react-native';

export type TaxiDestinationCategory =
  | 'tourist'
  | 'hospitals'
  | 'airports-buses';

export interface TaxiDestination {
  id: string;
  label: string;
  category: TaxiDestinationCategory;
  proximityOrder: number;
  shortDescription: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
  images: ImageSourcePropType[];
}

export interface TaxiDestinationCategoryOption {
  id: TaxiDestinationCategory;
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
}

function defineTaxiDestination(destination: TaxiDestination): TaxiDestination {
  return destination;
}

export const TAXI_DESTINATION_CATEGORIES: TaxiDestinationCategoryOption[] = [
  {
    id: 'tourist',
    label: 'TOURIST DESTINATIONS',
    description: 'MUSEUMS, LANDMARKS, HISTORIC PLACES.',
    icon: 'travel-explore',
    iconColor: '#FF9800',
    iconBackground: '#FFF3E0',
  },
  {
    id: 'hospitals',
    label: 'NEARBY HOSPITALS',
    description: 'URGENT OR MEDICAL DESTINATIONS.',
    icon: 'local-hospital',
    iconColor: '#E53935',
    iconBackground: '#FDECEC',
  },
  {
    id: 'airports-buses',
    label: 'AIRPORTS AND BUS STATIONS',
    description: 'TRAVEL TERMINALS.',
    icon: 'flight-takeoff',
    iconColor: '#1E88E5',
    iconBackground: '#EAF4FF',
  },
];

// Para agregar o modificar destinos solo edita este arreglo.
export const TAXI_DESTINATIONS: TaxiDestination[] = [
  defineTaxiDestination({
    id: 'zocalo-cdmx',
    label: 'ZOCALO OF MEXICO CITY',
    category: 'tourist',
    proximityOrder: 1,
    shortDescription: 'MAIN HISTORIC SQUARE IN DOWNTOWN MEXICO CITY.',
    coordinates: { latitude: 19.4326, longitude: -99.1332 },
    placeId: 'ChIJ8z8Sp7b50YURv3V3v9n3J4Q',
    images: [
      require('../assets/images/Destinos/ZocaloDeLaCiudadDeMexico/1.jpeg'),
      require('../assets/images/Destinos/ZocaloDeLaCiudadDeMexico/2.jpeg'),
      require('../assets/images/Destinos/ZocaloDeLaCiudadDeMexico/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'catedral-metropolitana',
    label: 'METROPOLITAN CATHEDRAL',
    category: 'tourist',
    proximityOrder: 2,
    shortDescription: 'ICONIC CATHEDRAL BESIDE THE ZOCALO.',
    coordinates: { latitude: 19.434, longitude: -99.1331 },
    placeId: 'ChIJD4eD8bb50YUR8wPqKz1n2A8',
    images: [
      require('../assets/images/Destinos/CatedralMetropolitana/1.jpeg'),
      require('../assets/images/Destinos/CatedralMetropolitana/2.jpeg'),
      require('../assets/images/Destinos/CatedralMetropolitana/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'palacio-nacional',
    label: 'NATIONAL PALACE',
    category: 'tourist',
    proximityOrder: 3,
    shortDescription: 'HISTORIC GOVERNMENT PALACE WITH MURALS.',
    coordinates: { latitude: 19.4328, longitude: -99.1295 },
    placeId: 'ChIJl6WfVrf50YURWjs4J0Q5T4Q',
    images: [
      require('../assets/images/Destinos/PalacioNacional/1.jpeg'),
      require('../assets/images/Destinos/PalacioNacional/2.jpeg'),
      require('../assets/images/Destinos/PalacioNacional/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'templo-mayor',
    label: 'TEMPLO MAYOR AND MUSEUM',
    category: 'tourist',
    proximityOrder: 4,
    shortDescription: 'ARCHAEOLOGICAL SITE AND MUSEUM IN THE HISTORIC CENTER.',
    coordinates: { latitude: 19.4343, longitude: -99.131 },
    placeId: 'ChIJ8fYhTrf50YUR0EfxdjS5x0w',
    images: [
      require('../assets/images/Destinos/TemploMayorYMuseoDelTemploMayor/1.jpeg'),
      require('../assets/images/Destinos/TemploMayorYMuseoDelTemploMayor/2.jpeg'),
      require('../assets/images/Destinos/TemploMayorYMuseoDelTemploMayor/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'torre-latinoamericana',
    label: 'LATIN AMERICAN TOWER',
    category: 'tourist',
    proximityOrder: 5,
    shortDescription: 'OBSERVATION TOWER WITH PANORAMIC CITY VIEWS.',
    coordinates: { latitude: 19.4342, longitude: -99.1402 },
    placeId: 'ChIJ69pkCLf50YURK1S1hN3s1jI',
    images: [
      require('../assets/images/Destinos/TorreLatinoamericana/1.jpeg'),
      require('../assets/images/Destinos/TorreLatinoamericana/2.jpeg'),
      require('../assets/images/Destinos/TorreLatinoamericana/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'palacio-bellas-artes',
    label: 'PALACE OF FINE ARTS',
    category: 'tourist',
    proximityOrder: 6,
    shortDescription: 'MAJOR CULTURAL VENUE KNOWN FOR ITS ARCHITECTURE.',
    coordinates: { latitude: 19.4352, longitude: -99.1412 },
    placeId: 'ChIJcQv6A7f50YURxj3m0x2QkX8',
    images: [
      require('../assets/images/Destinos/PalacioDeBellasArtes/1.jpeg'),
      require('../assets/images/Destinos/PalacioDeBellasArtes/2.jpeg'),
      require('../assets/images/Destinos/PalacioDeBellasArtes/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'alameda-central',
    label: 'ALAMEDA CENTRAL',
    category: 'tourist',
    proximityOrder: 7,
    shortDescription: 'CENTRAL URBAN PARK NEXT TO BELLAS ARTES.',
    coordinates: { latitude: 19.4362, longitude: -99.1433 },
    placeId: 'ChIJR6C0Abf50YURm0x7F_y4T3E',
    images: [
      require('../assets/images/Destinos/AlamedaCentral/1.png'),
      require('../assets/images/Destinos/AlamedaCentral/2.jpg'),
      require('../assets/images/Destinos/AlamedaCentral/3.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'museo-franz-mayer',
    label: 'FRANZ MAYER MUSEUM',
    category: 'tourist',
    proximityOrder: 8,
    shortDescription: 'MUSEUM OF DECORATIVE ARTS NEAR ALAMEDA CENTRAL.',
    coordinates: { latitude: 19.4373, longitude: -99.1443 },
    placeId: 'ChIJa6N0lrf50YUR6CnF5m6lO1g',
    images: [
      require('../assets/images/Destinos/MuseoFranzMayer/1.jpg'),
      require('../assets/images/Destinos/MuseoFranzMayer/2.jpg'),
      require('../assets/images/Destinos/MuseoFranzMayer/3.jpeg'),
    ],
  }),
  defineTaxiDestination({
    id: 'museo-nacional-arte',
    label: 'NATIONAL ART MUSEUM',
    category: 'tourist',
    proximityOrder: 9,
    shortDescription: 'MUSEUM FEATURING MEXICAN ART IN A HISTORIC BUILDING.',
    coordinates: { latitude: 19.4361, longitude: -99.1398 },
    placeId: 'ChIJn5u9yrf50YURTWW9INz0q68',
    images: [
      require('../assets/images/Destinos/MuseoNacionalDeArte/1.jpeg'),
      require('../assets/images/Destinos/MuseoNacionalDeArte/2.png'),
      require('../assets/images/Destinos/MuseoNacionalDeArte/3.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'plaza-garibaldi',
    label: 'PLAZA GARIBALDI',
    category: 'tourist',
    proximityOrder: 10,
    shortDescription: 'TRADITIONAL MARIACHI SQUARE IN THE CITY CENTER.',
    coordinates: { latitude: 19.4417, longitude: -99.138 },
    placeId: 'ChIJ5Yw0RLf50YURl0ru9wIUl2s',
    images: [
      require('../assets/images/Destinos/PlazaGaribaldi/1.jpg'),
      require('../assets/images/Destinos/PlazaGaribaldi/2.jpg'),
      require('../assets/images/Destinos/PlazaGaribaldi/3.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'hospital-angeles-metropolitano',
    label: 'HOSPITAL ANGELES METROPOLITANO',
    category: 'hospitals',
    proximityOrder: 1,
    shortDescription: 'PRIVATE HOSPITAL IN ROMA WITH EMERGENCY SERVICES.',
    coordinates: { latitude: 19.4078, longitude: -99.1608 },
    placeId: 'ChIJM0gXvQ__0YURxV8oX0aP7nM',
    images: [
      require('../assets/images/Destinos/HospitalAngelesMetropolitanoColRoma/1.jpg'),
      require('../assets/images/Destinos/HospitalAngelesMetropolitanoColRoma/2.jpg'),
      require('../assets/images/Destinos/HospitalAngelesMetropolitanoColRoma/3.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'hospital-español',
    label: 'HOSPITAL ESPAÑOL',
    category: 'hospitals',
    proximityOrder: 2,
    shortDescription: 'GENERAL CARE AND SPECIALTY HOSPITAL IN POLANCO.',
    coordinates: { latitude: 19.4361, longitude: -99.1924 },
    placeId: 'ChIJ-fTqE5j_0YURQ6h4Y1oJ2gI',
    images: [
      require('../assets/images/Destinos/HospitalEspanolColPolanco/1.jpg'),
      require('../assets/images/Destinos/HospitalEspanolColPolanco/2.jpg'),
      require('../assets/images/Destinos/HospitalEspanolColPolanco/3.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'hospital-medica-sur',
    label: 'HOSPITAL MEDICA SUR',
    category: 'hospitals',
    proximityOrder: 3,
    shortDescription: 'LARGE PRIVATE MEDICAL CENTER IN TLALPAN.',
    coordinates: { latitude: 19.2863, longitude: -99.1617 },
    placeId: 'ChIJm8VxCQD_0YURvRjzZ8P6M5s',
    images: [
      require('../assets/images/Destinos/HospitalMedicaSurTlalpan/1.jpg'),
      require('../assets/images/Destinos/HospitalMedicaSurTlalpan/2.jpg'),
      require('../assets/images/Destinos/HospitalMedicaSurTlalpan/3.jpg'),
      require('../assets/images/Destinos/HospitalMedicaSurTlalpan/4.jpg'),
    ],
  }),
  defineTaxiDestination({
    id: 'aicm-benito-juarez',
    label: 'BENITO JUAREZ AIRPORT (AICM)',
    category: 'airports-buses',
    proximityOrder: 1,
    shortDescription: 'MAIN INTERNATIONAL AIRPORT FOR MEXICO CITY.',
    coordinates: { latitude: 19.4361, longitude: -99.0719 },
    placeId: 'ChIJn8YDiqb50YURxKQSQxP8x6A',
    images: [
      require('../assets/images/Destinos/AeropuertoInternacionalBenitoJuarez/1.png'),
      require('../assets/images/Destinos/AeropuertoInternacionalBenitoJuarez/2.png'),
      require('../assets/images/Destinos/AeropuertoInternacionalBenitoJuarez/3.png'),
      require('../assets/images/Destinos/AeropuertoInternacionalBenitoJuarez/4.png'),
    ],
  }),
  defineTaxiDestination({
    id: 'aifa-felipe-angeles',
    label: 'FELIPE ANGELES AIRPORT (AIFA)',
    category: 'airports-buses',
    proximityOrder: 2,
    shortDescription: 'INTERNATIONAL AIRPORT LOCATED IN ZUMPANGO.',
    coordinates: { latitude: 19.7362, longitude: -99.0145 },
    placeId: 'ChIJEWmy0r502YUR10t54bQK7WE',
    images: [
      require('../assets/images/Destinos/AeropuertoInternacionalFelipeAngeles/1.png'),
      require('../assets/images/Destinos/AeropuertoInternacionalFelipeAngeles/2.png'),
      require('../assets/images/Destinos/AeropuertoInternacionalFelipeAngeles/3.png'),
    ],
  }),
  defineTaxiDestination({
    id: 'tapo',
    label: 'TAPO BUS TERMINAL',
    category: 'airports-buses',
    proximityOrder: 3,
    shortDescription: 'EASTERN PASSENGER BUS TERMINAL OF MEXICO CITY.',
    coordinates: { latitude: 19.4219, longitude: -99.1145 },
    placeId: 'ChIJwXJx4K750YURvP5U0Y4e7cM',
    images: [
      require('../assets/images/Destinos/TerminalDeAutobusesDePasajerosDeOriente/1.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDePasajerosDeOriente/2.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDePasajerosDeOriente/3.png'),
    ],
  }),
  defineTaxiDestination({
    id: 'terminal-norte',
    label: 'BUS TERMINAL NORTH',
    category: 'airports-buses',
    proximityOrder: 4,
    shortDescription: 'MAIN NORTHERN BUS TERMINAL.',
    coordinates: { latitude: 19.4795, longitude: -99.1392 },
    placeId: 'ChIJn-_Yz4b50YURa6oIl64YhrY',
    images: [
      require('../assets/images/Destinos/TerminalDeAutobusesDelNorte/1.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDelNorte/2.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDelNorte/3.png'),
    ],
  }),
  defineTaxiDestination({
    id: 'terminal-sur-taxquena',
    label: 'BUS TERMINAL SOUTH (TAXQUENA)',
    category: 'airports-buses',
    proximityOrder: 5,
    shortDescription: 'SOUTHERN BUS TERMINAL SERVING TAXQUENA AREA.',
    coordinates: { latitude: 19.3509, longitude: -99.1417 },
    placeId: 'ChIJA7v0f2__0YURrmA6q5Vh2b4',
    images: [
      require('../assets/images/Destinos/TerminalDeAutobusesDelSurTaxquena/1.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDelSurTaxquena/2.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDelSurTaxquena/3.png'),
    ],
  }),
  defineTaxiDestination({
    id: 'terminal-poniente-observatorio',
    label: 'BUS TERMINAL WEST (OBSERVATORIO)',
    category: 'airports-buses',
    proximityOrder: 6,
    shortDescription: 'WESTERN BUS TERMINAL IN OBSERVATORIO.',
    coordinates: { latitude: 19.3983, longitude: -99.2007 },
    placeId: 'ChIJ8zB5Xsj_0YUR5d4T2zIbbm0',
    images: [
      require('../assets/images/Destinos/TerminalDeAutobusesDePonienteObservatorio/1.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDePonienteObservatorio/2.png'),
      require('../assets/images/Destinos/TerminalDeAutobusesDePonienteObservatorio/3.png'),
    ],
  }),
];

export function getDestinationsByCategory(category: TaxiDestinationCategory) {
  return TAXI_DESTINATIONS
    .filter((destination) => destination.category === category)
    .sort((a, b) => a.proximityOrder - b.proximityOrder);
}
