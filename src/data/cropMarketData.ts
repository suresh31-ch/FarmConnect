export interface StatePrice {
  state: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DistrictPrice {
  district: string;
  price: number;
  arrivalTons: number;
}

export interface NearbyMarket {
  mandi: string;
  price: number;
  distance: string;
  state: string;
  district: string;
}

export interface TrendPoint {
  label: string;
  actual?: number;
  predicted: number;
}

export interface CropMarketItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices' | 'Oil Seeds' | 'Millets' | 'Cash Crops' | 'Organic';
  unit: 'quintal' | 'kg' | 'dozen';
  todayPrice: number;
  yesterdayPrice: number;
  weeklyTrendPercent: number;
  monthlyTrendPercent: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  forecastPrice7Days: number;
  forecastPrice30Days: number;
  confidencePercent: number;
  demandLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
  supplyLevel: 'Shortage' | 'Moderate' | 'Surplus';
  demandForecast: string;
  supplyForecast: string;
  aiRecommendation: 'Sell Today' | 'Hold' | 'Store';
  riskLevel: 'Low' | 'Medium' | 'High';
  bestMarket: string;
  expectedProfit: string;
  statePrices: StatePrice[];
  districtPrices: DistrictPrice[];
  nearbyMarkets: NearbyMarket[];
  trendHistory7Days: TrendPoint[];
  trendHistory30Days: TrendPoint[];
}

export const CROP_MARKET_DATABASE: CropMarketItem[] = [
  // 1. Paddy (Rice)
  {
    id: 'paddy',
    name: 'Paddy (Sonamasuri Raw Rice)',
    category: 'Grains',
    unit: 'quintal',
    todayPrice: 2250,
    yesterdayPrice: 2200,
    weeklyTrendPercent: 2.27,
    monthlyTrendPercent: 8.5,
    highestPrice: 2400,
    lowestPrice: 2100,
    averagePrice: 2220,
    forecastPrice7Days: 2400,
    forecastPrice30Days: 2650,
    confidencePercent: 94,
    demandLevel: 'High',
    supplyLevel: 'Moderate',
    demandForecast: 'Surging export demand to South East Asia and mill purchasing season.',
    supplyForecast: 'Arrivals steady in Andhra & Telangana mandis.',
    aiRecommendation: 'Hold',
    riskLevel: 'Low',
    bestMarket: 'Miryalaguda APMC Yard (Telangana)',
    expectedProfit: '₹180 - ₹250 per quintal additional profit if held for 10 days',
    statePrices: [
      { state: 'Andhra Pradesh', price: 2250, trend: 'up' },
      { state: 'Telangana', price: 2340, trend: 'up' },
      { state: 'Karnataka', price: 2210, trend: 'stable' },
      { state: 'Punjab', price: 2180, trend: 'down' }
    ],
    districtPrices: [
      { district: 'Guntur', price: 2250, arrivalTons: 420 },
      { district: 'Nalgonda', price: 2340, arrivalTons: 680 },
      { district: 'West Godavari', price: 2280, arrivalTons: 510 },
      { district: 'Raichur', price: 2210, arrivalTons: 390 }
    ],
    nearbyMarkets: [
      { mandi: 'Tenali Grain Market', price: 2250, distance: '6 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: 'Guntur Rice Mill Complex', price: 2290, distance: '18 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: 'Miryalaguda APMC', price: 2340, distance: '110 km', state: 'Telangana', district: 'Nalgonda' },
      { mandi: 'Nalgonda Paddy Yard', price: 2310, distance: '140 km', state: 'Telangana', district: 'Nalgonda' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 2180, predicted: 2180 },
      { label: 'Tue', actual: 2200, predicted: 2200 },
      { label: 'Wed', actual: 2210, predicted: 2210 },
      { label: 'Thu (Today)', actual: 2250, predicted: 2250 },
      { label: 'Fri', predicted: 2300 },
      { label: 'Sat', predicted: 2350 },
      { label: 'Sun', predicted: 2400 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 2100, predicted: 2100 },
      { label: 'Week 2', actual: 2180, predicted: 2180 },
      { label: 'Week 3 (Current)', actual: 2250, predicted: 2250 },
      { label: 'Week 4', predicted: 2400 },
      { label: 'Week 5', predicted: 2520 },
      { label: 'Week 6', predicted: 2650 }
    ]
  },

  // 2. Maize (Corn)
  {
    id: 'maize',
    name: 'Maize (Yellow Corn)',
    category: 'Grains',
    unit: 'quintal',
    todayPrice: 2150,
    yesterdayPrice: 2120,
    weeklyTrendPercent: 1.41,
    monthlyTrendPercent: 5.2,
    highestPrice: 2280,
    lowestPrice: 1980,
    averagePrice: 2100,
    forecastPrice7Days: 2220,
    forecastPrice30Days: 2380,
    confidencePercent: 91,
    demandLevel: 'High',
    supplyLevel: 'Moderate',
    demandForecast: 'High feed mill demand from poultry sector in Namakkal & Hyderabad.',
    supplyForecast: 'Kharif crop harvest picking momentum.',
    aiRecommendation: 'Hold',
    riskLevel: 'Low',
    bestMarket: 'Karimnagar Agriculture Market Yard',
    expectedProfit: '₹70 - ₹120 per quintal extra margin',
    statePrices: [
      { state: 'Telangana', price: 2180, trend: 'up' },
      { state: 'Andhra Pradesh', price: 2150, trend: 'up' },
      { state: 'Karnataka', price: 2120, trend: 'stable' },
      { state: 'Bihar', price: 2050, trend: 'stable' }
    ],
    districtPrices: [
      { district: 'Karimnagar', price: 2180, arrivalTons: 310 },
      { district: 'Khammam', price: 2160, arrivalTons: 280 },
      { district: 'Prakasam', price: 2150, arrivalTons: 220 },
      { district: 'Davanagere', price: 2120, arrivalTons: 400 }
    ],
    nearbyMarkets: [
      { mandi: 'Khammam Market Yard', price: 2160, distance: '85 km', state: 'Telangana', district: 'Khammam' },
      { mandi: 'Karimnagar APMC', price: 2180, distance: '190 km', state: 'Telangana', district: 'Karimnagar' },
      { mandi: 'Ongole Market', price: 2150, distance: '120 km', state: 'Andhra Pradesh', district: 'Prakasam' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 2100, predicted: 2100 },
      { label: 'Tue', actual: 2110, predicted: 2110 },
      { label: 'Wed', actual: 2120, predicted: 2120 },
      { label: 'Thu (Today)', actual: 2150, predicted: 2150 },
      { label: 'Fri', predicted: 2180 },
      { label: 'Sat', predicted: 2200 },
      { label: 'Sun', predicted: 2220 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 2020, predicted: 2020 },
      { label: 'Week 2', actual: 2100, predicted: 2100 },
      { label: 'Week 3 (Current)', actual: 2150, predicted: 2150 },
      { label: 'Week 4', predicted: 2220 },
      { label: 'Week 5', predicted: 2300 },
      { label: 'Week 6', predicted: 2380 }
    ]
  },

  // 3. Wheat
  {
    id: 'wheat',
    name: 'Wheat (Sharbati Premium)',
    category: 'Grains',
    unit: 'quintal',
    todayPrice: 2850,
    yesterdayPrice: 2820,
    weeklyTrendPercent: 1.06,
    monthlyTrendPercent: 4.8,
    highestPrice: 3100,
    lowestPrice: 2650,
    averagePrice: 2800,
    forecastPrice7Days: 2920,
    forecastPrice30Days: 3150,
    confidencePercent: 93,
    demandLevel: 'High',
    supplyLevel: 'Moderate',
    demandForecast: 'Flour mills actively purchasing ahead of festive demand.',
    supplyForecast: 'Central storage procurement balanced.',
    aiRecommendation: 'Store',
    riskLevel: 'Low',
    bestMarket: 'Indore APMC Yard (Madhya Pradesh)',
    expectedProfit: '₹200+ per quintal in 30 days',
    statePrices: [
      { state: 'Madhya Pradesh', price: 2950, trend: 'up' },
      { state: 'Punjab', price: 2820, trend: 'stable' },
      { state: 'Haryana', price: 2800, trend: 'stable' },
      { state: 'Uttar Pradesh', price: 2750, trend: 'stable' }
    ],
    districtPrices: [
      { district: 'Indore', price: 2950, arrivalTons: 850 },
      { district: 'Ludhiana', price: 2820, arrivalTons: 920 },
      { district: 'Karnal', price: 2800, arrivalTons: 640 },
      { district: 'Kanpur', price: 2750, arrivalTons: 710 }
    ],
    nearbyMarkets: [
      { mandi: 'Indore Mandi Hub', price: 2950, distance: '650 km', state: 'Madhya Pradesh', district: 'Indore' },
      { mandi: 'Khanna APMC Punjab', price: 2830, distance: '1400 km', state: 'Punjab', district: 'Ludhiana' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 2800, predicted: 2800 },
      { label: 'Tue', actual: 2810, predicted: 2810 },
      { label: 'Wed', actual: 2820, predicted: 2820 },
      { label: 'Thu (Today)', actual: 2850, predicted: 2850 },
      { label: 'Fri', predicted: 2870 },
      { label: 'Sat', predicted: 2890 },
      { label: 'Sun', predicted: 2920 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 2720, predicted: 2720 },
      { label: 'Week 2', actual: 2800, predicted: 2800 },
      { label: 'Week 3 (Current)', actual: 2850, predicted: 2850 },
      { label: 'Week 4', predicted: 2920 },
      { label: 'Week 5', predicted: 3020 },
      { label: 'Week 6', predicted: 3150 }
    ]
  },

  // 4. Cotton
  {
    id: 'cotton',
    name: 'Raw Cotton (Long Staple)',
    category: 'Cash Crops',
    unit: 'quintal',
    todayPrice: 7450,
    yesterdayPrice: 7300,
    weeklyTrendPercent: 2.05,
    monthlyTrendPercent: 6.8,
    highestPrice: 8200,
    lowestPrice: 6800,
    averagePrice: 7200,
    forecastPrice7Days: 7700,
    forecastPrice30Days: 8100,
    confidencePercent: 88,
    demandLevel: 'High',
    supplyLevel: 'Shortage',
    demandForecast: 'Textile mills in Gujarat & Tamil Nadu increasing purchase quotas.',
    supplyForecast: 'Inward arrival slowed due to dry spells in central belt.',
    aiRecommendation: 'Hold',
    riskLevel: 'Medium',
    bestMarket: 'Warangal Enamamula Market (Telangana)',
    expectedProfit: '₹250 - ₹400 per quintal extra gain',
    statePrices: [
      { state: 'Telangana', price: 7550, trend: 'up' },
      { state: 'Gujarat', price: 7480, trend: 'up' },
      { state: 'Maharashtra', price: 7380, trend: 'stable' },
      { state: 'Andhra Pradesh', price: 7450, trend: 'up' }
    ],
    districtPrices: [
      { district: 'Warangal', price: 7550, arrivalTons: 540 },
      { district: 'Rajkot', price: 7480, arrivalTons: 820 },
      { district: 'Adilabad', price: 7420, arrivalTons: 380 },
      { district: 'Guntur', price: 7450, arrivalTons: 290 }
    ],
    nearbyMarkets: [
      { mandi: 'Warangal Enamamula Yard', price: 7550, distance: '160 km', state: 'Telangana', district: 'Warangal' },
      { mandi: 'Adilabad Cotton Yard', price: 7420, distance: '320 km', state: 'Telangana', district: 'Adilabad' },
      { mandi: 'Guntur Cotton APMC', price: 7450, distance: '14 km', state: 'Andhra Pradesh', district: 'Guntur' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 7250, predicted: 7250 },
      { label: 'Tue', actual: 7280, predicted: 7280 },
      { label: 'Wed', actual: 7300, predicted: 7300 },
      { label: 'Thu (Today)', actual: 7450, predicted: 7450 },
      { label: 'Fri', predicted: 7520 },
      { label: 'Sat', predicted: 7600 },
      { label: 'Sun', predicted: 7700 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 6950, predicted: 6950 },
      { label: 'Week 2', actual: 7250, predicted: 7250 },
      { label: 'Week 3 (Current)', actual: 7450, predicted: 7450 },
      { label: 'Week 4', predicted: 7700 },
      { label: 'Week 5', predicted: 7900 },
      { label: 'Week 6', predicted: 8100 }
    ]
  },

  // 5. Sugarcane
  {
    id: 'sugarcane',
    name: 'Sugarcane (High Recovery Grade)',
    category: 'Cash Crops',
    unit: 'quintal',
    todayPrice: 380,
    yesterdayPrice: 375,
    weeklyTrendPercent: 1.33,
    monthlyTrendPercent: 3.5,
    highestPrice: 410,
    lowestPrice: 350,
    averagePrice: 372,
    forecastPrice7Days: 390,
    forecastPrice30Days: 415,
    confidencePercent: 95,
    demandLevel: 'High',
    supplyLevel: 'Moderate',
    demandForecast: 'Sugar factory crushing season in full swing; ethanol blending incentives.',
    supplyForecast: 'Crushing schedule well aligned with transport trucks.',
    aiRecommendation: 'Sell Today',
    riskLevel: 'Low',
    bestMarket: 'Cooperative Sugar Factory Gate / Mandi',
    expectedProfit: 'Direct mill rate + transport rebate included',
    statePrices: [
      { state: 'Maharashtra', price: 390, trend: 'up' },
      { state: 'Uttar Pradesh', price: 375, trend: 'stable' },
      { state: 'Karnataka', price: 385, trend: 'up' },
      { state: 'Andhra Pradesh', price: 380, trend: 'up' }
    ],
    districtPrices: [
      { district: 'Kolhapur', price: 395, arrivalTons: 2400 },
      { district: 'Mandya', price: 385, arrivalTons: 1800 },
      { district: 'Muzaffarnagar', price: 375, arrivalTons: 3100 },
      { district: 'Chittoor', price: 380, arrivalTons: 1200 }
    ],
    nearbyMarkets: [
      { mandi: 'Chittoor Sugar Complex', price: 380, distance: '180 km', state: 'Andhra Pradesh', district: 'Chittoor' },
      { mandi: 'Mandya APMC Yard', price: 385, distance: '380 km', state: 'Karnataka', district: 'Mandya' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 370, predicted: 370 },
      { label: 'Tue', actual: 372, predicted: 372 },
      { label: 'Wed', actual: 375, predicted: 375 },
      { label: 'Thu (Today)', actual: 380, predicted: 380 },
      { label: 'Fri', predicted: 383 },
      { label: 'Sat', predicted: 386 },
      { label: 'Sun', predicted: 390 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 360, predicted: 360 },
      { label: 'Week 2', actual: 370, predicted: 370 },
      { label: 'Week 3 (Current)', actual: 380, predicted: 380 },
      { label: 'Week 4', predicted: 390 },
      { label: 'Week 5', predicted: 400 },
      { label: 'Week 6', predicted: 415 }
    ]
  },

  // 6. Tomato
  {
    id: 'tomato',
    name: 'Tomato (Hybrid Grade A)',
    category: 'Vegetables',
    unit: 'kg',
    todayPrice: 38,
    yesterdayPrice: 32,
    weeklyTrendPercent: 18.75,
    monthlyTrendPercent: 42.0,
    highestPrice: 65,
    lowestPrice: 18,
    averagePrice: 34,
    forecastPrice7Days: 45,
    forecastPrice30Days: 52,
    confidencePercent: 92,
    demandLevel: 'Very High',
    supplyLevel: 'Shortage',
    demandForecast: 'High metro consumption in Hyderabad, Chennai & Bengaluru with reduced arrival.',
    supplyForecast: 'Unseasonal rains affected early harvest in Madanapalle belt.',
    aiRecommendation: 'Sell Today',
    riskLevel: 'Medium',
    bestMarket: 'Madanapalle Tomato Market Yard (Chittoor)',
    expectedProfit: '₹6 - ₹10 per kg higher than local retail procurement',
    statePrices: [
      { state: 'Andhra Pradesh', price: 38, trend: 'up' },
      { state: 'Karnataka', price: 42, trend: 'up' },
      { state: 'Telangana', price: 44, trend: 'up' },
      { state: 'Tamil Nadu', price: 46, trend: 'up' }
    ],
    districtPrices: [
      { district: 'Chittoor (Madanapalle)', price: 44, arrivalTons: 850 },
      { district: 'Kolar', price: 42, arrivalTons: 920 },
      { district: 'Guntur', price: 38, arrivalTons: 240 },
      { district: 'Ranga Reddy', price: 44, arrivalTons: 310 }
    ],
    nearbyMarkets: [
      { mandi: 'Guntur Vegetable Market', price: 38, distance: '12 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: 'Vijayawada Wholesale APMC', price: 41, distance: '34 km', state: 'Andhra Pradesh', district: 'Krishna' },
      { mandi: 'Madanapalle Tomato Hub', price: 44, distance: '210 km', state: 'Andhra Pradesh', district: 'Chittoor' },
      { mandi: 'Hyderabad Bowenpally', price: 46, distance: '280 km', state: 'Telangana', district: 'Hyderabad' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 28, predicted: 28 },
      { label: 'Tue', actual: 30, predicted: 30 },
      { label: 'Wed', actual: 32, predicted: 32 },
      { label: 'Thu (Today)', actual: 38, predicted: 38 },
      { label: 'Fri', predicted: 41 },
      { label: 'Sat', predicted: 43 },
      { label: 'Sun', predicted: 45 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 22, predicted: 22 },
      { label: 'Week 2', actual: 28, predicted: 28 },
      { label: 'Week 3 (Current)', actual: 38, predicted: 38 },
      { label: 'Week 4', predicted: 45 },
      { label: 'Week 5', predicted: 48 },
      { label: 'Week 6', predicted: 52 }
    ]
  },

  // 7. Potato
  {
    id: 'potato',
    name: 'Potato (Jyoti Variety)',
    category: 'Vegetables',
    unit: 'kg',
    todayPrice: 22,
    yesterdayPrice: 21,
    weeklyTrendPercent: 4.76,
    monthlyTrendPercent: 10.0,
    highestPrice: 28,
    lowestPrice: 15,
    averagePrice: 20,
    forecastPrice7Days: 24,
    forecastPrice30Days: 27,
    confidencePercent: 90,
    demandLevel: 'High',
    supplyLevel: 'Moderate',
    demandForecast: 'Cold storage dispatches steady; processing industry demand high.',
    supplyForecast: 'Fresh crop arrivals from Agra & Hooghly controlled.',
    aiRecommendation: 'Hold',
    riskLevel: 'Low',
    bestMarket: 'Agra APMC Cold Storage Belt',
    expectedProfit: '₹2 - ₹4 per kg extra if held for 2 weeks',
    statePrices: [
      { state: 'Uttar Pradesh', price: 20, trend: 'stable' },
      { state: 'West Bengal', price: 21, trend: 'up' },
      { state: 'Punjab', price: 19, trend: 'stable' },
      { state: 'Andhra Pradesh', price: 24, trend: 'up' }
    ],
    districtPrices: [
      { district: 'Agra', price: 20, arrivalTons: 1400 },
      { district: 'Hooghly', price: 21, arrivalTons: 1200 },
      { district: 'Jalandhar', price: 19, arrivalTons: 980 },
      { district: 'Kurnool', price: 23, arrivalTons: 180 }
    ],
    nearbyMarkets: [
      { mandi: 'Kurnool Market Yard', price: 23, distance: '190 km', state: 'Andhra Pradesh', district: 'Kurnool' },
      { mandi: 'Agra APMC Yard UP', price: 20, distance: '1200 km', state: 'Uttar Pradesh', district: 'Agra' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 19, predicted: 19 },
      { label: 'Tue', actual: 20, predicted: 20 },
      { label: 'Wed', actual: 21, predicted: 21 },
      { label: 'Thu (Today)', actual: 22, predicted: 22 },
      { label: 'Fri', predicted: 23 },
      { label: 'Sat', predicted: 23 },
      { label: 'Sun', predicted: 24 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 18, predicted: 18 },
      { label: 'Week 2', actual: 19, predicted: 19 },
      { label: 'Week 3 (Current)', actual: 22, predicted: 22 },
      { label: 'Week 4', predicted: 24 },
      { label: 'Week 5', predicted: 25 },
      { label: 'Week 6', predicted: 27 }
    ]
  },

  // 8. Onion
  {
    id: 'onion',
    name: 'Onion (Red Nashik Quality)',
    category: 'Vegetables',
    unit: 'kg',
    todayPrice: 34,
    yesterdayPrice: 30,
    weeklyTrendPercent: 13.33,
    monthlyTrendPercent: 28.0,
    highestPrice: 55,
    lowestPrice: 18,
    averagePrice: 28,
    forecastPrice7Days: 39,
    forecastPrice30Days: 46,
    confidencePercent: 94,
    demandLevel: 'Very High',
    supplyLevel: 'Shortage',
    demandForecast: 'Strong household and hotel sector demand across southern states.',
    supplyForecast: 'Lasalgaon arrivals decreased due to rain disruptions in Maharashtra.',
    aiRecommendation: 'Hold',
    riskLevel: 'Medium',
    bestMarket: 'Lasalgaon APMC (Asia Largest Onion Yard)',
    expectedProfit: '₹5 - ₹8 per kg extra profit expected',
    statePrices: [
      { state: 'Maharashtra', price: 32, trend: 'up' },
      { state: 'Karnataka', price: 34, trend: 'up' },
      { state: 'Andhra Pradesh', price: 35, trend: 'up' },
      { state: 'Telangana', price: 36, trend: 'up' }
    ],
    districtPrices: [
      { district: 'Nashik (Lasalgaon)', price: 32, arrivalTons: 1800 },
      { district: 'Kurnool', price: 34, arrivalTons: 620 },
      { district: 'Ahmednagar', price: 31, arrivalTons: 950 },
      { district: 'Guntur', price: 35, arrivalTons: 210 }
    ],
    nearbyMarkets: [
      { mandi: 'Guntur Vegetable Yard', price: 35, distance: '12 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: 'Kurnool Onion Yard', price: 34, distance: '190 km', state: 'Andhra Pradesh', district: 'Kurnool' },
      { mandi: 'Lasalgaon APMC Nashik', price: 32, distance: '780 km', state: 'Maharashtra', district: 'Nashik' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 27, predicted: 27 },
      { label: 'Tue', actual: 29, predicted: 29 },
      { label: 'Wed', actual: 30, predicted: 30 },
      { label: 'Thu (Today)', actual: 34, predicted: 34 },
      { label: 'Fri', predicted: 36 },
      { label: 'Sat', predicted: 38 },
      { label: 'Sun', predicted: 39 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 22, predicted: 22 },
      { label: 'Week 2', actual: 27, predicted: 27 },
      { label: 'Week 3 (Current)', actual: 34, predicted: 34 },
      { label: 'Week 4', predicted: 39 },
      { label: 'Week 5', predicted: 42 },
      { label: 'Week 6', predicted: 46 }
    ]
  },

  // 9. Chilli
  {
    id: 'chilli',
    name: 'Dry Red Chilli (Teja / S17)',
    category: 'Spices',
    unit: 'quintal',
    todayPrice: 18500,
    yesterdayPrice: 19200,
    weeklyTrendPercent: -3.64,
    monthlyTrendPercent: 12.0,
    highestPrice: 22000,
    lowestPrice: 16000,
    averagePrice: 18800,
    forecastPrice7Days: 17800,
    forecastPrice30Days: 17200,
    confidencePercent: 89,
    demandLevel: 'Moderate',
    supplyLevel: 'Surplus',
    demandForecast: 'Oleoresin exporter demand stable; cold storage stock release started.',
    supplyForecast: 'High market arrivals in Guntur & Khammam yards.',
    aiRecommendation: 'Sell Today',
    riskLevel: 'High',
    bestMarket: 'Guntur Mirchi Yard (Asia Largest Spice Yard)',
    expectedProfit: 'Sell immediately before price declines further by ₹700/qtl',
    statePrices: [
      { state: 'Andhra Pradesh', price: 18500, trend: 'down' },
      { state: 'Telangana', price: 18200, trend: 'down' },
      { state: 'Karnataka', price: 18900, trend: 'stable' },
      { state: 'Madhya Pradesh', price: 17800, trend: 'down' }
    ],
    districtPrices: [
      { district: 'Guntur', price: 18500, arrivalTons: 1200 },
      { district: 'Khammam', price: 18200, arrivalTons: 850 },
      { district: 'Warangal', price: 18100, arrivalTons: 640 },
      { district: 'Dharwad (Byadgi)', price: 18900, arrivalTons: 710 }
    ],
    nearbyMarkets: [
      { mandi: 'Guntur Chili Market Yard', price: 18500, distance: '14 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: 'Khammam Agricultural Market', price: 18200, distance: '95 km', state: 'Telangana', district: 'Khammam' },
      { mandi: 'Byadgi Spice Market', price: 18900, distance: '480 km', state: 'Karnataka', district: 'Dharwad' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 19800, predicted: 19800 },
      { label: 'Tue', actual: 19400, predicted: 19400 },
      { label: 'Wed', actual: 19200, predicted: 19200 },
      { label: 'Thu (Today)', actual: 18500, predicted: 18500 },
      { label: 'Fri', predicted: 18100 },
      { label: 'Sat', predicted: 17900 },
      { label: 'Sun', predicted: 17800 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 20200, predicted: 20200 },
      { label: 'Week 2', actual: 19800, predicted: 19800 },
      { label: 'Week 3 (Current)', actual: 18500, predicted: 18500 },
      { label: 'Week 4', predicted: 17800 },
      { label: 'Week 5', predicted: 17400 },
      { label: 'Week 6', predicted: 17200 }
    ]
  },

  // 10. Brinjal (Eggplant)
  {
    id: 'brinjal',
    name: 'Brinjal (Purple Green Striped)',
    category: 'Vegetables',
    unit: 'kg',
    todayPrice: 28,
    yesterdayPrice: 26,
    weeklyTrendPercent: 7.69,
    monthlyTrendPercent: 16.0,
    highestPrice: 38,
    lowestPrice: 16,
    averagePrice: 25,
    forecastPrice7Days: 31,
    forecastPrice30Days: 35,
    confidencePercent: 88,
    demandLevel: 'Moderate',
    supplyLevel: 'Moderate',
    demandForecast: 'Steady local retail vegetable market sales.',
    supplyForecast: 'Normal local harvest from peri-urban farms.',
    aiRecommendation: 'Hold',
    riskLevel: 'Low',
    bestMarket: 'Vijayawada Wholesale APMC',
    expectedProfit: '₹3 - ₹5 per kg gain expected',
    statePrices: [
      { state: 'Andhra Pradesh', price: 28, trend: 'up' },
      { state: 'Telangana', price: 29, trend: 'up' },
      { state: 'Karnataka', price: 26, trend: 'stable' }
    ],
    districtPrices: [
      { district: 'Krishna', price: 29, arrivalTons: 120 },
      { district: 'Guntur', price: 28, arrivalTons: 150 },
      { district: 'Khammam', price: 27, arrivalTons: 90 }
    ],
    nearbyMarkets: [
      { mandi: 'Vijayawada Wholesale APMC', price: 29, distance: '32 km', state: 'Andhra Pradesh', district: 'Krishna' },
      { mandi: 'Guntur Veg Market', price: 28, distance: '12 km', state: 'Andhra Pradesh', district: 'Guntur' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: 24, predicted: 24 },
      { label: 'Tue', actual: 25, predicted: 25 },
      { label: 'Wed', actual: 26, predicted: 26 },
      { label: 'Thu (Today)', actual: 28, predicted: 28 },
      { label: 'Fri', predicted: 29 },
      { label: 'Sat', predicted: 30 },
      { label: 'Sun', predicted: 31 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: 22, predicted: 22 },
      { label: 'Week 2', actual: 24, predicted: 24 },
      { label: 'Week 3 (Current)', actual: 28, predicted: 28 },
      { label: 'Week 4', predicted: 31 },
      { label: 'Week 5', predicted: 33 },
      { label: 'Week 6', predicted: 35 }
    ]
  }
];

// Helper to generate remaining 42+ crops procedurally so every crop requested is fully functional
const MORE_CROPS_RAW: Array<{ id: string; name: string; category: CropMarketItem['category']; unit: CropMarketItem['unit']; today: number; range: [number, number] }> = [
  { id: 'cabbage', name: 'Cabbage (Green Head)', category: 'Vegetables', unit: 'kg', today: 18, range: [12, 28] },
  { id: 'cauliflower', name: 'Cauliflower (Snowball)', category: 'Vegetables', unit: 'kg', today: 26, range: [18, 42] },
  { id: 'carrot', name: 'Carrot (Red Ooty)', category: 'Vegetables', unit: 'kg', today: 42, range: [28, 65] },
  { id: 'beans', name: 'Beans (French Cluster)', category: 'Vegetables', unit: 'kg', today: 48, range: [30, 80] },
  { id: 'peas', name: 'Green Peas (Matar)', category: 'Vegetables', unit: 'kg', today: 62, range: [40, 110] },
  { id: 'okra', name: 'Okra / Lady Finger (Bhendi)', category: 'Vegetables', unit: 'kg', today: 32, range: [20, 50] },
  { id: 'cucumber', name: 'Cucumber (Green Hybrid)', category: 'Vegetables', unit: 'kg', today: 22, range: [14, 35] },
  { id: 'bottlegourd', name: 'Bottle Gourd (Lauki)', category: 'Vegetables', unit: 'kg', today: 19, range: [12, 30] },
  { id: 'bittergourd', name: 'Bitter Gourd (Karela)', category: 'Vegetables', unit: 'kg', today: 38, range: [25, 58] },
  { id: 'pumpkin', name: 'Pumpkin (Yellow Kaddu)', category: 'Vegetables', unit: 'kg', today: 16, range: [10, 24] },
  { id: 'ridgegourd', name: 'Ridge Gourd (Torai)', category: 'Vegetables', unit: 'kg', today: 34, range: [22, 52] },
  { id: 'drumstick', name: 'Drumstick (Moringa Pods)', category: 'Vegetables', unit: 'kg', today: 55, range: [32, 90] },
  { id: 'spinach', name: 'Spinach (Palak)', category: 'Vegetables', unit: 'kg', today: 25, range: [15, 40] },
  { id: 'coriander', name: 'Coriander Leaves (Dhaniya)', category: 'Spices', unit: 'kg', today: 65, range: [35, 120] },
  { id: 'mint', name: 'Mint Leaves (Pudina)', category: 'Vegetables', unit: 'kg', today: 45, range: [25, 80] },

  // Fruits
  { id: 'banana', name: 'Banana (Grand Naine)', category: 'Fruits', unit: 'dozen', today: 45, range: [30, 70] },
  { id: 'mango', name: 'Mango (Banganapalli / Alphonso)', category: 'Fruits', unit: 'kg', today: 85, range: [50, 140] },
  { id: 'papaya', name: 'Papaya (Red Lady)', category: 'Fruits', unit: 'kg', today: 24, range: [15, 38] },
  { id: 'guava', name: 'Guava (Taiwan Pink)', category: 'Fruits', unit: 'kg', today: 42, range: [25, 65] },
  { id: 'orange', name: 'Orange (Nagpur Mandarin)', category: 'Fruits', unit: 'kg', today: 58, range: [38, 90] },
  { id: 'lemon', name: 'Lemon (Acid Lime)', category: 'Fruits', unit: 'kg', today: 68, range: [40, 120] },
  { id: 'watermelon', name: 'Watermelon (Kiran Striped)', category: 'Fruits', unit: 'kg', today: 16, range: [10, 26] },
  { id: 'muskmelon', name: 'Muskmelon (Kharbooza)', category: 'Fruits', unit: 'kg', today: 28, range: [18, 42] },
  { id: 'pomegranate', name: 'Pomegranate (Bhagwa Red)', category: 'Fruits', unit: 'kg', today: 120, range: [80, 180] },
  { id: 'apple', name: 'Apple (Royal Delicious)', category: 'Fruits', unit: 'kg', today: 140, range: [90, 210] },

  // Oil Seeds & Cash Crops
  { id: 'coconut', name: 'Coconut (Tender / Dry Nut)', category: 'Cash Crops', unit: 'dozen', today: 180, range: [120, 240] },
  { id: 'groundnut', name: 'Groundnut (Peanut in Shell)', category: 'Oil Seeds', unit: 'quintal', today: 6250, range: [5200, 7100] },
  { id: 'sunflower', name: 'Sunflower Seed', category: 'Oil Seeds', unit: 'quintal', today: 4850, range: [4100, 5600] },
  { id: 'soybean', name: 'Soybean (Yellow)', category: 'Oil Seeds', unit: 'quintal', today: 4600, range: [3900, 5200] },

  // Pulses
  { id: 'blackgram', name: 'Black Gram (Urad Dal)', category: 'Pulses', unit: 'quintal', today: 8200, range: [7100, 9500] },
  { id: 'greengram', name: 'Green Gram (Moong Dal)', category: 'Pulses', unit: 'quintal', today: 8600, range: [7400, 9800] },
  { id: 'redgram', name: 'Red Gram (Toor / Arhar)', category: 'Pulses', unit: 'quintal', today: 9400, range: [8200, 11200] },
  { id: 'bengalgram', name: 'Bengal Gram (Chana)', category: 'Pulses', unit: 'quintal', today: 6100, range: [5200, 7100] },

  // Spices & Commercial
  { id: 'turmeric', name: 'Turmeric (Salem Finger)', category: 'Spices', unit: 'quintal', today: 14200, range: [11000, 16800] },
  { id: 'ginger', name: 'Ginger (Fresh Green)', category: 'Spices', unit: 'kg', today: 75, range: [45, 120] },
  { id: 'coffee', name: 'Coffee Beans (Arabica)', category: 'Cash Crops', unit: 'quintal', today: 28500, range: [22000, 34000] },
  { id: 'tea', name: 'Tea Leaves (Nilgiri CTC)', category: 'Cash Crops', unit: 'kg', today: 180, range: [130, 240] },

  // Millets
  { id: 'millets', name: 'Foxtail Millet (Korra)', category: 'Millets', unit: 'quintal', today: 3400, range: [2800, 4100] },
  { id: 'jowar', name: 'Jowar (Sorghum White)', category: 'Millets', unit: 'quintal', today: 3100, range: [2500, 3800] },
  { id: 'bajra', name: 'Bajra (Pearl Millet)', category: 'Millets', unit: 'quintal', today: 2450, range: [1900, 2900] },
  { id: 'ragi', name: 'Ragi (Finger Millet)', category: 'Millets', unit: 'quintal', today: 3600, range: [2900, 4300] },

  // Organic
  { id: 'organic_wheat', name: 'Organic Bansi Wheat', category: 'Organic', unit: 'quintal', today: 4200, range: [3400, 4900] }
];

// Combine base crops with generated items to form 52 total crops
MORE_CROPS_RAW.forEach((c) => {
  const yest = Math.round(c.today * (0.95 + Math.random() * 0.08));
  const weeklyTrend = Number((((c.today - yest) / yest) * 100).toFixed(2));
  const monthlyTrend = Number((weeklyTrend * 2.5).toFixed(1));
  const fc7 = Math.round(c.today * (1 + (weeklyTrend > 0 ? 0.08 : -0.05)));
  const fc30 = Math.round(c.today * (1 + (weeklyTrend > 0 ? 0.16 : -0.09)));

  const isUp = weeklyTrend >= 0;
  const rec: CropMarketItem['aiRecommendation'] = isUp ? (weeklyTrend > 5 ? 'Sell Today' : 'Hold') : 'Store';

  CROP_MARKET_DATABASE.push({
    id: c.id,
    name: c.name,
    category: c.category,
    unit: c.unit,
    todayPrice: c.today,
    yesterdayPrice: yest,
    weeklyTrendPercent: weeklyTrend,
    monthlyTrendPercent: monthlyTrend,
    highestPrice: c.range[1],
    lowestPrice: c.range[0],
    averagePrice: Math.round((c.range[0] + c.range[1]) / 2),
    forecastPrice7Days: fc7,
    forecastPrice30Days: fc30,
    confidencePercent: 88 + Math.floor(Math.random() * 8),
    demandLevel: isUp ? 'High' : 'Moderate',
    supplyLevel: isUp ? 'Shortage' : 'Surplus',
    demandForecast: `Strong purchasing demand recorded in key urban consumption hubs for ${c.name}.`,
    supplyForecast: `Regional supply stream balanced with steady arrival volumes.`,
    aiRecommendation: rec,
    riskLevel: isUp ? 'Low' : 'Medium',
    bestMarket: `Major Regional APMC Yard (${c.name})`,
    expectedProfit: `₹${Math.round(c.today * 0.08)} - ₹${Math.round(c.today * 0.15)} extra margin per ${c.unit}`,
    statePrices: [
      { state: 'Andhra Pradesh', price: c.today, trend: isUp ? 'up' : 'down' },
      { state: 'Telangana', price: Math.round(c.today * 1.03), trend: isUp ? 'up' : 'stable' },
      { state: 'Karnataka', price: Math.round(c.today * 0.98), trend: 'stable' },
      { state: 'Maharashtra', price: Math.round(c.today * 1.02), trend: isUp ? 'up' : 'down' }
    ],
    districtPrices: [
      { district: 'Guntur', price: c.today, arrivalTons: 180 },
      { district: 'Nalgonda', price: Math.round(c.today * 1.02), arrivalTons: 220 },
      { district: 'Kurnool', price: Math.round(c.today * 0.97), arrivalTons: 140 },
      { district: 'Krishna', price: Math.round(c.today * 1.01), arrivalTons: 195 }
    ],
    nearbyMarkets: [
      { mandi: `Regional Wholesale APMC Yard`, price: c.today, distance: '15 km', state: 'Andhra Pradesh', district: 'Guntur' },
      { mandi: `Central District Market`, price: Math.round(c.today * 1.03), distance: '45 km', state: 'Andhra Pradesh', district: 'Krishna' },
      { mandi: `Metro Consumer Terminal`, price: Math.round(c.today * 1.06), distance: '120 km', state: 'Telangana', district: 'Hyderabad' }
    ],
    trendHistory7Days: [
      { label: 'Mon', actual: Math.round(c.today * 0.92), predicted: Math.round(c.today * 0.92) },
      { label: 'Tue', actual: Math.round(c.today * 0.94), predicted: Math.round(c.today * 0.94) },
      { label: 'Wed', actual: yest, predicted: yest },
      { label: 'Thu (Today)', actual: c.today, predicted: c.today },
      { label: 'Fri', predicted: Math.round(c.today * 1.02) },
      { label: 'Sat', predicted: Math.round(c.today * 1.05) },
      { label: 'Sun', predicted: fc7 }
    ],
    trendHistory30Days: [
      { label: 'Week 1', actual: Math.round(c.today * 0.88), predicted: Math.round(c.today * 0.88) },
      { label: 'Week 2', actual: Math.round(c.today * 0.94), predicted: Math.round(c.today * 0.94) },
      { label: 'Week 3 (Current)', actual: c.today, predicted: c.today },
      { label: 'Week 4', predicted: fc7 },
      { label: 'Week 5', predicted: Math.round(c.today * 1.1) },
      { label: 'Week 6', predicted: fc30 }
    ]
  });
});
