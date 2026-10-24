export interface FertilizerEntry {
  stage: string;
  dayNumber: number;
  dosage: string;
  instructions: string;
}

export interface PestAlert {
  pestName: string;
  symptoms: string;
  threshold: string;
  treatment: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DiseaseInfo {
  diseaseName: string;
  symptoms?: string;
  preventiveAction: string;
  recommendedSpray: string;
  favorableConditions: string;
}

export interface IrrigationDetail {
  method: string;
  frequency: string;
  waterRequirement: string;
  criticalStages: string[];
}

export interface HarvestDetail {
  maturityIndicators: string[];
  postHarvestTip: string;
  expectedYieldPerAcre: string;
}

export interface TimelineStage {
  stageName: string;
  startDay: number;
  endDay: number;
  description: string;
  icon: string;
  badgeColor: string;
}

export interface CropCatalogItem {
  id: string;
  name: string;
  category: 'Cereals & Grains' | 'Vegetables' | 'Commercial Cash Crops' | 'Fruits' | 'Spices & Condiments' | 'Oilseeds' | 'Millets' | 'Pulses';
  icon: string;
  color: string; // e.g. emerald, amber, rose, sky, purple, orange
  bgHeader: string;
  defaultVariety: string;
  totalDays: number;
  durationDisplay: string;
  dailyReminders: string[];
  fertilizerSchedule: FertilizerEntry[];
  irrigationSchedule: IrrigationDetail;
  pestAlerts: PestAlert[];
  diseasePrevention: DiseaseInfo[];
  harvestReminder: HarvestDetail;
  timelineStages: TimelineStage[];
}

export const CROP_CATALOG: CropCatalogItem[] = [
  {
    id: 'paddy',
    name: 'Paddy (Rice / వరి)',
    category: 'Cereals & Grains',
    icon: '🌾',
    color: 'emerald',
    bgHeader: 'from-emerald-900 via-teal-900 to-green-950',
    defaultVariety: 'BPT 5204 (Sonamasuri)',
    totalDays: 125,
    durationDisplay: '125 Days (~4 Months)',
    dailyReminders: [
      'Maintain 2-inch standing water layer in flooded paddy basin.',
      'Check lower leaf sheath for stem borer egg masses in early morning.',
      'Inspect field borders for weed proliferation and drainage channel blocks.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose (Sowing)', dayNumber: 1, dosage: '50kg DAP + 25kg MOP + 10kg Zinc Sulphate per acre', instructions: 'Mix thoroughly into soil during final puddle plowing.' },
      { stage: 'Tillering Top Dressing', dayNumber: 25, dosage: '35kg Urea + 5kg Bio-Zinc', instructions: 'Apply in shallow standing water when tillering reaches 8-10 shoots.' },
      { stage: 'Panicle Initiation', dayNumber: 60, dosage: '35kg Urea + 15kg MOP (Potash)', instructions: 'Apply after draining field slightly; refill water next day.' },
      { stage: 'Grain Filling Foliar', dayNumber: 85, dosage: 'NPK 00-00-50 (10g/L) + Boron (1g/L)', instructions: 'Foliar spray during milky grain stage for plump heavy grains.' }
    ],
    irrigationSchedule: {
      method: 'Alternate Wetting & Drying (AWD)',
      frequency: 'Keep 2-5 cm water until 10 days before harvest.',
      waterRequirement: '1200 - 1400 mm total water depth',
      criticalStages: ['Transplanting', 'Active Tillering', 'Panicle Initiation', 'Flowering & Milking']
    },
    pestAlerts: [
      { pestName: 'Yellow Stem Borer', symptoms: 'Dead hearts in tillering stage & white heads at grain formation.', threshold: '5% dead hearts or 1 moth per m²', treatment: 'Apply Cartap Hydrochloride 4G granules @ 7.5 kg/acre in standing water.', severity: 'High' },
      { pestName: 'Brown Plant Hopper (BPH)', symptoms: 'Hopper burn patches (drying of plants in circular rings).', threshold: '5-10 hoppers per hill', treatment: 'Spray Pymetrozine 50% WG @ 120g/acre targeting lower plant bases.', severity: 'Critical' }
    ],
    diseasePrevention: [
      { diseaseName: 'Paddy Blast (Pyricularia oryzae)', preventiveAction: 'Soak seeds in Carbendazim 2g/kg solution for 12 hrs before sowing.', recommendedSpray: 'Spray Tricyclazole 75% WP @ 0.6g/L water at first leaf spot appearance.', favorableConditions: 'Cool nights (20-24°C) with high humidity >90% and heavy dew.' },
      { diseaseName: 'Sheath Blight', preventiveAction: 'Avoid excessive nitrogenous fertilizer application.', recommendedSpray: 'Hexaconazole 5% EC @ 2ml/L water at tillering base.', favorableConditions: 'Warm humid weather with dense crop canopy.' }
    ],
    harvestReminder: {
      maturityIndicators: ['85-90% of panicles turn golden yellow', 'Grains in lower panicle reach hard dough stage', 'Grain moisture drops to 20-22%'],
      postHarvestTip: 'Drain field 10 days before harvest. Sun dry threshed grain on clean tarpaulin to achieve 12-14% moisture level.',
      expectedYieldPerAcre: '28 - 34 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery & Germination', startDay: 1, endDay: 20, description: 'Seed soaked treatment, bed preparation, and 20-day nursery growth.', icon: 'grass', badgeColor: 'emerald' },
      { stageName: 'Transplanting & Rooting', startDay: 21, endDay: 35, description: 'Main field puddle plowing, seedling transplanting with 20x15cm spacing.', icon: 'nature_people', badgeColor: 'teal' },
      { stageName: 'Active Tillering', startDay: 36, endDay: 65, description: 'Rapid tillering growth, first top dressing nitrogen dose application.', icon: 'potted_plant', badgeColor: 'green' },
      { stageName: 'Panicle Initiation & Flowering', startDay: 66, endDay: 95, description: 'Flag leaf emergence, panicle formation, and blossom flowering phase.', icon: 'local_florist', badgeColor: 'lime' },
      { stageName: 'Grain Filling & Maturation', startDay: 96, endDay: 115, description: 'Milky stage converts to dough stage; panicles turn golden yellow.', icon: 'grain', badgeColor: 'amber' },
      { stageName: 'Harvest & Threshing', startDay: 116, endDay: 125, description: 'Field draining, combine harvester operation, threshing, and bagging.', icon: 'agriculture', badgeColor: 'orange' }
    ]
  },
  {
    id: 'maize',
    name: 'Maize (Corn / జొన్న/మొక్కజొన్న)',
    category: 'Cereals & Grains',
    icon: '🌽',
    color: 'amber',
    bgHeader: 'from-amber-900 via-yellow-900 to-orange-950',
    defaultVariety: 'DHM 117 / Pioneer 3396',
    totalDays: 100,
    durationDisplay: '100 Days (~3.5 Months)',
    dailyReminders: [
      'Inspect whorls for early Fall Armyworm frass and leaf windowing.',
      'Check ridge soil moisture to ensure roots stay firmly anchored.',
      'Remove excess sucker tillers at base of plants.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '40kg DAP + 20kg MOP + 10kg Zinc Sulphate per acre', instructions: 'Place fertilizer 5cm deeper than seed line during ridge sowing.' },
      { stage: 'Knee High Stage (25 Days)', dayNumber: 25, dosage: '35kg Urea + 10kg Magnesium Sulphate', instructions: 'Side dress along rows and earth up soil to support stalks.' },
      { stage: 'Tasseling & Silking Stage', dayNumber: 50, dosage: '30kg Urea + 15kg MOP', instructions: 'Apply under adequate soil moisture before cob emergence.' }
    ],
    irrigationSchedule: {
      method: 'Ridge & Furrow / Drip Irrigation',
      frequency: 'Irrigate every 6-8 days in sandy soils, 10 days in clay.',
      waterRequirement: '500 - 600 mm total',
      criticalStages: ['Germination', 'Knee-High Stage', 'Tasseling', 'Silking & Grain Filling']
    },
    pestAlerts: [
      { pestName: 'Fall Armyworm (Spodoptera frugiperda)', symptoms: 'Ragged holes in whorl leaves with sawdust-like fecal matter.', threshold: '10% whorl damage in young crop', treatment: 'Spray Emamectin Benzoate 5% SG @ 0.4g/L directly into whorl funnel.', severity: 'Critical' }
    ],
    diseasePrevention: [
      { diseaseName: 'Turcicum Leaf Blight', symptoms: 'Long spindle-shaped grayish-green elliptical lesions on leaves.', preventiveAction: 'Use resistant hybrid seeds.', recommendedSpray: 'Mancozeb 75% WP @ 2.5g/L or Azoxystrobin @ 1ml/L at first sign.', favorableConditions: 'Warm humid conditions with moderate temperature (20-28°C).' }
    ],
    harvestReminder: {
      maturityIndicators: ['Husk covers turn dry pale brown', 'Black layer forms at base of grain kernel', 'Grain moisture falls below 18%'],
      postHarvestTip: 'Shell cobs using maize thresher and dry grains to 12% moisture for long term storage.',
      expectedYieldPerAcre: '30 - 38 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Sowing & Germination', startDay: 1, endDay: 12, description: 'Seed planting on ridges with 60x20cm spacing.', icon: 'eco', badgeColor: 'amber' },
      { stageName: 'Knee-High Vegetative', startDay: 13, endDay: 40, description: 'Stalk elongation, earthing up, and top dressing fertilizer application.', icon: 'height', badgeColor: 'yellow' },
      { stageName: 'Tasseling & Silking', startDay: 41, endDay: 65, description: 'Male tassel and female silk emergence; pollination critical stage.', icon: 'spa', badgeColor: 'orange' },
      { stageName: 'Cob Development & Milking', startDay: 66, endDay: 85, description: 'Kernel filling stage; sweet milk turns to firm starch.', icon: 'dataset', badgeColor: 'lime' },
      { stageName: 'Harvest & Cob Drying', startDay: 86, endDay: 100, description: 'Cob picking, husk removal, solar drying, and mechanical shelling.', icon: 'inventory_2', badgeColor: 'emerald' }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton (పత్తి)',
    category: 'Commercial Cash Crops',
    icon: '🧶',
    color: 'teal',
    bgHeader: 'from-teal-900 via-cyan-950 to-slate-950',
    defaultVariety: 'Bt Cotton (RCH 659 BG II)',
    totalDays: 160,
    durationDisplay: '160 Days (~5.5 Months)',
    dailyReminders: [
      'Install yellow sticky traps (10/acre) to monitor whiteflies and thrips.',
      'Check terminal squares for sucking pest damage and bollworm eggs.',
      'Drain stagnant rainwater immediately after heavy downpours.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '50kg DAP + 25kg MOP + 100kg Neem Cake', instructions: 'Apply along furrows during seed planting.' },
      { stage: 'Vegetative Top Dressing', dayNumber: 30, dosage: '30kg Urea + 15kg Potash', instructions: 'Side dress along root zone followed by light irrigation.' },
      { stage: 'Squaring & Flowering', dayNumber: 60, dosage: '30kg Urea + 15kg Potash + Boron Spray', instructions: 'Foliar spray Boron 20% @ 1g/L to enhance boll setting.' },
      { stage: 'Boll Development', dayNumber: 90, dosage: 'NPK 13-0-45 (10g/L) Foliar Spray', instructions: 'Spray twice at 15-day interval for big heavy bolls.' }
    ],
    irrigationSchedule: {
      method: 'Drip Irrigation with Fertigation',
      frequency: 'Irrigate every 4-5 days during square and boll formation.',
      waterRequirement: '700 - 800 mm total',
      criticalStages: ['Seedling Emergence', 'Square Formation', 'Peak Flowering', 'Boll Development']
    },
    pestAlerts: [
      { pestName: 'Pink Bollworm (Pectinophora gossypiella)', symptoms: 'Rosette flowers, unopen bolls with entry holes and lint staining.', threshold: '8 moths/trap/night for 3 consecutive days', treatment: 'Install Pheromone traps @ 8/acre; Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L.', severity: 'Critical' },
      { pestName: 'Whitefly & Leaf Curl Virus Vector', symptoms: 'Sooty mold on leaves, crinkling and leaf curling upwards.', threshold: '5-8 whiteflies per leaf', treatment: 'Spray Diafenthiuron 50% WP @ 1.25g/L or Afidopyropen 50 g/L DC @ 2ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Bacterial Leaf Blight / Angular Leaf Spot', preventiveAction: 'Delint seeds with acid and treat with Streptocycline @ 0.1g/L.', recommendedSpray: 'Copper Oxychloride 50% WP @ 3g/L + Streptocycline @ 0.1g/L.', favorableConditions: 'Continuous humid rainy spells with winds.' }
    ],
    harvestReminder: {
      maturityIndicators: ['80% of mature bolls open fluffy white', 'Boll husk dries completely'],
      postHarvestTip: 'Pick cotton after morning dew evaporates. Store in dry well-ventilated rooms to prevent fiber yellowing.',
      expectedYieldPerAcre: '12 - 16 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Sowing & Germination', startDay: 1, endDay: 15, description: 'Dibbling seeds at 90x60cm spacing with soil soaking.', icon: 'nature', badgeColor: 'teal' },
      { stageName: 'Vegetative Branching', startDay: 16, endDay: 45, description: 'Monopodial and sympodial branch development.', icon: 'park', badgeColor: 'emerald' },
      { stageName: 'Square (Bud) Formation', startDay: 46, endDay: 75, description: 'Flower bud emergence; critical sucking pest management.', icon: 'filter_vintage', badgeColor: 'cyan' },
      { stageName: 'Flowering & Boll Setting', startDay: 76, endDay: 120, description: 'Peak bloom and green boll formation.', icon: 'wb_sunny', badgeColor: 'amber' },
      { stageName: 'Boll Bursting & Picking', startDay: 121, endDay: 160, description: 'Fluffy white cotton boll opening and 3-stage manual picking.', icon: 'dry_cleaning', badgeColor: 'slate' }
    ]
  },
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut / వేరుశనగ)',
    category: 'Oilseeds',
    icon: '🥜',
    color: 'orange',
    bgHeader: 'from-orange-950 via-amber-900 to-yellow-950',
    defaultVariety: 'Kadiri 6 (K-6) / TAG 24',
    totalDays: 105,
    durationDisplay: '105 Days (~3.5 Months)',
    dailyReminders: [
      'Check soil friability to ensure pegs penetrate smoothly into earth.',
      'DO NOT disturb soil around roots after peg initiation (Day 40+).',
      'Inspect lower leaves for Tikka leaf spot lesions.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '20kg Nitrogen + 40kg P2O5 + 40kg K2O + 200kg Gypsum per acre', instructions: 'Gypsum provides essential Calcium and Sulphur for solid pod filling.' },
      { stage: 'Pegging Stage Gypsum Application', dayNumber: 40, dosage: '200kg Gypsum per acre broadcast near root zone', instructions: 'Incorporate gently before pegging starts; essential for pop-free pods.' }
    ],
    irrigationSchedule: {
      method: 'Sprinkler / Micro-jet Irrigation',
      frequency: 'Irrigate every 7-10 days depending on soil texture.',
      waterRequirement: '450 - 500 mm total',
      criticalStages: ['Flowering', 'Peg Penetration', 'Pod Development']
    },
    pestAlerts: [
      { pestName: 'Red Hairy Caterpillar', symptoms: 'Defoliation of entire field in early vegetative stage.', threshold: 'First appearance of caterpillars', treatment: 'Dust Methyl Parathion 2% @ 10kg/acre or spray Quinalphos 25% EC @ 2ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Tikka Leaf Spot (Cercospora)', symptoms: 'Dark brown circular spots surrounded by yellow halo on leaves.', preventiveAction: 'Seed treatment with Trichoderma viride @ 10g/kg seed.', recommendedSpray: 'Spray Mancozeb 75% WP @ 2g/L + Carbendazim @ 1g/L.', favorableConditions: 'Warm humid rainy weather with prolonged wet leaves.' }
    ],
    harvestReminder: {
      maturityIndicators: ['70-80% of leaves turn yellow and drop', 'Inner shell of pods turns dark brown/black', 'Kernels turn pinkish white'],
      postHarvestTip: 'Dry vines in small heaps for 3 days, strip pods, and dry pods under sun until moisture reaches <8%.',
      expectedYieldPerAcre: '14 - 18 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Sowing & Germination', startDay: 1, endDay: 12, description: 'Seed treatment with Rhizobium culture and sowing at 30x10cm.', icon: 'eco', badgeColor: 'amber' },
      { stageName: 'Vegetative & Branching', startDay: 13, endDay: 35, description: 'Branching and root nodule nitrogen fixation.', icon: 'forest', badgeColor: 'green' },
      { stageName: 'Flowering & Peg Initiation', startDay: 36, endDay: 55, description: 'Yellow flower blooms and peg geotropic entry into soil.', icon: 'psychology', badgeColor: 'orange' },
      { stageName: 'Pod Formation & Filling', startDay: 56, endDay: 85, description: 'Subterranean pod growth and kernel maturation.', icon: 'grain', badgeColor: 'amber' },
      { stageName: 'Harvest & Pod Drying', startDay: 86, endDay: 105, description: 'Uprooting plants, pod stripping, and sun drying.', icon: 'wb_cloudy', badgeColor: 'yellow' }
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato (టమోటా)',
    category: 'Vegetables',
    icon: '🍅',
    color: 'rose',
    bgHeader: 'from-rose-950 via-red-900 to-amber-950',
    defaultVariety: 'Arka Rakshak F1 / Saaho',
    totalDays: 90,
    durationDisplay: '90 Days (~3 Months)',
    dailyReminders: [
      'Inspect flowers for blossom end rot and spray calcium nitrate if spotted.',
      'Check drip lines for uniform discharge and clean filters.',
      'Harvest pink ripe fruits in early morning hours to preserve shelf life.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '50kg DAP + 30kg Potash + 10 Ton Farmyard Manure', instructions: 'Mix in raised beds before mulch sheet laying.' },
      { stage: 'Vegetative Growth (Weekly)', dayNumber: 15, dosage: 'Fertigation with NPK 19-19-19 @ 3kg/acre twice a week', instructions: 'Run fertigation through drip lines.' },
      { stage: 'Flowering & Fruit Set', dayNumber: 35, dosage: 'Calcium Nitrate (3kg/acre) + Boron (500g/acre) Fertigation', instructions: 'Prevents flower drop and blossom end rot.' },
      { stage: 'Peak Harvesting', dayNumber: 60, dosage: 'NPK 00-00-50 @ 4kg/acre per week', instructions: 'Imparts bright red color and firm skin.' }
    ],
    irrigationSchedule: {
      method: 'Drip Irrigation with Silver Mulching Sheet',
      frequency: 'Daily 1-2 hours depending on evaporation rates.',
      waterRequirement: '400 - 500 mm total',
      criticalStages: ['Transplanting', 'Flowering', 'Fruit Set', 'Peak Harvesting']
    },
    pestAlerts: [
      { pestName: 'Tomato Pinworm (Tuta absoluta)', symptoms: 'Punctures and blotch leaf mines with frass inside fruit stems.', threshold: '1 larva or leaf mine per plant', treatment: 'Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L or Spinotoram 11.7% SC @ 0.8ml/L.', severity: 'Critical' },
      { pestName: 'Fruit Borer (Helicoverpa armigera)', symptoms: 'Circular holes bored into fruits.', threshold: '1 bored fruit per 20 plants', treatment: 'Spray Flubendiamide 480% SC @ 0.2ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Early Blight (Alternaria solani)', symptoms: 'Concentric rings (target spot appearance) on lower leaves.', preventiveAction: 'Avoid overhead sprinkler irrigation.', recommendedSpray: 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L.', favorableConditions: 'Warm temperatures (24-29°C) with high humidity.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Fruits reach breaker/pink stage for long distance transport', 'Deep red for local markets'],
      postHarvestTip: 'Grade by size and color, pack in ventilated plastic crates, and keep in shade.',
      expectedYieldPerAcre: '25 - 35 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery & Seedling', startDay: 1, endDay: 25, description: 'Pro-tray nursery growth using cocopeat in shade net house.', icon: 'eco', badgeColor: 'emerald' },
      { stageName: 'Transplanting & Staking', startDay: 26, endDay: 40, description: 'Drip bed transplanting, bamboo staking, and twine tying.', icon: 'format_line_spacing', badgeColor: 'rose' },
      { stageName: 'Flowering & Fruit Setting', startDay: 41, endDay: 60, description: 'Abundant blooming, foliar calcium spray, and green fruit set.', icon: 'local_florist', badgeColor: 'amber' },
      { stageName: 'Fruit Maturation & Color Break', startDay: 61, endDay: 75, description: 'Green fruits turn breaker pink stage with potash fertigation.', icon: 'palette', badgeColor: 'orange' },
      { stageName: 'Multiple Pickings & Market', startDay: 76, endDay: 90, description: 'Harvesting every 3 days; sorting, grading, and crate packing.', icon: 'shopping_basket', badgeColor: 'red' }
    ]
  },
  {
    id: 'chilli',
    name: 'Chilli (మిర్చి / ఎండుమిర్చి)',
    category: 'Spices & Condiments',
    icon: '🌶️',
    color: 'rose',
    bgHeader: 'from-red-950 via-rose-900 to-amber-950',
    defaultVariety: 'Teja G4 / LCA 334',
    totalDays: 120,
    durationDisplay: '120 Days (~4 Months)',
    dailyReminders: [
      'Monitor undersides of young leaves for thrips (boat-shaped leaf curl).',
      'Blue sticky traps (15/acre) for thrips and yellow traps (10/acre) for whiteflies.',
      'Remove virus-infected stunted plants promptly to prevent vector spread.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '40kg DAP + 30kg Potash + 25kg Neem Cake + 10kg Zinc per acre', instructions: 'Apply in main field furrows prior to transplanting.' },
      { stage: 'Vegetative Fertigation', dayNumber: 20, dosage: 'NPK 19-19-19 @ 3kg/acre twice weekly', instructions: 'Promotes vigorous branching and thick canopy.' },
      { stage: 'Flowering & Pod Burst', dayNumber: 50, dosage: 'Calcium Nitrate (3kg) + Boron (500g) + NPK 12-61-0 (3kg)', instructions: 'Enhances pungency, pod length, and bloom retention.' }
    ],
    irrigationSchedule: {
      method: 'Drip Irrigation with fertigation',
      frequency: 'Irrigate every 2-3 days; avoid moisture stress during flowering.',
      waterRequirement: '500 - 600 mm total',
      criticalStages: ['Transplanting', 'Vegetative Branching', 'Flowering', 'Pod Development']
    },
    pestAlerts: [
      { pestName: 'Chilli Thrips (Scirtothrips dorsalis)', symptoms: 'Upward curling of leaves, crinkling, and silvering on underside.', threshold: '2 thrips per leaf', treatment: 'Spray Spinetoram 11.7% SC @ 0.8ml/L or Fipronil 5% SC @ 2ml/L.', severity: 'Critical' },
      { pestName: 'Mites (Polyphagotarsonemus latus)', symptoms: 'Downward curling of leaves (inverted boat shape) with brittle thick leaves.', threshold: '5 mites per leaf', treatment: 'Spray Spiromesifen 22.9% SC @ 1ml/L or Abamectin 1.9% EC @ 0.5ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Chilli Anthracnose / Fruit Rot (Colletotrichum)', symptoms: 'Circular sunken dark spots on ripe fruits with black concentric rings.', preventiveAction: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg.', recommendedSpray: 'Spray Pyraclostrobin 20% WG @ 1g/L or Azoxystrobin @ 1ml/L.', favorableConditions: 'High humidity (>80%) with intermittent warm rains.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Green pods for fresh market, fully deep red for dry red chilli'],
      postHarvestTip: 'Dry red chillies on clean cement poly-floors under sun until pod moisture drops to <10%.',
      expectedYieldPerAcre: '20 - 25 Quintals Dry Red Chilli per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery Development', startDay: 1, endDay: 35, description: 'Shade net nursery seedling raising with bio-pesticide drenched roots.', icon: 'eco', badgeColor: 'emerald' },
      { stageName: 'Transplanting & Rooting', startDay: 36, endDay: 50, description: 'Transplanting at 60x45cm spacing on mulched drip beds.', icon: 'nature_people', badgeColor: 'teal' },
      { stageName: 'Active Branching & Flowering', startDay: 51, endDay: 80, description: 'Profuse branching, blue trap setup, and fruit set.', icon: 'filter_vintage', badgeColor: 'rose' },
      { stageName: 'Pod Filling & Reddening', startDay: 81, endDay: 105, description: 'Green chillies turn dark glossy crimson red.', icon: 'wb_sunny', badgeColor: 'amber' },
      { stageName: 'Harvest & Solar Drying', startDay: 106, endDay: 120, description: 'Multiple pickings, solar court drying, and moisture test.', icon: 'wb_cloudy', badgeColor: 'red' }
    ]
  },
  {
    id: 'onion',
    name: 'Onion (ఉల్లిపాయ)',
    category: 'Vegetables',
    icon: '🧅',
    color: 'purple',
    bgHeader: 'from-purple-950 via-fuchsia-900 to-indigo-950',
    defaultVariety: 'Agrifound Dark Red / Bhima Super',
    totalDays: 110,
    durationDisplay: '110 Days (~3.5 Months)',
    dailyReminders: [
      'Check neck area for thrips infestation (silvery patches on leaves).',
      'Keep field free of weeds during early bulb development.',
      'Stop irrigation 15 days before harvesting to harden bulb skins.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '30kg N + 50kg P2O5 + 50kg K2O + 20kg Sulphur per acre', instructions: 'Sulphur is mandatory for pungent aroma and shiny bulb coat.' },
      { stage: 'Bulb Initiation (30 Days)', dayNumber: 30, dosage: '30kg Nitrogen + 10kg Sulphur per acre', instructions: 'Apply along rows before light irrigation.' }
    ],
    irrigationSchedule: {
      method: 'Micro-sprinkler or Drip',
      frequency: 'Irrigate every 5-7 days depending on soil type.',
      waterRequirement: '350 - 450 mm total',
      criticalStages: ['Establishment', 'Bulb Initiation', 'Bulb Development']
    },
    pestAlerts: [
      { pestName: 'Onion Thrips (Thrips tabaci)', symptoms: 'Silvery white blotches on leaves, leaf tip drying.', threshold: '20 thrips per plant', treatment: 'Spray Carbosulfan 25% EC @ 2ml/L or Fipronil 5% SC @ 1.5ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Purple Blotch (Alternaria porri)', symptoms: 'Purple oval lesions on foliage with yellow halo.', preventiveAction: 'Crop rotation and field sanitation.', recommendedSpray: 'Mancozeb 75% WP @ 2.5g/L or Difenoconazole @ 1ml/L.', favorableConditions: 'Warm humid weather with frequent rain/fog.' }
    ],
    harvestReminder: {
      maturityIndicators: ['50% of plant tops fall down naturally (Neck Fall)', 'Bulbs turn dark red with firm outer scales'],
      postHarvestTip: 'Cure bulbs in shade with leaves attached for 10 days before topping and storage.',
      expectedYieldPerAcre: '12 - 16 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery & Sowing', startDay: 1, endDay: 40, description: 'Raised bed nursery seedling growth.', icon: 'grass', badgeColor: 'purple' },
      { stageName: 'Transplanting & Rooting', startDay: 41, endDay: 55, description: 'Flat bed or ridge transplanting at 15x10cm spacing.', icon: 'grid_view', badgeColor: 'indigo' },
      { stageName: 'Bulb Swelling & Development', startDay: 56, endDay: 90, description: 'Rapid underground bulb expansion with Sulphur top dressing.', icon: 'panorama_fish_eye', badgeColor: 'fuchsia' },
      { stageName: 'Neck Fall & Maturation', startDay: 91, endDay: 105, description: 'Natural foliage collapse and bulb skin color deepens.', icon: 'south', badgeColor: 'rose' },
      { stageName: 'Harvest & Field Curing', startDay: 106, endDay: 110, description: 'Uprooting, shade curing, top cutting, and grading.', icon: 'inventory', badgeColor: 'slate' }
    ]
  },
  {
    id: 'potato',
    name: 'Potato (బంగాళాదుంప)',
    category: 'Vegetables',
    icon: '🥔',
    color: 'yellow',
    bgHeader: 'from-amber-950 via-yellow-900 to-amber-900',
    defaultVariety: 'Kufri Pukhraj / Kufri Jyoti',
    totalDays: 90,
    durationDisplay: '90 Days (~3 Months)',
    dailyReminders: [
      'Inspect ridges for exposed tubers and re-earth immediately to prevent greening.',
      'Check under foliage for late blight water-soaked spots during foggy morning conditions.',
      'Monitor soil moisture to prevent tuber cracking.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '60kg DAP + 50kg Potash + 10 Ton FYM per acre', instructions: 'Mix in ridges during seed tuber planting.' },
      { stage: 'Earthing Up (30 Days)', dayNumber: 30, dosage: '45kg Urea per acre broadcast on ridges', instructions: 'Earth up soil to build thick protective ridges over tubers.' }
    ],
    irrigationSchedule: {
      method: 'Furrow Irrigation / Drip',
      frequency: 'Irrigate every 7 days; stop 10 days before harvest.',
      waterRequirement: '400 - 500 mm total',
      criticalStages: ['Stolon Formation', 'Tuber Initiation', 'Tuber Bulking']
    },
    pestAlerts: [
      { pestName: 'Potato Aphids & Whiteflies', symptoms: 'Sucking sap from young shoots, vector for mosaic viruses.', threshold: '20 aphids per 100 leaves', treatment: 'Spray Imidacloprid 17.8% SL @ 0.5ml/L or Thiamethoxam 25% WG @ 0.3g/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Late Blight (Phytophthora infestans)', symptoms: 'Water-soaked irregular brown lesions on leaf margins with white mildew underneath.', preventiveAction: 'Spray Mancozeb @ 2.5g/L preventively before fog season.', recommendedSpray: 'Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L or Dimethomorph @ 1g/L.', favorableConditions: 'Low temp (10-20°C) with RH >90% and foggy conditions.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Foliar vines turn yellow and dry up', 'Tuber skin becomes firm and doesn\'t peel when rubbed'],
      postHarvestTip: 'Dehaulm (cut tops) 12 days before digging to harden tuber skin. Cure tubers in cool dark shed.',
      expectedYieldPerAcre: '12 - 15 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Seed Planting & Sprouting', startDay: 1, endDay: 15, description: 'Placing sprouted tubers in ridges at 50x20cm.', icon: 'spa', badgeColor: 'amber' },
      { stageName: 'Stolon & Tuber Initiation', startDay: 16, endDay: 40, description: 'Root stolon branching and earthing up ridge construction.', icon: 'expand', badgeColor: 'yellow' },
      { stageName: 'Rapid Tuber Bulking', startDay: 41, endDay: 70, description: 'Underground tuber swelling; critical moisture phase.', icon: 'circle', badgeColor: 'lime' },
      { stageName: 'Dehaulming & Skin Hardening', startDay: 71, endDay: 85, description: 'Cutting top foliage to harden tuber skin underground.', icon: 'content_cut', badgeColor: 'orange' },
      { stageName: 'Digging & Grading', startDay: 86, endDay: 90, description: 'Tuber digging, soil cleaning, size grading, and cold storage bagging.', icon: 'agriculture', badgeColor: 'emerald' }
    ]
  },
  {
    id: 'brinjal',
    name: 'Brinjal (Eggplant / వంకాయ)',
    category: 'Vegetables',
    icon: '🍆',
    color: 'purple',
    bgHeader: 'from-purple-950 via-indigo-900 to-purple-900',
    defaultVariety: 'Arka Navneet / Pusa Purple Long',
    totalDays: 120,
    durationDisplay: '120 Days (~4 Months)',
    dailyReminders: [
      'Clip and burn wilting shoot tips infested with shoot borer.',
      'Inspect fruit surface for exit holes and frass.',
      'Harvest glossy medium-sized fruits before seeds harden.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '40kg DAP + 25kg Potash + 10kg Zinc per acre', instructions: 'Mix in planting beds during transplanting.' },
      { stage: 'Top Dressing 1', dayNumber: 30, dosage: '25kg Urea + 15kg Potash', instructions: 'Apply along root line after weeding.' },
      { stage: 'Peak Harvesting Stage', dayNumber: 60, dosage: 'NPK 19-19-19 foliar spray @ 5g/L every fortnight', instructions: 'Sustains continuous blooming and shiny fruit coat.' }
    ],
    irrigationSchedule: {
      method: 'Drip or Ridge Furrow',
      frequency: 'Irrigate every 3-4 days in summer, 7 days in winter.',
      waterRequirement: '500 - 600 mm total',
      criticalStages: ['Transplanting', 'Flowering', 'Fruit Development']
    },
    pestAlerts: [
      { pestName: 'Brinjal Shoot & Fruit Borer (Leucinodes orbonalis)', symptoms: 'Drooping/wilted terminal shoots and circular holes in fruits with excreted frass.', threshold: '5% damaged shoots/fruits', treatment: 'Clip wilted shoots; Spray Chlorantraniliprole 18.5% SC @ 0.4ml/L or Emamectin Benzoate @ 0.4g/L.', severity: 'Critical' }
    ],
    diseasePrevention: [
      { diseaseName: 'Little Leaf of Brinjal (Phytoplasma)', symptoms: 'Extremely small bushy green leaves with no fruit set.', preventiveAction: 'Control leafhopper insect vector.', recommendedSpray: 'Rogor (Dimethoate 30% EC) @ 2ml/L and rogue out infected plants.', favorableConditions: 'Warm weather promoting leafhopper population.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Fruits reach full size with glossy tender skin', 'Seeds inside remain soft and white'],
      postHarvestTip: 'Harvest with pedicel (stem) attached using sharp secateurs. Store in cool shade.',
      expectedYieldPerAcre: '15 - 20 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery Growth', startDay: 1, endDay: 30, description: 'Raising healthy seedlings in nursery beds.', icon: 'eco', badgeColor: 'purple' },
      { stageName: 'Transplanting', startDay: 31, endDay: 45, description: 'Transplanting at 75x60cm spacing.', icon: 'nature_people', badgeColor: 'indigo' },
      { stageName: 'Branching & Blooming', startDay: 46, endDay: 70, description: 'Profuse vegetative growth and purple flowers.', icon: 'local_florist', badgeColor: 'fuchsia' },
      { stageName: 'Fruit Set & Continuous Picking', startDay: 71, endDay: 120, description: 'Weekly fruit pickings for 2-3 months continuously.', icon: 'shopping_bag', badgeColor: 'violet' }
    ]
  },
  {
    id: 'banana',
    name: 'Banana (అరటి)',
    category: 'Fruits',
    icon: '🍌',
    color: 'yellow',
    bgHeader: 'from-yellow-950 via-amber-900 to-lime-950',
    defaultVariety: 'Grand Naine (G9 Tissue Culture)',
    totalDays: 300,
    durationDisplay: '300 Days (~10 Months)',
    dailyReminders: [
      'Remove excess suckers (desuckering) keeping only 1 main Pseudostem.',
      'Check leaves for Sigatoka dark brown streaks; prune infected lower leaves.',
      'Provide wooden or bamboo propping support to heavy flowering bunches.'
    ],
    fertilizerSchedule: [
      { stage: 'Month 2 (Establishment)', dayNumber: 60, dosage: '100g Urea + 100g Single Super Phosphate + 100g Potash per plant', instructions: 'Ring application 30cm away from stem base.' },
      { stage: 'Month 4 (Vegetative Peak)', dayNumber: 120, dosage: '150g Urea + 150g Potash per plant', instructions: 'Incorporate into soil and water immediately.' },
      { stage: 'Month 7 (Bunch Shooting)', dayNumber: 210, dosage: '100g Urea + 200g Potash + 25g Boron per plant', instructions: 'Crucial for long bunch hands and big plump fingers.' }
    ],
    irrigationSchedule: {
      method: 'Drip Irrigation (2 Emitters per plant)',
      frequency: 'Daily 15-20 Liters per plant depending on evapotranspiration.',
      waterRequirement: '1800 - 2000 mm total water',
      criticalStages: ['Shooting Phase', 'Bunch Emergence', 'Finger Development']
    },
    pestAlerts: [
      { pestName: 'Banana Stem Weevil (Odoiporus longicollis)', symptoms: 'Jelly exudation on pseudostem with small pinholes.', threshold: 'Presence of holes/jelly on stem', treatment: 'Stem injection of Chlorpyrifos 20% EC @ 2ml/L or pouch application.', severity: 'Critical' }
    ],
    diseasePrevention: [
      { diseaseName: 'Sigatoka Leaf Spot (Mycosphaerella)', symptoms: 'Spindle-shaped dark brown yellow-bordered spots on foliage.', preventiveAction: 'Prune and destroy affected lower leaves.', recommendedSpray: 'Spray Propiconazole 25% EC @ 1ml/L + Mineral oil 10ml/L.', favorableConditions: 'High humidity (>80%) with warm temperatures (25-30°C).' }
    ],
    harvestReminder: {
      maturityIndicators: ['Angles on banana fingers turn rounded and smooth', 'Top leaves start drying naturally', '75-80% maturity for long distance shipping'],
      postHarvestTip: 'Cut bunches with 30cm stalk left. Cover bunch with blue polythene sleeve during growth to prevent thrips blemishes.',
      expectedYieldPerAcre: '35 - 45 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Planting & Establishment', startDay: 1, endDay: 60, description: 'Tissue culture plantlet planting in 45cm pits at 1.8x1.8m.', icon: 'nature', badgeColor: 'yellow' },
      { stageName: 'Grand Vegetative Growth', startDay: 61, endDay: 180, description: 'Rapid leaf emergence and pseudostem girth expansion.', icon: 'nature_people', badgeColor: 'lime' },
      { stageName: 'Bunch Shooting & Flowering', startDay: 181, endDay: 230, description: 'Inflorescence emergence from top crown and heart removal.', icon: 'local_florist', badgeColor: 'amber' },
      { stageName: 'Bunch Development & Propping', startDay: 231, endDay: 280, description: 'Finger filling and double-bamboo pole support setup.', icon: 'align_vertical_bottom', badgeColor: 'orange' },
      { stageName: 'Bunch Harvesting & De-handing', startDay: 281, endDay: 300, description: 'Harvesting mature bunches, washing in alum tank, and crate packing.', icon: 'shopping_bag', badgeColor: 'emerald' }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (చెరకు)',
    category: 'Commercial Cash Crops',
    icon: '🎋',
    color: 'emerald',
    bgHeader: 'from-emerald-950 via-green-900 to-teal-950',
    defaultVariety: 'Co 0238 / Co 86032',
    totalDays: 360,
    durationDisplay: '360 Days (~12 Months)',
    dailyReminders: [
      'Inspect cane base for early shoot borer dead hearts.',
      'Perform earthing-up and cane tying (trash wrapping) at Month 5.',
      'Check irrigation furrows for soil erosion.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '50kg DAP + 30kg Potash + 10kg Zinc per acre', instructions: 'Place in furrows before setts planting.' },
      { stage: '45 Days Top Dressing', dayNumber: 45, dosage: '45kg Urea + 15kg Potash', instructions: 'Side dress along furrows.' },
      { stage: '90 Days Earthing Up', dayNumber: 90, dosage: '45kg Urea + 25kg Potash', instructions: 'Earth up soil converting furrows to ridges.' }
    ],
    irrigationSchedule: {
      method: 'Alternate Furrow / Drip Fertigation',
      frequency: 'Irrigate every 8-10 days in formative phase, 12-15 days in maturity.',
      waterRequirement: '1500 - 2000 mm total',
      criticalStages: ['Germination', 'Formative Phase', 'Grand Growth']
    },
    pestAlerts: [
      { pestName: 'Early Shoot Borer (Chilo infuscatellus)', symptoms: 'Dead hearts in young crop (1-3 months old) that pull out easily.', threshold: '15% dead hearts', treatment: 'Soil drenching with Chlorantraniliprole 18.5% SC @ 150ml/acre or Cartap 4G.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Red Rot (Colletotrichum falcatum)', symptoms: 'Red discoloration inside stalk tissue with white transverse bands and sour smell.', preventiveAction: 'Setts treatment with Carbendazim @ 2g/L water for 15 mins.', recommendedSpray: 'Use certified disease-free seed setts and avoid waterlogging.', favorableConditions: 'Waterlogged conditions during monsoon.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Brix reading on hand refractometer reaches 18-20%', 'Cane leaves turn yellow and dry naturally'],
      postHarvestTip: 'Harvest close to ground level using sharp cane knives. Transport to sugar mill within 24 hours to avoid sucrose loss.',
      expectedYieldPerAcre: '45 - 60 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Sett Planting & Germination', startDay: 1, endDay: 45, description: '3-bud sett planting in furrows with soil cover.', icon: 'eco', badgeColor: 'emerald' },
      { stageName: 'Tillering Phase', startDay: 46, endDay: 120, description: 'Profuse tiller shoot production.', icon: 'potted_plant', badgeColor: 'teal' },
      { stageName: 'Grand Growth Phase', startDay: 121, endDay: 270, description: 'Rapid internode formation, stalk lengthening, and trash wrapping.', icon: 'height', badgeColor: 'green' },
      { stageName: 'Ripening & Sucrose Accumulation', startDay: 271, endDay: 340, description: 'Sugar synthesis and accumulation in cane stalks.', icon: 'wb_sunny', badgeColor: 'lime' },
      { stageName: 'Cane Cutting & Mill Supply', startDay: 341, endDay: 360, description: 'Ground-level cane cutting, leaf stripping, and factory supply.', icon: 'local_shipping', badgeColor: 'amber' }
    ]
  },
  {
    id: 'turmeric',
    name: 'Turmeric (పసుపు)',
    category: 'Spices & Condiments',
    icon: '🌿',
    color: 'amber',
    bgHeader: 'from-amber-950 via-yellow-900 to-orange-950',
    defaultVariety: 'Prathibha / Duggirala',
    totalDays: 240,
    durationDisplay: '240 Days (~8 Months)',
    dailyReminders: [
      'Maintain thick paddy straw mulch layer on beds to retain moisture.',
      'Check for rhizome rot symptoms (leaf yellowing from margins inwards).',
      'Ensure raised beds have clear drainage channels for monsoon rains.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '25kg N + 50kg P2O5 + 40kg K2O + 10 Ton FYM + 100kg Neem Cake per acre', instructions: 'Mix in raised beds before mother rhizome planting.' },
      { stage: '45 Days Top Dressing', dayNumber: 45, dosage: '25kg Urea + 20kg Potash', instructions: 'Apply along bed margins and cover with soil/mulch.' },
      { stage: '90 Days Top Dressing', dayNumber: 90, dosage: '25kg Urea + 20kg Potash', instructions: 'Apply during second earthing-up phase.' }
    ],
    irrigationSchedule: {
      method: 'Raised Bed Drip or Ridge Irrigation',
      frequency: 'Irrigate every 5-7 days; critical during rhizome initiation.',
      waterRequirement: '700 - 900 mm total',
      criticalStages: ['Rhizome Germination', 'Rhizome Initiation', 'Rhizome Swelling']
    },
    pestAlerts: [
      { pestName: 'Rhizome Scale & Shoot Borer', symptoms: 'Shoots wilt and turn yellow; scales infestation on rhizomes.', threshold: 'First appearance of shoot wilting', treatment: 'Drench soil with Chlorpyrifos 20% EC @ 3ml/L water.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Rhizome Rot (Pythium aphanidermatum)', symptoms: 'Water-soaked soft rot at collar region; plants pull out easily with foul odor.', preventiveAction: 'Drench beds with Trichoderma viride @ 10g/L or Copper Oxychloride @ 3g/L.', recommendedSpray: 'Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L drenching.', favorableConditions: 'Waterlogging and ill-drained heavy clay soils during heavy rains.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Leaves turn completely yellow, dry up, and collapse naturally'],
      postHarvestTip: 'Dig rhizomes carefully without injury. Boil rhizomes in water for 45 mins and solar dry for 10-15 days until dry metallic sound.',
      expectedYieldPerAcre: '20 - 25 Tons Fresh Rhizomes per Acre'
    },
    timelineStages: [
      { stageName: 'Bed Prep & Planting', startDay: 1, endDay: 30, description: 'Raised bed creation, organic mulching, and rhizome planting.', icon: 'layers', badgeColor: 'amber' },
      { stageName: 'Germination & Sprouting', startDay: 31, endDay: 60, description: 'Mother rhizome shoots emergence above straw mulch.', icon: 'eco', badgeColor: 'yellow' },
      { stageName: 'Active Rhizome Initiation', startDay: 61, endDay: 150, description: 'Primary and secondary finger rhizome branching underground.', icon: 'grain', badgeColor: 'orange' },
      { stageName: 'Rhizome Swelling & Curcumin Synthesis', startDay: 151, endDay: 210, description: 'Underground rhizome thickening and deep yellow curcumin formation.', icon: 'wb_sunny', badgeColor: 'lime' },
      { stageName: 'Harvest, Boiling & Drying', startDay: 211, endDay: 240, description: 'Rhizome digging, boiling in copper cauldrons, and solar drying.', icon: 'fireplace', badgeColor: 'red' }
    ]
  },
  {
    id: 'sunflower',
    name: 'Sunflower (పొద్దుతిరుగుడు)',
    category: 'Oilseeds',
    icon: '🌻',
    color: 'yellow',
    bgHeader: 'from-amber-950 via-yellow-900 to-amber-950',
    defaultVariety: 'KBSH 44 / DRSH 1',
    totalDays: 95,
    durationDisplay: '95 Days (~3 Months)',
    dailyReminders: [
      'Install beehives (2/acre) during blooming for 95%+ seed pollination.',
      'Check head backs for capitulum rot during humid weather.',
      'Protect golden ripening heads from parrot bird damage.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '30kg N + 40kg P2O5 + 30kg K2O + 10kg Sulphur per acre', instructions: 'Sulphur enhances seed oil percentage up to 42%.' },
      { stage: 'Button Stage (30 Days)', dayNumber: 30, dosage: '20kg Urea + Boron Spray (1g/L)', instructions: 'Boron spray prevents hollow seeds at central head.' }
    ],
    irrigationSchedule: {
      method: 'Ridge Furrow Irrigation',
      frequency: 'Irrigate every 8-10 days.',
      waterRequirement: '500 - 600 mm total',
      criticalStages: ['Bud Initiation', 'Flowering', 'Seed Filling']
    },
    pestAlerts: [
      { pestName: 'Head Borer (Helicoverpa armigera)', symptoms: 'Caterpillars feeding on flower disc and burrowing into heads.', threshold: '1 larva per head', treatment: 'Spray HaNPV @ 250 LE/acre or Chlorantraniliprole 18.5% SC @ 0.3ml/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Sunflower Necrosis Virus (SFNV)', symptoms: 'Necrotic streaks on stem and leaf curling transmitted by thrips.', preventiveAction: 'Spray Imidacloprid @ 0.3ml/L to control thrips vector.', recommendedSpray: 'Remove infected plants early.', favorableConditions: 'Dry hot weather promoting thrips migration.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Backside of sunflower head turns lemon yellow to brown', 'Seeds turn dark hard black'],
      postHarvestTip: 'Cut heads, dry on floor for 3 days, thresh with sunflower thresher, and dry seeds to 8% moisture.',
      expectedYieldPerAcre: '8 - 12 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Sowing & Germination', startDay: 1, endDay: 10, description: 'Precision seed dibbling at 60x30cm.', icon: 'eco', badgeColor: 'amber' },
      { stageName: 'Vegetative Growth', startDay: 11, endDay: 35, description: 'Stem thickening and broad leaf solar tracking.', icon: 'wb_sunny', badgeColor: 'yellow' },
      { stageName: 'Bud & Blooming Phase', startDay: 36, endDay: 60, description: 'Golden head flower opening and bee pollination.', icon: 'local_florist', badgeColor: 'orange' },
      { stageName: 'Seed Filling & Oil Synthesis', startDay: 61, endDay: 80, description: 'Achene seed plumpness and oil accumulation.', icon: 'grain', badgeColor: 'lime' },
      { stageName: 'Harvest & Threshing', startDay: 81, endDay: 95, description: 'Head cutting, solar floor drying, and seed threshing.', icon: 'agriculture', badgeColor: 'emerald' }
    ]
  },
  {
    id: 'millets',
    name: 'Millets (Ragi/Bajra/Jowar / చిరుధాన్యాలు)',
    category: 'Millets',
    icon: '🌾',
    color: 'emerald',
    bgHeader: 'from-emerald-950 via-teal-900 to-green-950',
    defaultVariety: 'Ragi (GPU 28) / Bajra (HHB 67)',
    totalDays: 85,
    durationDisplay: '85 Days (~2.8 Months)',
    dailyReminders: [
      'Millets require minimal water; check that soil does not stay waterlogged.',
      'Inspect earheads for midge fly or blast symptoms.',
      'Thin out excess crowded seedlings at Day 15.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose', dayNumber: 1, dosage: '20kg N + 20kg P2O5 + 20kg K2O per acre', instructions: 'Broadcast during land preparation; minimal chemical requirement.' },
      { stage: 'Top Dressing (25 Days)', dayNumber: 25, dosage: '20kg Urea per acre', instructions: 'Apply before rain or light irrigation.' }
    ],
    irrigationSchedule: {
      method: 'Rainfed / Protective Sprinkler',
      frequency: 'Drought resilient; 2-3 protective irrigations required only during dry spells.',
      waterRequirement: '250 - 350 mm total',
      criticalStages: ['Tillering', 'Earhead Emergence', 'Grain Dough Stage']
    },
    pestAlerts: [
      { pestName: 'Sorghum Shoot Fly / Bajra Shoot Fly', symptoms: 'Dead hearts in seedlings up to 4 weeks old.', threshold: '10% dead hearts', treatment: 'Seed treatment with Imidacloprid 70% WS @ 5g/kg or spray Quinalphos @ 2ml/L.', severity: 'Medium' }
    ],
    diseasePrevention: [
      { diseaseName: 'Ragi Blast (Pyricularia grisea)', symptoms: 'Spindle-shaped lesions on leaves and neck rot of earheads.', preventiveAction: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg.', recommendedSpray: 'Spray Tricyclazole 75% WP @ 0.6g/L if neck rot spotted.', favorableConditions: 'Cool weather with high relative humidity.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Earheads turn brown and dry', 'Grains become hard when pressed between fingernails'],
      postHarvestTip: 'Cut earheads, dry under sun for 4 days, thresh, and store grains in airtight tin containers.',
      expectedYieldPerAcre: '12 - 16 Quintals per Acre'
    },
    timelineStages: [
      { stageName: 'Sowing & Emergence', startDay: 1, endDay: 10, description: 'Direct seed broadcasting or line sowing at 22.5x10cm.', icon: 'eco', badgeColor: 'emerald' },
      { stageName: 'Tillering & Vegetative', startDay: 11, endDay: 35, description: 'Rapid tillering growth with extreme drought tolerance.', icon: 'grass', badgeColor: 'teal' },
      { stageName: 'Earhead Emergence & Blooming', startDay: 36, endDay: 55, description: 'Earhead head emergence and flowering bloom.', icon: 'spa', badgeColor: 'green' },
      { stageName: 'Grain Hardening', startDay: 56, endDay: 75, description: 'Grain filling and brown color change.', icon: 'grain', badgeColor: 'amber' },
      { stageName: 'Harvest & Threshing', startDay: 76, endDay: 85, description: 'Earhead cutting, sun drying, and manual/mechanical threshing.', icon: 'inventory', badgeColor: 'orange' }
    ]
  },
  {
    id: 'mango',
    name: 'Mango (మామిడి)',
    category: 'Fruits',
    icon: '🥭',
    color: 'amber',
    bgHeader: 'from-amber-950 via-yellow-900 to-orange-950',
    defaultVariety: 'Banganapalli / Alphonso / Totapuri',
    totalDays: 120,
    durationDisplay: '120 Days (Bloom to Harvest)',
    dailyReminders: [
      'Inspect flower panicles for mango hopper insects (wedge-shaped nymphs).',
      'Check panicles for powdery mildew white coating in foggy weather.',
      'Stop irrigation 1 month before flowering to induce flower bud differentiation.'
    ],
    fertilizerSchedule: [
      { stage: 'Post Harvest Basin Dose (Aug-Sept)', dayNumber: 1, dosage: '1kg N + 0.5kg P2O5 + 1kg K2O + 50kg FYM per mature tree', instructions: 'Incorporate in ring basin around tree canopy drip line.' },
      { stage: 'Pea Size Fruit Stage (Feb)', dayNumber: 45, dosage: 'Foliar spray Potassium Nitrate (13-0-45) @ 10g/L + Boron (1g/L)', instructions: 'Enhances fruit size and prevents fruit drop.' }
    ],
    irrigationSchedule: {
      method: 'Drip or Drip Ring Basin',
      frequency: 'Irrigate every 7-10 days from fruit set to maturity.',
      waterRequirement: '700 - 900 mm total during fruiting',
      criticalStages: ['Pea-Size Fruit Stage', 'Marble-Size Stage', 'Fruit Expansion']
    },
    pestAlerts: [
      { pestName: 'Mango Hopper (Amritodus atkinsoni)', symptoms: 'Nymphs suck sap from panicles causing flower drop and sooty mold.', threshold: '5 hoppers per panicle', treatment: 'Spray Thiamethoxam 25% WG @ 0.3g/L or Imidacloprid 17.8% SL @ 0.3ml/L.', severity: 'Critical' },
      { pestName: 'Fruit Fly (Bactrocera dorsalis)', symptoms: 'Magots inside ripening fruits causing rot and premature drop.', threshold: 'First catch in pheromone trap', treatment: 'Hang Methyl Eugenol Pheromone Traps @ 6/acre.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Powdery Mildew (Oidium mangiferae)', symptoms: 'White powdery growth on flower panicles causing blossom destruction.', preventiveAction: 'Sulphur 80% WP spray @ 3g/L at early panicle emergence.', recommendedSpray: 'Hexaconazole 5% EC @ 1ml/L or Karathane @ 1ml/L.', favorableConditions: 'Cool cloudy humid weather during bloom phase.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Specific gravity >1.0', 'Fruit shoulder rises above stem attachment', '1-2 tree ripe fruits drop naturally'],
      postHarvestTip: 'Harvest fruits with 2cm pedicel using mango harvester. Wash sap off in water and pack in corrugated fiber boxes.',
      expectedYieldPerAcre: '6 - 10 Tons per Acre (Mature Orchard)'
    },
    timelineStages: [
      { stageName: 'Flushing & Rest Phase', startDay: 1, endDay: 30, description: 'Post-monsoon leaf flushing and shoot maturation.', icon: 'park', badgeColor: 'green' },
      { stageName: 'Panicle Emergence (Panicle)', startDay: 31, endDay: 50, description: 'Blossom panicle emergence and honeybee pollination.', icon: 'local_florist', badgeColor: 'yellow' },
      { stageName: 'Pea to Marble Size Fruit Set', startDay: 51, endDay: 80, description: 'Fruit drop prevention spray and drip irrigation resume.', icon: 'grain', badgeColor: 'lime' },
      { stageName: 'Fruit Expansion & Shoulder Rise', startDay: 81, endDay: 105, description: 'Rapid pulp growth and sugar accumulation.', icon: 'wb_sunny', badgeColor: 'orange' },
      { stageName: 'Harvesting & De-sapping', startDay: 106, endDay: 120, description: 'Pole harvesting, de-sapping, hot water treatment, and box packing.', icon: 'shopping_basket', badgeColor: 'red' }
    ]
  },
  {
    id: 'papaya',
    name: 'Papaya (బొప్పాయి)',
    category: 'Fruits',
    icon: '🫐',
    color: 'orange',
    bgHeader: 'from-orange-950 via-amber-900 to-rose-950',
    defaultVariety: 'Red Lady 786 (Gynodioecious)',
    totalDays: 270,
    durationDisplay: '270 Days (~9 Months)',
    dailyReminders: [
      'Check undersides of foliage for mealybugs (white cottony patches).',
      'Remove male plants in dioecious varieties keeping 1 male per 10 female plants.',
      'Ensure perfect field drainage; papaya roots rot easily in standing water.'
    ],
    fertilizerSchedule: [
      { stage: 'Monthly Drip Fertigation', dayNumber: 30, dosage: '50g Urea + 50kg SSP + 50g Potash per plant per month', instructions: 'Apply monthly up to 8th month.' },
      { stage: 'Fruiting Micronutrient Spray', dayNumber: 120, dosage: 'Zinc Sulphate (0.5%) + Boric Acid (0.2%) foliar spray', instructions: 'Prevents bumpy misshapen fruits.' }
    ],
    irrigationSchedule: {
      method: 'Ring Drip Irrigation',
      frequency: 'Irrigate every 2-3 days; avoid water touching trunk directly.',
      waterRequirement: '1000 - 1200 mm total',
      criticalStages: ['Establishment', 'Flowering', 'Fruit Development']
    },
    pestAlerts: [
      { pestName: 'Papaya Mealybug (Paracoccus marginatus)', symptoms: 'Cottony white clusters on fruit surfaces and leaves with crinkling.', threshold: 'Presence of mealybug colonies', treatment: 'Release Acerophagus papayae bio-parasitoid or spray Profenofos @ 2ml/L + Neem oil.', severity: 'Critical' }
    ],
    diseasePrevention: [
      { diseaseName: 'Papaya Ring Spot Virus (PRSV)', symptoms: 'Yellow mosaic mottling on leaves and dark green rings on fruits.', preventiveAction: 'Use virus-free seedlings and control aphid vector.', recommendedSpray: 'Spray Dimethoate @ 2ml/L to control aphids and rogue out infected plants.', favorableConditions: 'Warm weather encouraging aphid migration.' }
    ],
    harvestReminder: {
      maturityIndicators: ['Fruit latex turns watery', 'Skin shows yellow streak at blossom end'],
      postHarvestTip: 'Harvest with gloves to avoid latex skin burn. Wrap fruits in paper and stack in single layer crates.',
      expectedYieldPerAcre: '40 - 55 Tons per Acre'
    },
    timelineStages: [
      { stageName: 'Nursery Raising', startDay: 1, endDay: 45, description: 'Polybag seedling production in protected net house.', icon: 'eco', badgeColor: 'orange' },
      { stageName: 'Transplanting & Ring Drip', startDay: 46, endDay: 75, description: 'Pit planting at 2x2m spacing with drip ring.', icon: 'nature_people', badgeColor: 'amber' },
      { stageName: 'Flowering & Fruit Initiation', startDay: 76, endDay: 130, description: 'Axillary flower bloom and green fruit set.', icon: 'local_florist', badgeColor: 'yellow' },
      { stageName: 'Fruit Enlargement', startDay: 131, endDay: 220, description: 'Rapid fruit weight gain along main trunk.', icon: 'view_agenda', badgeColor: 'lime' },
      { stageName: 'Harvesting & Grading', startDay: 221, endDay: 270, description: 'Color-break harvesting every 4 days for 6 months.', icon: 'shopping_bag', badgeColor: 'rose' }
    ]
  },
  {
    id: 'coconut',
    name: 'Coconut (కొబ్బరి)',
    category: 'Fruits',
    icon: '🥥',
    color: 'teal',
    bgHeader: 'from-emerald-950 via-teal-900 to-cyan-950',
    defaultVariety: 'East Coast Tall / Chowghat Orange Dwarf',
    totalDays: 365,
    durationDisplay: '365 Days (Annual Maintenance Cycle)',
    dailyReminders: [
      'Inspect palm crowns for Rhinoceros beetle V-shaped leaf cuts.',
      'Check nut surface for rugose spiralling whitefly sooty mold.',
      'Clean palm crowns annually before monsoon.'
    ],
    fertilizerSchedule: [
      { stage: 'First Dose (Pre-Monsoon May)', dayNumber: 150, dosage: '500g Nitrogen + 320g P2O5 + 1200g Potash + 50kg FYM per palm', instructions: 'Apply in circular trench 1.8m radius around palm base.' },
      { stage: 'Second Dose (Post-Monsoon Sept)', dayNumber: 270, dosage: '500g Nitrogen + 1200g Potash + 1kg Gypsum per palm', instructions: 'Incorporate in trench and cover with soil.' }
    ],
    irrigationSchedule: {
      method: 'Drip / Micro-jet (4 emitters per palm)',
      frequency: '100-120 Liters of water per palm per day during summer.',
      waterRequirement: 'Year round continuous irrigation',
      criticalStages: ['Button Shedding Phase', 'Nut Development']
    },
    pestAlerts: [
      { pestName: 'Rhinoceros Beetle (Oryctes rhinoceros)', symptoms: 'Geometric V-shaped cuts on fronds and holes bored into crown spindle.', threshold: '1 beetle per palm', treatment: 'Place Rhinolure pheromone traps @ 1 trap/5 acres; fill leaf axils with naphthalene balls + sand.', severity: 'High' },
      { pestName: 'Eriophyid Mite', symptoms: 'Triangular yellow patches on young buttons turning to brown dried scars.', threshold: '10% button damage', treatment: 'Root feeding with Azadirachtin 10,000 ppm @ 10ml + 10ml water.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Ganoderma Wilt / Basal Stem Rot', symptoms: 'Bleeding reddish-brown fluid from lower trunk base and frond drooping.', preventiveAction: 'Isolate affected palm by digging 1m deep trench around root zone.', recommendedSpray: 'Root feeding with Hexaconazole @ 2ml in 100ml water.', favorableConditions: 'Ill-drained soil during monsoon.' }
    ],
    harvestReminder: {
      maturityIndicators: ['12-month old nuts make hollow metallic water sloshing sound when shaken', 'Husk turns brown'],
      postHarvestTip: 'Harvest tender coconut at 7 months (water) or mature nut at 12 months (copra/oil).',
      expectedYieldPerAcre: '8,000 - 12,000 Nuts per Acre / Year'
    },
    timelineStages: [
      { stageName: 'Crown Cleaning & Basin Prep', startDay: 1, endDay: 60, description: 'Removing dead fronds and basin trenching.', icon: 'cleaning_services', badgeColor: 'teal' },
      { stageName: 'Pre-Monsoon Fertigation', startDay: 61, endDay: 120, description: 'Applying organic manure and NPK trench dose.', icon: 'eco', badgeColor: 'emerald' },
      { stageName: 'Button Setting & Inflorescence', startDay: 121, endDay: 240, description: 'Spadix opening and coconut button setting.', icon: 'spa', badgeColor: 'green' },
      { stageName: 'Nut Swelling & Water Filling', startDay: 241, endDay: 320, description: 'Copra and sweet liquid coconut water development.', icon: 'water_drop', badgeColor: 'cyan' },
      { stageName: 'Harvesting Cycles (Bi-Monthly)', startDay: 321, endDay: 365, description: 'Climbing harvesting every 45 days year-round.', icon: 'agriculture', badgeColor: 'amber' }
    ]
  },
  {
    id: 'blackgram',
    name: 'Black Gram (Urad Dal / మినుములు)',
    category: 'Pulses',
    icon: '🌱',
    color: 'emerald',
    bgHeader: 'from-emerald-950 via-teal-950 to-slate-900',
    defaultVariety: 'LBG-752 / PU-31 / TBG-104',
    totalDays: 75,
    durationDisplay: '70 - 75 Days (Short Pulse Duration)',
    dailyReminders: [
      'Inspect undersides of young trifoliate leaves for whiteflies (MYMV vectors).',
      'Check for yellow mosaic patches or leaf crinkle symptoms in early vegetative stage.',
      'Ensure field drains rapidly during heavy unseasonal rainfall to prevent collar root rot.'
    ],
    fertilizerSchedule: [
      { stage: 'Basal Dose (At Sowing)', dayNumber: 1, dosage: '8kg Nitrogen + 16kg P2O5 (DAP 35kg) + 10kg Potash + 2kg Rhizobium per acre', instructions: 'Incorporate into seedbed rows before drill sowing.' },
      { stage: 'Vegetative Foliar Boost', dayNumber: 25, dosage: 'Foliar spray 1% Urea or DAP (10g/L) + Micronutrient mixture', instructions: 'Spray during morning hours to trigger profuse branch tillering.' },
      { stage: 'Flowering & Pod Setting', dayNumber: 40, dosage: 'Pulse Wonder (2kg/acre in 200L water) or 1% DAP + NAA (40 ppm)', instructions: 'Foliar spray to prevent flower dropping and enhance pod set.' }
    ],
    irrigationSchedule: {
      method: 'Light Furrow / Sprinkler',
      frequency: 'Irrigate immediately after sowing, at flowering (30-35 DAS), and pod filling (45-50 DAS).',
      waterRequirement: '250 - 350 mm total water depth',
      criticalStages: ['Germination', 'Flower Bud Initiation', 'Pod Development']
    },
    pestAlerts: [
      { pestName: 'Whitefly (Bemisia tabaci) - MYMV Vector', symptoms: 'Tiny white flies feeding on leaf sap; causes Yellow Mosaic Virus spread.', threshold: '5 whiteflies per plant', treatment: 'Spray Acetamiprid 20% SP @ 0.2g/L or Thiamethoxam 25% WG @ 0.3g/L + Yellow sticky traps (15/acre).', severity: 'Critical' },
      { pestName: 'Spotted Pod Borer (Maruca vitrata)', symptoms: 'Webbing of flower buds, flowers, and bore holes in developing pods.', threshold: '10% damaged flowers/pods', treatment: 'Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L or Emamectin Benzoate 5% SG @ 0.4g/L.', severity: 'High' }
    ],
    diseasePrevention: [
      { diseaseName: 'Yellow Mosaic Virus (MYMV)', symptoms: 'Alternating bright yellow and green mosaic patches on leaves, puckering, stunted pods.', preventiveAction: 'Grow resistant varieties (LBG-752, PU-31) and treat seeds with Imidacloprid 600 FS @ 5ml/kg.', recommendedSpray: 'Spray Acetamiprid 20% SP @ 0.2g/L or 5% NSKE at first whitefly sighting.', favorableConditions: 'Warm humid weather (28-34°C) with dense whitefly population.' },
      { diseaseName: 'Cercospora Leaf Spot', symptoms: 'Circular brown spots with grey center and reddish border on leaves.', preventiveAction: 'Crop rotation and destroy previous crop residue.', recommendedSpray: 'Spray Carbendazim 50% WP @ 1g/L or Mancozeb 75% WP @ 2g/L.', favorableConditions: 'High relative humidity >85% and frequent intermittent showers.' },
      { diseaseName: 'Powdery Mildew (Erysiphe polygoni)', symptoms: 'White flour-like powdery coating covering leaves, stems, and pods.', preventiveAction: 'Sow at recommended spacing to promote air circulation.', recommendedSpray: 'Spray Wettable Sulfur 80% WP @ 2.5g/L or Hexaconazole 5% EC @ 2ml/L.', favorableConditions: 'Dry humid days with cool nights.' }
    ],
    harvestReminder: {
      maturityIndicators: ['80-85% of pods turn dark blackish-brown and dry crisp', 'Leaves turn yellow and drop naturally'],
      postHarvestTip: 'Cut plants with sickles in early morning to avoid pod shattering; thresh on clean tarpaulins and dry seeds to 9% moisture.',
      expectedYieldPerAcre: '6 - 9 Quintals (600 - 900 kg) per Acre'
    },
    timelineStages: [
      { stageName: 'Seed Treatment & Sowing', startDay: 1, endDay: 7, description: 'Rhizobium seed treatment and line sowing at 30x10 cm.', icon: 'grain', badgeColor: 'emerald' },
      { stageName: 'Vegetative & Branching', startDay: 8, endDay: 30, description: 'Weeding, whitefly vector surveillance, and foliar boost.', icon: 'eco', badgeColor: 'green' },
      { stageName: 'Flowering & Pod Initiation', startDay: 31, endDay: 50, description: 'Flowering spray with Pulse Wonder to arrest blossom drop.', icon: 'spa', badgeColor: 'teal' },
      { stageName: 'Pod Filling & Maturation', startDay: 51, endDay: 68, description: 'Pod swelling, moisture maintenance, and pod borer check.', icon: 'inventory_2', badgeColor: 'cyan' },
      { stageName: 'Harvesting & Threshing', startDay: 69, endDay: 75, description: 'Harvest mature black pods and sun dry to 9% moisture.', icon: 'agriculture', badgeColor: 'amber' }
    ]
  }
];
