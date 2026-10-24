/**
 * FarmConnect Smart Logistics Engine
 * Automated vehicle recommendation, delivery cost estimation, trip ETA calculation,
 * and driver dispatch assignment based on order weight and route distance.
 */

export type VehicleType = 'Bike' | 'Auto' | 'Bolero Pickup' | 'Mini Truck' | 'Lorry';

export interface VehicleSpec {
  type: VehicleType;
  maxWeightKg: number;
  baseFare: number;
  perKmRate: number;
  avgSpeedKmH: number;
  icon: string;
  description: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  vehicleType: VehicleType;
  vehicleNumber: string;
  currentLocation: string;
  completedTrips: number;
}

export interface LogisticsCalculationResult {
  vehicle: VehicleSpec;
  weightKg: number;
  distanceKm: number;
  baseFare: number;
  distanceCharge: number;
  weightCharge: number;
  serviceTax: number;
  totalDeliveryCost: number;
  estimatedDeliveryMinutes: number;
  formattedEta: string;
  assignedDriver: DriverInfo;
}

// Vehicle tiers database
export const VEHICLE_SPECS: Record<VehicleType, VehicleSpec> = {
  Bike: {
    type: 'Bike',
    maxWeightKg: 50,
    baseFare: 40,
    perKmRate: 8,
    avgSpeedKmH: 35,
    icon: 'two_wheeler',
    description: 'Express 2-Wheeler for light produce & small packages up to 50 kg.',
  },
  Auto: {
    type: 'Auto',
    maxWeightKg: 300,
    baseFare: 120,
    perKmRate: 15,
    avgSpeedKmH: 28,
    icon: 'electric_rickshaw',
    description: '3-Wheeler Loader suitable for crates & sacks up to 300 kg.',
  },
  'Bolero Pickup': {
    type: 'Bolero Pickup',
    maxWeightKg: 800,
    baseFare: 350,
    perKmRate: 25,
    avgSpeedKmH: 40,
    icon: 'local_shipping',
    description: '4-Wheel Mahindra Bolero Pickup ideal for medium farm harvests up to 800 kg.',
  },
  'Mini Truck': {
    type: 'Mini Truck',
    maxWeightKg: 3000,
    baseFare: 800,
    perKmRate: 45,
    avgSpeedKmH: 45,
    icon: 'fire_truck',
    description: 'Tata 407 / Eicher Mini Truck for commercial bulk loads up to 3 Tons.',
  },
  Lorry: {
    type: 'Lorry',
    maxWeightKg: 20000,
    baseFare: 2200,
    perKmRate: 85,
    avgSpeedKmH: 50,
    icon: 'directions_bus',
    description: 'Multi-Axle Heavy Lorry for interstate mandi transport & large crop yields.',
  },
};

// Available Drivers Pool
export const DRIVER_POOL: DriverInfo[] = [
  {
    id: 'd1',
    name: 'Suresh Kumar',
    phone: '+91 98490 88211',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 4.9,
    vehicleType: 'Bike',
    vehicleNumber: 'AP 07 BK 4821',
    currentLocation: 'Guntur Clock Tower (1.2 km away)',
    completedTrips: 342,
  },
  {
    id: 'd2',
    name: 'Murali Krishna',
    phone: '+91 94401 22930',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 4.8,
    vehicleType: 'Auto',
    vehicleNumber: 'AP 07 TA 1189',
    currentLocation: 'Tenali Market Yard (2.5 km away)',
    completedTrips: 512,
  },
  {
    id: 'd3',
    name: 'Venkat Subbaiah',
    phone: '+91 98663 44102',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4.95,
    vehicleType: 'Bolero Pickup',
    vehicleNumber: 'AP 07 PK 8892',
    currentLocation: 'Mangalagiri Bypass (3.1 km away)',
    completedTrips: 289,
  },
  {
    id: 'd4',
    name: 'Anil Reddy',
    phone: '+91 97012 33491',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    rating: 4.85,
    vehicleType: 'Mini Truck',
    vehicleNumber: 'AP 16 MT 5543',
    currentLocation: 'Vijayawada Auto Nagar (5.8 km away)',
    completedTrips: 178,
  },
  {
    id: 'd5',
    name: 'Koteswara Rao',
    phone: '+91 93910 99882',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    rating: 4.92,
    vehicleType: 'Lorry',
    vehicleNumber: 'AP 07 TR 9001',
    currentLocation: 'Prakasam Transport Hub (8.2 km away)',
    completedTrips: 640,
  },
];

/**
 * Determine required vehicle category based on weight
 */
export function getVehicleTypeByWeight(weightKg: number): VehicleType {
  if (weightKg <= 50) return 'Bike';
  if (weightKg <= 300) return 'Auto';
  if (weightKg <= 800) return 'Bolero Pickup';
  if (weightKg <= 3000) return 'Mini Truck';
  return 'Lorry';
}

/**
 * Calculate complete logistics breakdown
 */
export function calculateLogistics(
  weightKg: number,
  distanceKm: number = 12
): LogisticsCalculationResult {
  const safeWeight = Math.max(1, weightKg);
  const safeDistance = Math.max(1, distanceKm);

  const vehicleType = getVehicleTypeByWeight(safeWeight);
  const vehicle = VEHICLE_SPECS[vehicleType];

  const baseFare = vehicle.baseFare;
  const distanceCharge = Math.round(safeDistance * vehicle.perKmRate);
  const weightCharge = Math.round(safeWeight * 0.4); // ₹0.40 per kg handling
  const subtotal = baseFare + distanceCharge + weightCharge;
  const serviceTax = Math.round(subtotal * 0.05); // 5% GST
  const totalDeliveryCost = subtotal + serviceTax;

  // Travel time + 15 mins loading buffer
  const travelMinutes = Math.round((safeDistance / vehicle.avgSpeedKmH) * 60);
  const estimatedDeliveryMinutes = travelMinutes + 15;

  const hours = Math.floor(estimatedDeliveryMinutes / 60);
  const mins = estimatedDeliveryMinutes % 60;
  const formattedEta = hours > 0 ? `${hours} hr ${mins} mins` : `${mins} mins`;

  // Find assigned driver matching vehicle type, or fallback
  const driver =
    DRIVER_POOL.find((d) => d.vehicleType === vehicleType) || DRIVER_POOL[0];

  return {
    vehicle,
    weightKg: safeWeight,
    distanceKm: safeDistance,
    baseFare,
    distanceCharge,
    weightCharge,
    serviceTax,
    totalDeliveryCost,
    estimatedDeliveryMinutes,
    formattedEta,
    assignedDriver: driver,
  };
}
