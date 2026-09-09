import type {
  ProcurementCentre,
  CentreRecommendation,
  WaitTimePrediction,
  BestTimeSlot,
  QueueForecastPoint,
  Token,
  Procurement,
  PaymentInfo,
  Farmer,
  NotificationItem,
  Bottleneck,
  AdminStats,
  CongestionLevel,
} from '@/types';

export const mockCentres: ProcurementCentre[] = [
  {
    id: 'c1',
    name: 'Centre A — Krishi Kendra',
    code: 'PC-A-01',
    distance: 2.4,
    lat: 26.9124,
    lng: 75.7873,
    queue: 18,
    activeCounters: 3,
    totalCounters: 4,
    avgProcessingTime: 6,
    capacity: 60,
    congestion: 'low',
    waitTime: 21,
    processingSpeed: 45,
    address: 'Sector 12, Mansarovar, Jaipur',
  },
  {
    id: 'c2',
    name: 'Centre B — Mandi Bhavan',
    code: 'PC-B-02',
    distance: 3.1,
    lat: 26.8850,
    lng: 75.7900,
    queue: 41,
    activeCounters: 2,
    totalCounters: 4,
    avgProcessingTime: 8,
    capacity: 55,
    congestion: 'medium',
    waitTime: 48,
    processingSpeed: 30,
    address: 'Jhotwara Road, Jaipur',
  },
  {
    id: 'c3',
    name: 'Centre C — Kisan Seva',
    code: 'PC-C-03',
    distance: 4.8,
    lat: 26.9300,
    lng: 75.8100,
    queue: 67,
    activeCounters: 1,
    totalCounters: 4,
    avgProcessingTime: 11,
    capacity: 40,
    congestion: 'high',
    waitTime: 76,
    processingSpeed: 18,
    address: 'Vidyadhar Nagar, Jaipur',
  },
  {
    id: 'c4',
    name: 'Centre D — Annadata Hub',
    code: 'PC-D-04',
    distance: 5.2,
    lat: 26.8700,
    lng: 75.7600,
    queue: 12,
    activeCounters: 4,
    totalCounters: 4,
    avgProcessingTime: 5,
    capacity: 70,
    congestion: 'low',
    waitTime: 15,
    processingSpeed: 52,
    address: 'Vaishali Nagar, Jaipur',
  },
  {
    id: 'c5',
    name: 'Centre E — FCI Godown',
    code: 'PC-E-05',
    distance: 7.1,
    lat: 26.9500,
    lng: 75.7400,
    queue: 34,
    activeCounters: 2,
    totalCounters: 3,
    avgProcessingTime: 9,
    capacity: 50,
    congestion: 'medium',
    waitTime: 42,
    processingSpeed: 28,
    address: 'Sikar Road, Jaipur',
  },
];

export const mockFarmer: Farmer = {
  id: 'f1',
  name: 'Rajesh Kumar',
  mobile: '9876543210',
  location: 'Shahpura',
  state: 'Rajasthan',
  district: 'Jaipur',
  crop: 'Wheat',
  expectedQuantity: 85,
};

export const mockWaitPrediction: WaitTimePrediction = {
  token: 47,
  currentlyServing: 32,
  farmersAhead: 15,
  estimatedWait: 31,
  estimatedTurn: '4:20 PM',
  confidence: 89,
  status: 'on-track',
};

export const mockRecommendations: CentreRecommendation[] = [
  {
    centre: mockCentres[0],
    rank: 1,
    score: 94,
    isTop: true,
    reasons: [
      'Lowest predicted waiting time',
      '3/4 counters active',
      'Faster processing speed',
      'Moderate distance (2.4 km)',
      'Lower expected congestion',
    ],
  },
  {
    centre: mockCentres[3],
    rank: 2,
    score: 88,
    isTop: false,
    reasons: [
      'All 4 counters active',
      'Shortest wait at 15 min',
      'Highest processing speed',
      'Slightly farther (5.2 km)',
    ],
  },
  {
    centre: mockCentres[1],
    rank: 3,
    score: 62,
    isTop: false,
    reasons: [
      'Closer distance (3.1 km)',
      'Only 2/4 counters active',
      'Medium congestion expected',
    ],
  },
];

export const mockBestTime: BestTimeSlot = {
  start: '4:00 PM',
  end: '4:30 PM',
  expectedWaitMin: 18,
  expectedWaitMax: 22,
  confidence: 91,
};

export const mockForecast: QueueForecastPoint[] = [
  { hour: '12 PM', level: 'low', value: 25, predictedFarmers: 18 },
  { hour: '1 PM', level: 'medium', value: 55, predictedFarmers: 38 },
  { hour: '2 PM', level: 'high', value: 82, predictedFarmers: 62 },
  { hour: '3 PM', level: 'high', value: 78, predictedFarmers: 55 },
  { hour: '4 PM', level: 'medium', value: 40, predictedFarmers: 22 },
  { hour: '5 PM', level: 'low', value: 15, predictedFarmers: 8 },
];

export const mockToken: Token = {
  id: 't1',
  number: 47,
  centreId: 'c1',
  centreName: 'Centre A — Krishi Kendra',
  date: 'Today',
  time: '4:20 PM',
  crop: 'Wheat',
  quantity: 85,
  status: 'in-queue',
  estimatedWait: 31,
};

export const mockProcurementStages = [
  { stage: 'booked' as const, label: 'Booked', description: 'Token booked and slot confirmed', timestamp: '2:00 PM', completed: true },
  { stage: 'arrived' as const, label: 'Arrived', description: 'Farmer arrived at centre', timestamp: '3:15 PM', completed: true },
  { stage: 'weighing' as const, label: 'Weighing', description: 'Crop quantity being measured', timestamp: '3:30 PM', completed: true },
  { stage: 'quality-check' as const, label: 'Quality Check', description: 'Crop quality verification in progress', timestamp: '—', completed: false },
  { stage: 'accepted' as const, label: 'Accepted', description: 'Crop quality approved', timestamp: '—', completed: false },
  { stage: 'procured' as const, label: 'Procured', description: 'Procurement completed', timestamp: '—', completed: false },
  { stage: 'payment-pending' as const, label: 'Payment Pending', description: 'Payment being processed', timestamp: '—', completed: false },
  { stage: 'paid' as const, label: 'Paid', description: 'Payment transferred to account', timestamp: '—', completed: false },
];

export const mockProcurement: Procurement = {
  id: 'p1',
  procurementId: 'PROC-2026-0892',
  centreName: 'Centre A — Krishi Kendra',
  crop: 'Wheat',
  quantity: 85,
  unit: 'Qtl',
  amount: 42500,
  status: 'quality-check',
  date: '6 Sep 2026',
  stages: mockProcurementStages,
};

export const mockPayment: PaymentInfo = {
  procurementId: 'PROC-2026-0892',
  crop: 'Wheat',
  quantity: 85,
  amount: 42500,
  status: 'completed',
  date: '6 Sep 2026',
  transactionRef: 'TXN7845236901',
};

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'turn',
    title: 'Your turn is approaching',
    message: 'Token #47 is expected in approximately 12 minutes. Please proceed to Centre A.',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'queue',
    title: 'Queue Update',
    message: 'Centre A queue has increased. Consider alternative centres.',
    timestamp: '8 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'procurement',
    title: 'Procurement Update',
    message: 'Your crop has passed quality verification. Weighing in progress.',
    timestamp: '25 min ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'payment',
    title: 'Payment Update',
    message: 'Your payment of ₹42,500 has been completed. Ref: TXN7845236901',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Welcome to SmartProcure',
    message: 'Your account is ready. Start by finding the best procurement centre near you.',
    timestamp: '3 hours ago',
    read: true,
  },
];

export const mockBottlenecks: Bottleneck[] = [
  {
    id: 'b1',
    centreId: 'c3',
    centreName: 'Centre C — Kisan Seva',
    counter: 2,
    processingTimeAboveNormal: 42,
    expectedDelay: 18,
    recommendedAction: 'Activate Counter #4',
    severity: 'critical',
  },
  {
    id: 'b2',
    centreId: 'c2',
    centreName: 'Centre B — Mandi Bhavan',
    counter: 1,
    processingTimeAboveNormal: 25,
    expectedDelay: 9,
    recommendedAction: 'Reroute farmers to Centre D',
    severity: 'warning',
  },
];

export const mockAdminStats: AdminStats = {
  totalFarmers: 342,
  activeTokens: 87,
  activeCentres: 5,
  farmersWaiting: 168,
  avgWaitingTime: 38,
};

export const congestionColor: Record<CongestionLevel, string> = {
  low: 'bg-success-500',
  medium: 'bg-warning-500',
  high: 'bg-danger-500',
};

export const congestionLabel: Record<CongestionLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const congestionTextColor: Record<CongestionLevel, string> = {
  low: 'text-success-700',
  medium: 'text-warning-700',
  high: 'text-danger-700',
};

export const congestionBg: Record<CongestionLevel, string> = {
  low: 'bg-success-50 text-success-700 border-success-200',
  medium: 'bg-warning-50 text-warning-700 border-warning-200',
  high: 'bg-danger-50 text-danger-700 border-danger-200',
};
