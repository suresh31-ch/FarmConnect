/**
 * Real Gemini Vision Crop Doctor Service & Supabase Persistence
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ScanResult } from '../screens/ai/AiCropDoctor';

export interface CropAnalysisResponse {
  isCrop: boolean;
  isCropSupported?: boolean;
  unsupportedNotice?: string;
  isLowQuality?: boolean;
  isInconclusive?: boolean;
  cropName?: string;
  scientificName?: string;
  isHealthy?: boolean;
  diseaseName?: string;
  confidenceScore?: number;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'None';
  infectionAreaPercent?: number;
  infectionBox?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  healthScore?: number;
  observedVisualEvidence?: string[];
  cause?: string;
  symptoms?: string[];
  recommendedNextSteps?: string[];
  organicTreatment?: string[];
  chemicalTreatment?: string[];
  chemicalSafetyNotice?: string;
  expertConsultationAdvice?: string;
  nutrientTips?: string;
  nextIrrigationRecommendation?: string;
  fertilizerSuggestion?: string;
  pesticides?: string[];
  fertilizers?: string[];
  preventionTips?: string[];
  expectedRecovery?: string;
  costOfTreatment?: string;
  voiceSummaryEnglish?: string;
  voiceSummaryTelugu?: string;
  scanDate?: string;
  reportStatus?: string;
  fromCache?: boolean;
  modelUsed?: string;
}

export class CropDoctorError extends Error {
  category: 'QUOTA_EXHAUSTED' | 'RATE_LIMIT' | 'TIMEOUT' | 'INVALID_IMAGE' | 'INVALID_KEY' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN';
  canRetry: boolean;
  retryAfterSeconds?: number;
  statusCode: number;

  constructor(
    message: string,
    category: 'QUOTA_EXHAUSTED' | 'RATE_LIMIT' | 'TIMEOUT' | 'INVALID_IMAGE' | 'INVALID_KEY' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN' = 'UNKNOWN',
    canRetry: boolean = true,
    retryAfterSeconds?: number,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'CropDoctorError';
    this.category = category;
    this.canRetry = canRetry;
    this.retryAfterSeconds = retryAfterSeconds;
    this.statusCode = statusCode;
  }
}

const LOCAL_STORAGE_KEY = 'farmconnect_crop_scans_v3';

/**
 * Call server-side Express endpoint with Gemini Vision API
 */
export async function analyzeCropImageWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  selectedCrop?: string
): Promise<CropAnalysisResponse> {
  // 1. Client-Side Validation
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new CropDoctorError('Please select or capture a crop photograph first.', 'INVALID_IMAGE', false, undefined, 400);
  }

  const clean = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();
  if (clean.length < 50) {
    throw new CropDoctorError('Image data appears empty or corrupt. Please capture another image.', 'INVALID_IMAGE', false, undefined, 400);
  }

  // Set configurable client timeout (50s limit to support network latency gracefully)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);

  try {
    const res = await fetch('/api/crop-doctor/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, mimeType, selectedCrop }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const category = errorBody.category || (res.status === 429 ? 'RATE_LIMIT' : res.status === 504 ? 'TIMEOUT' : 'UNKNOWN');
      const message = errorBody.error || (
        res.status === 429
          ? 'AI service is temporarily busy due to request limits. Please wait a few moments and tap Retry Analysis.'
          : res.status === 504
          ? 'The AI diagnostic request timed out. Please tap Retry Analysis.'
          : 'Failed to analyze crop image. Please check image clarity and tap Retry Analysis.'
      );
      const retryAfter = errorBody.retryAfterSeconds;
      const canRetry = errorBody.canRetry !== undefined ? errorBody.canRetry : (res.status !== 429 || !errorBody.isQuotaError);

      throw new CropDoctorError(message, category, canRetry, retryAfter, res.status);
    }

    const data: CropAnalysisResponse = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof CropDoctorError) {
      throw err;
    }

    if (err?.name === 'AbortError') {
      throw new CropDoctorError(
        'The diagnosis request exceeded the allotted time limit (50 seconds). The crop photo is preserved — please tap Retry Analysis to try again.',
        'TIMEOUT',
        true,
        2,
        504
      );
    }

    const isNetwork = !navigator.onLine || /fetch|network|Failed to fetch/i.test(err?.message || '');
    throw new CropDoctorError(
      isNetwork
        ? 'Network communication failure. Please check your network connection and tap Retry Analysis.'
        : (err?.message || 'Unexpected diagnosis error occurred. Please tap Retry Analysis.'),
      isNetwork ? 'TIMEOUT' : 'UNKNOWN',
      true,
      2,
      500
    );
  }
}

/**
 * Save scan result into Supabase table 'crop_scans' and local persistent storage
 */
export async function saveScanToSupabaseAndLocal(scan: ScanResult): Promise<void> {
  // 1. Save to localStorage immediately
  try {
    const existing = getLocalScanHistory();
    const updated = [scan, ...existing.filter((s) => s.id !== scan.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  // 2. Save to Supabase 'crop_scans' table
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('crop_scans').upsert([
        {
          id: scan.id,
          crop_name: scan.cropName,
          scientific_name: scan.scientificName || '',
          disease_name: scan.diseaseName,
          is_healthy: scan.isHealthy,
          confidence_score: scan.confidenceScore,
          severity: scan.severity,
          infection_area_percent: scan.infectionAreaPercent || 0,
          health_score: scan.healthScore || 90,
          nutrient_tips: scan.nutrientTips || '',
          next_irrigation: scan.nextIrrigationRecommendation || '',
          fertilizer_suggestion: scan.fertilizerSuggestion || '',
          cause: scan.cause,
          symptoms: scan.symptoms,
          organic_treatment: scan.organicTreatment,
          chemical_treatment: scan.chemicalTreatment,
          pesticides: scan.pesticides,
          fertilizers: scan.fertilizers,
          prevention_tips: scan.preventionTips,
          expected_recovery: scan.expectedRecovery,
          cost_of_treatment: scan.costOfTreatment,
          farmer_name: scan.farmerName || 'Farmer',
          scanned_at: scan.scannedAt,
          image_url: scan.imageUrl,
        },
      ]);

      if (error) {
        console.warn('Supabase crop_scans table upsert notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase crop_scans save error:', err);
    }
  }
}

/**
 * Delete scan report from Supabase and local storage
 */
export async function deleteScanFromSupabaseAndLocal(scanId: string): Promise<void> {
  // 1. Remove from localStorage
  try {
    const existing = getLocalScanHistory();
    const updated = existing.filter((s) => s.id !== scanId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage delete warning:', err);
  }

  // 2. Delete from Supabase
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('crop_scans').delete().eq('id', scanId);
      if (error) {
        console.warn('Supabase delete scan notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase scan delete error:', err);
    }
  }
}

/**
 * Fetch scan history from Supabase table or local storage fallback
 */
export async function fetchScanHistory(): Promise<ScanResult[]> {
  const localScans = getLocalScanHistory();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('crop_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const remoteScans: ScanResult[] = data.map((d: any) => ({
          id: d.id || `scan-${Math.random().toString(36).substring(2, 7)}`,
          cropName: d.crop_name || 'Crop',
          scientificName: d.scientific_name || '',
          diseaseName: d.disease_name || 'Diagnosis Result',
          isHealthy: Boolean(d.is_healthy),
          confidenceScore: d.confidence_score || 95,
          severity: d.severity || (d.is_healthy ? 'None' : 'Moderate'),
          infectionAreaPercent: d.infection_area_percent || (d.is_healthy ? 0 : 25),
          infectionBox: { top: 25, left: 25, width: 50, height: 50 },
          healthScore: d.health_score || (d.is_healthy ? 98 : 60),
          nutrientTips: d.nutrient_tips || 'Foliar micro-nutrient spray during vegetative phase',
          nextIrrigationRecommendation: d.next_irrigation || 'Irrigate within 2-3 days based on soil moisture',
          fertilizerSuggestion: d.fertilizerSuggestion || 'Top dress with Neem Coated Urea @ 30kg/acre',
          cause: d.cause || 'Pathogen analysis complete',
          symptoms: d.symptoms || [],
          organicTreatment: d.organic_treatment || [],
          chemicalTreatment: d.chemical_treatment || [],
          pesticides: d.pesticides || [],
          fertilizers: d.fertilizers || [],
          preventionTips: d.prevention_tips || [],
          expectedRecovery: d.expected_recovery || '7-10 days',
          costOfTreatment: d.cost_of_treatment || '₹450 - ₹750 / acre',
          voiceSummaryEnglish: `${d.crop_name} diagnosis: ${d.disease_name}.`,
          voiceSummaryTelugu: `${d.crop_name} వ్యాధి నిర్ధారణ: ${d.disease_name}.`,
          nearbyOffice: {
            name: 'Krishi Vigyan Kendra (KVK) Regional Agricultural Center',
            distance: '3.8 km away',
            phone: '+91 863 2234120',
            officer: 'Dr. K. Srinivasa Rao (Senior Plant Pathologist)',
            googleMapsUrl: 'https://www.google.com/maps/search/Agriculture+Office+Krishi+Vigyan+Kendra+Fertilizer+Shop+near+me',
          },
          farmerName: d.farmer_name || 'Farmer',
          scannedAt: d.scanned_at || 'Recently',
          imageUrl: d.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
        }));

        // Merge remote & local deduplicated
        const merged = [...remoteScans];
        for (const local of localScans) {
          if (!merged.some((m) => m.id === local.id)) {
            merged.push(local);
          }
        }
        return merged;
      }
    } catch (err) {
      console.warn('Supabase scan history fetch error:', err);
    }
  }

  return localScans;
}

function getLocalScanHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }
  return [];
}
