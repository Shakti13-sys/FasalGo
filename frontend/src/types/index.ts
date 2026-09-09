// Core domain types for the Smart Procurement Platform

export type CongestionLevel = 'low' | 'medium' | 'high';

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  distance: number; // in km
  lat: number;
  lng: number;
  queue: number;
  activeCounters: number;
  totalCounters: number;
  avgProcessingTime: number; // in minutes
  capacity: number; // farmers per hour
  congestion: CongestionLevel;
  waitTime: number; // in minutes
  processingSpeed: number; // farmers per hour
  address: string;
}

export interface CentreRecommendation {
  centre: ProcurementCentre;
  rank: number;
  score: number;
  reasons: string[];
  isTop: boolean;
}

export interface WaitTimePrediction {
  token: number;
  currentlyServing: number;
  farmersAhead: number;
  estimatedWait: number; // minutes
  estimatedTurn: string; // formatted time
  confidence: number; // percentage
  status: 'on-track' | 'delayed' | 'ahead';
}

export interface BestTimeSlot {
  start: string;
  end: string;
  expectedWaitMin: number;
  expectedWaitMax: number;
  confidence: number;
}

export interface QueueForecastPoint {
  hour: string;
  level: CongestionLevel;
  value: number;
  predictedFarmers: number;
}

export interface Token {
  id: string;
  number: number;
  centreId: string;
  centreName: string;
  date: string;
  time: string;
  crop: string;
  quantity: number;
  status: 'booked' | 'arrived' | 'in-queue' | 'completed';
  estimatedWait: number;
}

export type ProcurementStage =
  | 'booked'
  | 'arrived'
  | 'weighing'
  | 'quality-check'
  | 'accepted'
  | 'procured'
  | 'payment-pending'
  | 'paid';

export interface Procurement {
  id: string;
  procurementId: string;
  centreName: string;
  crop: string;
  quantity: number;
  unit: string;
  amount: number;
  status: ProcurementStage;
  date: string;
  stages: { stage: ProcurementStage; label: string; description: string; timestamp?: string; completed: boolean }[];
}

export interface PaymentInfo {
  procurementId: string;
  crop: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'completed';
  date: string;
  transactionRef: string;
}

export interface Farmer {
  id: string;
  name: string;
  mobile: string;
  location: string;
  state: string;
  district: string;
  crop: string;
  expectedQuantity: number;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  type: 'turn' | 'queue' | 'procurement' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Bottleneck {
  id: string;
  centreId: string;
  centreName: string;
  counter: number;
  processingTimeAboveNormal: number; // percentage
  expectedDelay: number; // minutes
  recommendedAction: string;
  severity: 'warning' | 'critical';
}

export interface AdminStats {
  totalFarmers: number;
  activeTokens: number;
  activeCentres: number;
  farmersWaiting: number;
  avgWaitingTime: number;
}

export interface RerouteSuggestion {
  fromCentreId: string;
  fromCentreName: string;
  fromWaitTime: number;
  toCentreId: string;
  toCentreName: string;
  toWaitTime: number;
  reason: string;
}

export interface VoiceResponse {
  query: string;
  response: string;
  action?: string;
}
