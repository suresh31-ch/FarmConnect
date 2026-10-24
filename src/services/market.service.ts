/**
 * Market Price Analytics & APMC Mandi Prediction API Service
 */

export interface MandiPriceRecord {
  mandiName: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  predictedPrice7Days: number;
  advisory: 'SELL_NOW' | 'HOLD_PRODUCE' | 'NEUTRAL';
}

// TODO: Connect Agmarknet / APMC Real-time REST API

export async function fetchMarketPrices(cropName: string): Promise<MandiPriceRecord[]> {
  // TODO: GET /api/v1/market/prices?crop=${cropName}
  await new Promise((r) => setTimeout(r, 400));

  return [
    {
      mandiName: 'Guntur APMC Yard',
      district: 'Guntur',
      minPrice: 32,
      maxPrice: 42,
      modalPrice: 38,
      trend: 'UP',
      predictedPrice7Days: 44,
      advisory: 'HOLD_PRODUCE'
    },
    {
      mandiName: 'Vijayawada Wholesale Mandi',
      district: 'Krishna',
      minPrice: 30,
      maxPrice: 39,
      modalPrice: 36,
      trend: 'UP',
      predictedPrice7Days: 41,
      advisory: 'SELL_NOW'
    }
  ];
}
