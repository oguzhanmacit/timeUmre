export type City = 'Jeddah' | 'Makkah' | 'Madinah';
export type StepType = 'airport' | 'transport' | 'hotel' | 'worship' | 'visit' | 'return';
export type TransportType = 'train' | 'taxi' | 'bus' | 'private_transfer';

export interface TransportOption {
  type: TransportType;
  title: string;
  description: string;
  recommendedFor: string;
  videos?: { label: string; url: string }[];
  imageUrl?: string;
  imageUrl2?: string;
  rating?: number;
  duration?: string;
  durationLabel?: string;
  price?: string;
  priceLabel?: string;
  isBestOption?: boolean;
}

export interface UmrahRouteStep {
  id: string;
  order: number;
  title: string;
  city: City;
  type: StepType;
  shortDescription: string;
  content: string;
  checklist: string[];
  transportOptions?: TransportOption[];
  videoUrl?: string;
  videos?: { label: string; url: string }[];
  mapUrl?: string;
}

export interface UmrahRoute {
  id: string;
  title: string;
  subtitle: string;
  startAirport: string;
  firstCity: string;
  secondCity: string;
  returnAirport: string;
  description: string;
  steps: UmrahRouteStep[];
}
