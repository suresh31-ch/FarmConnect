/**
 * Smart Crop Calendar & Task Scheduler
 * Automated Crop Cycle Timeline & Reminders
 * Supports unlimited crops with pre-configured Indian agronomic guides for 17+ common crops.
 */

import React, { useState, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { CROP_CATALOG, CropCatalogItem } from '../../data/cropCycleCatalogData';

export interface CropScheduleTask {
  id: string;
  dayNumber: number;
  stageName: string;
  taskTitle: string;
  category: 'sowing' | 'fertilizer' | 'irrigation' | 'pest_control' | 'disease_prevention' | 'harvest';
  dueDate: string;
  description: string;
  isCompleted: boolean;
  reminderEnabled: boolean;
}

export interface ActiveCropCycle {
  cropId: string;
  catalogId: string;
  cropName: string;
  variety: string;
  fieldArea: string;
  sowingDate: string;
  harvestTargetDate: string;
  totalDays: number;
  currentDay: number;
  catalogData: CropCatalogItem;
  tasks: CropScheduleTask[];
  dailyChecklist: { id: string; text: string; done: boolean }[];
}

// Helper to generate default tasks from catalog
const buildTasksFromCatalog = (catalog: CropCatalogItem, sowingDateStr: string): CropScheduleTask[] => {
  const sowingTime = new Date(sowingDateStr).getTime() || Date.now();
  
  const tasks: CropScheduleTask[] = [];

  // 1. Sowing & Nursery
  tasks.push({
    id: `task-sow-${Date.now()}-1`,
    dayNumber: 1,
    stageName: catalog.timelineStages[0]?.stageName || 'Sowing Stage',
    taskTitle: `Seed Treatment & ${catalog.name} Sowing`,
    category: 'sowing',
    dueDate: new Date(sowingTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    description: `Treat seeds with Trichoderma viride or recommended bio-pesticide. Plant at recommended spacing for ${catalog.defaultVariety}.`,
    isCompleted: true,
    reminderEnabled: true
  });

  // 2. Fertilizer Tasks
  catalog.fertilizerSchedule.forEach((fert, idx) => {
    const taskDate = new Date(sowingTime + fert.dayNumber * 24 * 60 * 60 * 1000);
    tasks.push({
      id: `task-fert-${Date.now()}-${idx}`,
      dayNumber: fert.dayNumber,
      stageName: fert.stage,
      taskTitle: `Fertilizer: ${fert.stage}`,
      category: 'fertilizer',
      dueDate: taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      description: `${fert.dosage}. ${fert.instructions}`,
      isCompleted: fert.dayNumber < 30,
      reminderEnabled: true
    });
  });

  // 3. Pest Alert Task
  if (catalog.pestAlerts[0]) {
    const pest = catalog.pestAlerts[0];
    const taskDate = new Date(sowingTime + Math.round(catalog.totalDays * 0.4) * 24 * 60 * 60 * 1000);
    tasks.push({
      id: `task-pest-${Date.now()}-1`,
      dayNumber: Math.round(catalog.totalDays * 0.4),
      stageName: 'Pest Scouting & Spray',
      taskTitle: `Pest Inspection: ${pest.pestName}`,
      category: 'pest_control',
      dueDate: taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      description: `Symptoms: ${pest.symptoms} Threshold: ${pest.threshold}. Treatment: ${pest.treatment}`,
      isCompleted: false,
      reminderEnabled: true
    });
  }

  // 4. Disease Prevention Task
  if (catalog.diseasePrevention[0]) {
    const dis = catalog.diseasePrevention[0];
    const taskDate = new Date(sowingTime + Math.round(catalog.totalDays * 0.6) * 24 * 60 * 60 * 1000);
    tasks.push({
      id: `task-dis-${Date.now()}-1`,
      dayNumber: Math.round(catalog.totalDays * 0.6),
      stageName: 'Disease Prevention',
      taskTitle: `Disease Advisory: ${dis.diseaseName}`,
      category: 'disease_prevention',
      dueDate: taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      description: `Action: ${dis.preventiveAction}. Recommended Spray: ${dis.recommendedSpray}`,
      isCompleted: false,
      reminderEnabled: true
    });
  }

  // 5. Harvest Task
  const harvestDate = new Date(sowingTime + catalog.totalDays * 24 * 60 * 60 * 1000);
  tasks.push({
    id: `task-harv-${Date.now()}-1`,
    dayNumber: catalog.totalDays,
    stageName: 'Harvest & Post-Harvest',
    taskTitle: `Target Harvest: ${catalog.name}`,
    category: 'harvest',
    dueDate: harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    description: `Indicators: ${catalog.harvestReminder.maturityIndicators.join(', ')}. Yield: ${catalog.harvestReminder.expectedYieldPerAcre}.`,
    isCompleted: false,
    reminderEnabled: true
  });

  return tasks.sort((a, b) => a.dayNumber - b.dayNumber);
};

// Initial active farm crops
const initialActiveCropCycles: ActiveCropCycle[] = [
  {
    cropId: 'active-1',
    catalogId: 'paddy',
    cropName: 'Sonamasuri Paddy',
    variety: 'BPT 5204 (Sonamasuri)',
    fieldArea: '2.5 Acres (Field Block A)',
    sowingDate: 'June 10, 2026',
    harvestTargetDate: 'Oct 15, 2026',
    totalDays: 125,
    currentDay: 48,
    catalogData: CROP_CATALOG[0], // Paddy
    tasks: buildTasksFromCatalog(CROP_CATALOG[0], '2026-06-10'),
    dailyChecklist: [
      { id: 'dc-1', text: 'Maintain 2-inch standing water depth across paddy basin', done: true },
      { id: 'dc-2', text: 'Check lower leaf sheath for stem borer egg masses', done: false },
      { id: 'dc-3', text: 'Inspect field bunds and drainage channels for weed blocks', done: false }
    ]
  },
  {
    cropId: 'active-2',
    catalogId: 'tomato',
    cropName: 'Hybrid Tomato',
    variety: 'Arka Rakshak F1',
    fieldArea: '1.5 Acres (Field Block B)',
    sowingDate: 'July 1, 2026',
    harvestTargetDate: 'Sept 28, 2026',
    totalDays: 90,
    currentDay: 28,
    catalogData: CROP_CATALOG[4], // Tomato
    tasks: buildTasksFromCatalog(CROP_CATALOG[4], '2026-07-01'),
    dailyChecklist: [
      { id: 'dt-1', text: 'Inspect flowers for blossom end rot and foliar calcium spray', done: true },
      { id: 'dt-2', text: 'Check drip line emitters for uniform water discharge', done: false },
      { id: 'dt-3', text: 'Inspect yellow sticky traps for whitefly catches', done: false }
    ]
  },
  {
    cropId: 'active-3',
    catalogId: 'cotton',
    cropName: 'Bt Cotton',
    variety: 'RCH 659 BG II',
    fieldArea: '3.0 Acres (Block C)',
    sowingDate: 'May 20, 2026',
    harvestTargetDate: 'Oct 28, 2026',
    totalDays: 160,
    currentDay: 68,
    catalogData: CROP_CATALOG[2], // Cotton
    tasks: buildTasksFromCatalog(CROP_CATALOG[2], '2026-05-20'),
    dailyChecklist: [
      { id: 'dc-c1', text: 'Inspect terminal squares for sucking pest crinkling', done: true },
      { id: 'dc-c2', text: 'Check pheromone traps for pink bollworm moth counts', done: false }
    ]
  }
];

export const CropCalendar: React.FC = () => {
  const [activeCropCycles, setActiveCropCycles] = useState<ActiveCropCycle[]>(initialActiveCropCycles);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'daily' | 'fertilizer' | 'irrigation' | 'pests' | 'harvest'>('timeline');

  // Modals & Catalog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatalogExplorerOpen, setIsCatalogExplorerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('All');
  const [inspectCatalogItem, setInspectCatalogItem] = useState<CropCatalogItem | null>(null);

  // Form states for adding new crop
  const [formCropId, setFormCropId] = useState<string>('paddy');
  const [formCustomName, setFormCustomName] = useState<string>('');
  const [formVariety, setFormVariety] = useState<string>('');
  const [formSowingDate, setFormSowingDate] = useState<string>('2026-07-28');
  const [formFieldArea, setFormFieldArea] = useState<string>('2.0 Acres (New Block)');

  const activeCycle = activeCropCycles[selectedCropIndex] || activeCropCycles[0];

  // Calculate current growth stage name dynamically based on current day
  const getCurrentStageInfo = (cycle: ActiveCropCycle) => {
    if (!cycle) return { name: 'Growth Phase', icon: 'grass' };
    const pct = Math.min(100, Math.max(0, Math.round((cycle.currentDay / cycle.totalDays) * 100)));
    const matchingStage = cycle.catalogData.timelineStages.find(
      s => cycle.currentDay >= s.startDay && cycle.currentDay <= s.endDay
    ) || cycle.catalogData.timelineStages[cycle.catalogData.timelineStages.length - 1];

    return {
      percentage: pct,
      stageName: matchingStage ? matchingStage.stageName : 'Vegetative Growth',
      stageDesc: matchingStage ? matchingStage.description : 'Active growth phase',
      icon: matchingStage ? matchingStage.icon : 'nature_people'
    };
  };

  const currentStageInfo = useMemo(() => getCurrentStageInfo(activeCycle), [activeCycle]);

  // Task toggles
  const toggleTaskCompletion = (taskId: string) => {
    setActiveCropCycles((prev) =>
      prev.map((cycle, idx) => {
        if (idx !== selectedCropIndex) return cycle;
        return {
          ...cycle,
          tasks: cycle.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
        };
      })
    );
  };

  const toggleTaskReminder = (taskId: string) => {
    setActiveCropCycles((prev) =>
      prev.map((cycle, idx) => {
        if (idx !== selectedCropIndex) return cycle;
        return {
          ...cycle,
          tasks: cycle.tasks.map((t) => (t.id === taskId ? { ...t, reminderEnabled: !t.reminderEnabled } : t))
        };
      })
    );
  };

  const toggleDailyCheck = (checkId: string) => {
    setActiveCropCycles((prev) =>
      prev.map((cycle, idx) => {
        if (idx !== selectedCropIndex) return cycle;
        return {
          ...cycle,
          dailyChecklist: cycle.dailyChecklist.map((c) => (c.id === checkId ? { ...c, done: !c.done } : c))
        };
      })
    );
  };

  // Add new crop to active list
  const handleAddCropSubmit = () => {
    const catalogMatch = CROP_CATALOG.find(c => c.id === formCropId) || CROP_CATALOG[0];
    const cropName = formCustomName.trim() || catalogMatch.name;
    const varietyName = formVariety.trim() || catalogMatch.defaultVariety;
    
    const sowDateObj = new Date(formSowingDate);
    const sowDateFormatted = sowDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const harvestDateObj = new Date(sowDateObj.getTime() + catalogMatch.totalDays * 24 * 60 * 60 * 1000);
    const harvestFormatted = harvestDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Calculate current day based on sowing date
    const diffDays = Math.max(1, Math.round((Date.now() - sowDateObj.getTime()) / (1000 * 60 * 60 * 24)));
    const currentDay = Math.min(catalogMatch.totalDays, diffDays);

    const newCycle: ActiveCropCycle = {
      cropId: `active-${Date.now()}`,
      catalogId: catalogMatch.id,
      cropName,
      variety: varietyName,
      fieldArea: formFieldArea || '2.0 Acres',
      sowingDate: sowDateFormatted,
      harvestTargetDate: harvestFormatted,
      totalDays: catalogMatch.totalDays,
      currentDay,
      catalogData: catalogMatch,
      tasks: buildTasksFromCatalog(catalogMatch, formSowingDate),
      dailyChecklist: catalogMatch.dailyReminders.map((rem, i) => ({
        id: `dc-new-${Date.now()}-${i}`,
        text: rem,
        done: false
      }))
    };

    setActiveCropCycles(prev => [newCycle, ...prev]);
    setSelectedCropIndex(0);
    setIsAddModalOpen(false);
  };

  // Quick add from catalog inspector
  const handleAddDirectFromCatalog = (catalogItem: CropCatalogItem) => {
    const sowDateObj = new Date();
    const sowDateFormatted = sowDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const harvestDateObj = new Date(sowDateObj.getTime() + catalogItem.totalDays * 24 * 60 * 60 * 1000);
    const harvestFormatted = harvestDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newCycle: ActiveCropCycle = {
      cropId: `active-${Date.now()}`,
      catalogId: catalogItem.id,
      cropName: catalogItem.name,
      variety: catalogItem.defaultVariety,
      fieldArea: '2.0 Acres (Block ' + (activeCropCycles.length + 1) + ')',
      sowingDate: sowDateFormatted,
      harvestTargetDate: harvestFormatted,
      totalDays: catalogItem.totalDays,
      currentDay: 1,
      catalogData: catalogItem,
      tasks: buildTasksFromCatalog(catalogItem, sowDateObj.toISOString().split('T')[0]),
      dailyChecklist: catalogItem.dailyReminders.map((rem, i) => ({
        id: `dc-direct-${Date.now()}-${i}`,
        text: rem,
        done: false
      }))
    };

    setActiveCropCycles(prev => [newCycle, ...prev]);
    setSelectedCropIndex(0);
    setInspectCatalogItem(null);
    setIsCatalogExplorerOpen(false);
  };

  // Remove active crop cycle
  const handleRemoveCropCycle = (indexToRemove: number) => {
    if (activeCropCycles.length <= 1) {
      alert("At least one crop cycle must remain active in your schedule.");
      return;
    }
    if (confirm(`Remove "${activeCropCycles[indexToRemove].cropName}" from active farm cycles?`)) {
      setActiveCropCycles(prev => prev.filter((_, idx) => idx !== indexToRemove));
      setSelectedCropIndex(0);
    }
  };

  // Filtered Catalog Items
  const filteredCatalog = useMemo(() => {
    return CROP_CATALOG.filter(item => {
      const matchesCategory = selectedCatalogCategory === 'All' || item.category === selectedCatalogCategory;
      const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                            item.defaultVariety.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                            item.category.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [catalogSearch, selectedCatalogCategory]);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="emerald" size="md" icon="calendar_month">
              Smart Agronomy Precision Engine
            </Badge>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              17+ Pre-configured Indian Crops
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Automated Crop Cycle Timeline & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-3xl leading-relaxed">
            Precision stage-by-stage agricultural guidance from seed germination to harvest. Tracks growth progress, daily alerts, fertilizer dosages, drip irrigation schedules, pest alerts, and disease prevention for unlimited crops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="md"
            leftIcon="menu_book"
            onClick={() => setIsCatalogExplorerOpen(true)}
            className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60"
          >
            Crop Catalog (17)
          </Button>
          <Button
            variant="accent"
            size="md"
            leftIcon="add_circle"
            onClick={() => {
              setFormCropId(CROP_CATALOG[0].id);
              setFormVariety(CROP_CATALOG[0].defaultVariety);
              setIsAddModalOpen(true);
            }}
            className="shadow-xl shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold"
          >
            Add Crop to Schedule
          </Button>
        </div>
      </div>

      {/* ACTIVE FARM METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 border-emerald-500/20 bg-slate-900/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl">
            🌾
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Active Crops</span>
            <span className="text-xl font-extrabold text-white">{activeCropCycles.length} Fields</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-amber-500/20 bg-slate-900/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl">
            🔔
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Scheduled Tasks</span>
            <span className="text-xl font-extrabold text-amber-300">
              {activeCropCycles.reduce((acc, c) => acc + c.tasks.filter(t => !t.isCompleted).length, 0)} Pending
            </span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-teal-500/20 bg-slate-900/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-xl">
            💧
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Today's Inspection</span>
            <span className="text-xl font-extrabold text-teal-300">
              {activeCycle ? activeCycle.dailyChecklist.filter(d => !d.done).length : 0} Daily Items
            </span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-cyan-500/20 bg-slate-900/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xl">
            📈
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Overall Progress</span>
            <span className="text-xl font-extrabold text-cyan-300">
              {currentStageInfo.percentage}% Completed
            </span>
          </div>
        </Card>
      </div>

      {/* CROP SELECTOR HORIZONTAL SCROLL BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Icon name="potted_plant" size={18} className="text-emerald-400" />
            My Active Farm Crop Cycles ({activeCropCycles.length})
          </h2>
          <button
            type="button"
            onClick={() => setIsCatalogExplorerOpen(true)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
          >
            <span>Explore All 17 Indian Crops</span>
            <Icon name="arrow_forward" size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-800">
          {activeCropCycles.map((cycle, idx) => {
            const isSelected = selectedCropIndex === idx;
            const pct = Math.min(100, Math.round((cycle.currentDay / cycle.totalDays) * 100));

            return (
              <div
                key={cycle.cropId}
                className={`relative group rounded-2xl transition-all shrink-0 border p-4 flex items-center gap-4 cursor-pointer min-w-[240px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white border-emerald-300 shadow-xl shadow-emerald-950/60 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
                onClick={() => setSelectedCropIndex(idx)}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {cycle.catalogData?.icon || '🌾'}
                </div>

                <div className="text-left space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-sm truncate block">{cycle.cropName}</span>
                    {activeCropCycles.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCropCycle(idx);
                        }}
                        className="text-slate-400 hover:text-rose-400 font-bold text-xs p-1 rounded hover:bg-white/10"
                        title="Remove crop"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] opacity-90">
                    <span className="font-semibold">{cycle.variety}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Day {cycle.currentDay} of {cycle.totalDays}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-300 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300 transition-all shrink-0 flex items-center gap-3 min-w-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Icon name="add" size={24} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-bold text-sm block">Add New Crop</span>
              <span className="text-[11px] text-emerald-200/70 block">Select from 17 catalog crops</span>
            </div>
          </button>
        </div>
      </div>

      {/* ACTIVE CROP DETAILED TIMELINE & ADVISORY PANEL */}
      {activeCycle && (
        <Card variant="glass" className="p-6 space-y-6 border-emerald-500/30 bg-slate-950/60 shadow-2xl">
          {/* TOP CARD CROP INFO BANNER */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner shrink-0">
                {activeCycle.catalogData?.icon || '🌾'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                    {activeCycle.fieldArea}
                  </span>
                  <Badge variant="teal" size="sm">
                    {activeCycle.catalogData?.category || 'General Crop'}
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeCycle.cropName} <span className="text-emerald-400 text-lg font-normal">({activeCycle.variety})</span>
                </h2>

                <div className="flex items-center gap-4 text-xs text-slate-300 font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="event" size={16} className="text-emerald-400" />
                    Sown: <strong>{activeCycle.sowingDate}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="flag" size={16} className="text-amber-400" />
                    Target Harvest: <strong>{activeCycle.harvestTargetDate}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="timer" size={16} className="text-cyan-400" />
                    Duration: <strong>{activeCycle.totalDays} Days ({activeCycle.catalogData?.durationDisplay})</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Stage & Progress Box */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-2 min-w-[260px] w-full lg:w-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Current Stage</span>
                <span className="text-emerald-400 font-black">Day {activeCycle.currentDay} of {activeCycle.totalDays}</span>
              </div>

              <div className="flex items-center gap-2">
                <Icon name={currentStageInfo.icon} size={22} className="text-emerald-400" />
                <span className="text-base font-extrabold text-white">{currentStageInfo.stageName}</span>
              </div>

              <p className="text-[11px] text-slate-300 italic">{currentStageInfo.stageDesc}</p>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Growth Completed</span>
                  <span className="text-emerald-400">{currentStageInfo.percentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_#10b981]"
                    style={{ width: `${currentStageInfo.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC SECTION TABS FOR ALL 10 REQUIRED CROP FEATURES */}
          <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'timeline'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="checklist" size={16} />
              <span>1. Timeline & Tasks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'daily'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="today" size={16} />
              <span>2. Daily Inspection ({activeCycle.dailyChecklist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fertilizer')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'fertilizer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="science" size={16} />
              <span>3. Fertilizer Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('irrigation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'irrigation'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="water_drop" size={16} />
              <span>4. Irrigation Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pests')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'pests'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="bug_report" size={16} />
              <span>5. Pests & Diseases</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('harvest')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'harvest'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon name="agriculture" size={16} />
              <span>6. Harvest & Yield</span>
            </button>
          </div>

          {/* TAB 1: TIMELINE & SCHEDULED TASKS */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* STAGE TIMELINE STEPS */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Icon name="alt_route" size={18} className="text-emerald-400" />
                  Growth Timeline Stages ({activeCycle.catalogData?.timelineStages.length} Phases)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeCycle.catalogData?.timelineStages.map((stage, sIdx) => {
                    const isCurrentStage = activeCycle.currentDay >= stage.startDay && activeCycle.currentDay <= stage.endDay;
                    const isPassedStage = activeCycle.currentDay > stage.endDay;

                    return (
                      <Card
                        key={sIdx}
                        variant="glass"
                        className={`p-4 space-y-2 border transition-all ${
                          isCurrentStage
                            ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-500/30'
                            : isPassedStage
                            ? 'bg-slate-900/40 border-slate-800 opacity-80'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            Day {stage.startDay} - {stage.endDay}
                          </span>
                          {isCurrentStage && (
                            <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                              Active Stage Now
                            </span>
                          )}
                          {isPassedStage && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Icon name="check_circle" size={14} /> Done
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon name={stage.icon || 'grass'} size={20} className="text-emerald-400" />
                          <h4 className="text-sm font-extrabold text-white">{stage.stageName}</h4>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{stage.description}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONABLE TASK LIST */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Icon name="notification_add" size={20} className="text-emerald-400" />
                    Scheduled Field Actions & Push Alerts ({activeCycle.tasks.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeCycle.tasks.filter(t => t.isCompleted).length} of {activeCycle.tasks.length} Completed
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500/30">
                  {activeCycle.tasks.map((task) => (
                    <div key={task.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[31px] top-3.5 w-4 h-4 rounded-full border-2 transition-all ${
                          task.isCompleted
                            ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_10px_#10b981]'
                            : 'bg-slate-900 border-emerald-500/60'
                        }`}
                      />

                      <Card variant="glass" className="p-4 space-y-3 border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              Day {task.dayNumber} • {task.stageName}
                            </span>
                            <Badge variant={task.category === 'harvest' ? 'amber' : task.category === 'fertilizer' ? 'teal' : 'emerald'} size="sm">
                              {task.category.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-slate-400 font-semibold">{task.dueDate}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Push Alert Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleTaskReminder(task.id)}
                              className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                                task.reminderEnabled
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <Icon name={task.reminderEnabled ? 'notifications_active' : 'notifications_off'} size={14} />
                              <span>{task.reminderEnabled ? 'SMS & Push On' : 'Alert Off'}</span>
                            </button>

                            {/* Mark Completed Button */}
                            <button
                              type="button"
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`text-xs font-extrabold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                                task.isCompleted
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                              }`}
                            >
                              <Icon name={task.isCompleted ? 'check_box' : 'check_box_outline_blank'} size={18} />
                              <span>{task.isCompleted ? 'Completed' : 'Mark Done'}</span>
                            </button>
                          </div>
                        </div>

                        <h4 className={`text-base font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.taskTitle}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {task.description}
                        </p>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY INSPECTION REMINDERS */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="today" size={20} className="text-emerald-400" />
                  Daily Field Patrol Checklist for {activeCycle.cropName}
                </h3>
                <span className="text-xs text-emerald-400 font-bold">Updated Every Morning</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeCycle.dailyChecklist.map((item) => (
                  <Card
                    key={item.id}
                    variant="glass"
                    className={`p-4 flex items-start gap-3 border transition-all cursor-pointer ${
                      item.done
                        ? 'bg-emerald-950/40 border-emerald-500/40 opacity-80'
                        : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                    }`}
                    onClick={() => toggleDailyCheck(item.id)}
                  >
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        item.done
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-slate-950 border-slate-700 text-transparent hover:border-emerald-400'
                      }`}
                    >
                      ✓
                    </button>
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold leading-relaxed ${item.done ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {item.text}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {item.done ? 'Checked today' : 'Tap to mark completed'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FERTILIZER SCHEDULE */}
          {activeTab === 'fertilizer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="science" size={20} className="text-emerald-400" />
                  Recommended Fertilizer & Nutrient Application Schedule
                </h3>
                <span className="text-xs text-slate-400">Dosages calculated per acre</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCycle.catalogData?.fertilizerSchedule.map((fert, idx) => (
                  <Card key={idx} variant="glass" className="p-5 space-y-3 border-emerald-500/20 bg-slate-900/80">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                        Day {fert.dayNumber} • {fert.stage}
                      </span>
                      <Icon name="eco" size={18} className="text-emerald-400" />
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Recommended Dose Per Acre</span>
                      <h4 className="text-sm font-extrabold text-amber-300">{fert.dosage}</h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <strong>Method & Advisory:</strong> {fert.instructions}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IRRIGATION SCHEDULE */}
          {activeTab === 'irrigation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="water_drop" size={20} className="text-cyan-400" />
                  Water Management & Drip Irrigation Schedule
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass" className="p-5 space-y-2 border-cyan-500/20 bg-slate-900/80">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Irrigation Method</span>
                  <h4 className="text-base font-extrabold text-cyan-300 flex items-center gap-2">
                    <Icon name="waves" size={18} /> {activeCycle.catalogData?.irrigationSchedule.method}
                  </h4>
                </Card>

                <Card variant="glass" className="p-5 space-y-2 border-cyan-500/20 bg-slate-900/80">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Water Requirement</span>
                  <h4 className="text-base font-extrabold text-teal-300 flex items-center gap-2">
                    <Icon name="opacity" size={18} /> {activeCycle.catalogData?.irrigationSchedule.waterRequirement}
                  </h4>
                </Card>

                <Card variant="glass" className="p-5 space-y-2 border-cyan-500/20 bg-slate-900/80">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Frequency</span>
                  <h4 className="text-sm font-extrabold text-white">
                    {activeCycle.catalogData?.irrigationSchedule.frequency}
                  </h4>
                </Card>
              </div>

              <Card variant="glass" className="p-5 space-y-3 border-amber-500/30 bg-amber-950/20">
                <h4 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <Icon name="warning" size={18} className="text-amber-400" />
                  Critical Water Moisture Stages (DO NOT ALLOW STRESS)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeCycle.catalogData?.irrigationSchedule.criticalStages.map((cs, idx) => (
                    <span key={idx} className="text-xs font-bold text-amber-200 bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-500/40">
                      ⚡ {cs}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: PEST ALERTS & DISEASE PREVENTION */}
          {activeTab === 'pests' && (
            <div className="space-y-6">
              {/* PEST ALERTS */}
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="bug_report" size={20} className="text-rose-400" />
                  Major Pest Threats & Integrated Pest Management (IPM)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCycle.catalogData?.pestAlerts.map((pest, idx) => (
                    <Card key={idx} variant="glass" className="p-5 space-y-3 border-rose-500/20 bg-slate-900/80">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-sm font-extrabold text-rose-300 flex items-center gap-2">
                          <Icon name="pest_control" size={18} /> {pest.pestName}
                        </h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          pest.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border-rose-500' : 'bg-amber-950 text-amber-300 border-amber-500'
                        }`}>
                          {pest.severity} Alert
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <p><strong>Symptoms:</strong> {pest.symptoms}</p>
                        <p><strong>Economic Threshold (ETL):</strong> <span className="text-amber-300 font-semibold">{pest.threshold}</span></p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30 text-xs">
                        <strong className="text-emerald-400 block mb-1">Recommended Control Spray:</strong>
                        <p className="text-slate-200">{pest.treatment}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* DISEASE PREVENTION */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="health_and_safety" size={20} className="text-teal-400" />
                  Disease Prevention & Fungal Pathogen Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCycle.catalogData?.diseasePrevention.map((dis, idx) => (
                    <Card key={idx} variant="glass" className="p-5 space-y-3 border-teal-500/20 bg-slate-900/80">
                      <h4 className="text-sm font-extrabold text-teal-300 border-b border-slate-800 pb-2">
                        {dis.diseaseName}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <p><strong>Preventive Action:</strong> {dis.preventiveAction}</p>
                        <p><strong>Weather Triggers:</strong> {dis.favorableConditions}</p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-teal-500/30 text-xs">
                        <strong className="text-cyan-400 block mb-1">Target Fungicide Spray:</strong>
                        <p className="text-slate-200">{dis.recommendedSpray}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HARVEST REMINDER & POST-HARVEST */}
          {activeTab === 'harvest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Icon name="agriculture" size={20} className="text-amber-400" />
                  Harvest Maturity Indicators & Post-Harvest Advisory
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="glass" className="p-5 space-y-3 border-amber-500/20 bg-slate-900/80">
                  <h4 className="text-sm font-extrabold text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Icon name="task_alt" size={18} /> Physical Maturity Indicators
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeCycle.catalogData?.harvestReminder.maturityIndicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card variant="glass" className="p-5 space-y-3 border-emerald-500/20 bg-slate-900/80">
                  <h4 className="text-sm font-extrabold text-emerald-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Icon name="inventory" size={18} /> Post-Harvest & Storage Tip
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {activeCycle.catalogData?.harvestReminder.postHarvestTip}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Expected Acreage Yield:</span>
                    <span className="font-extrabold text-amber-300 text-sm">
                      {activeCycle.catalogData?.harvestReminder.expectedYieldPerAcre}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* MODAL 1: CROP CATALOG EXPLORER (ALL 17 INDIAN CROPS) */}
      {isCatalogExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <Card variant="glass" className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border-emerald-500/40 bg-slate-950 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="space-y-1">
                <Badge variant="emerald" size="sm" icon="menu_book">
                  Indian Agronomic Database
                </Badge>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>Explore All 17 Common Indian Crops</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCatalogExplorerOpen(false);
                  setInspectCatalogItem(null);
                }}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-lg flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Catalog Search & Category Filters */}
            <div className="p-6 border-b border-slate-800 space-y-4 bg-slate-900/40">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Icon name="search" size={20} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search crop name (e.g., Paddy, Cotton, Tomato, Turmeric, Coconut)..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                  {['All', 'Cereals & Grains', 'Vegetables', 'Commercial Cash Crops', 'Fruits', 'Spices & Condiments', 'Oilseeds', 'Millets'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        selectedCatalogCategory === cat
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Grid View */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-emerald-800">
              {!inspectCatalogItem ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCatalog.map((crop) => (
                    <Card
                      key={crop.id}
                      variant="glass"
                      className="p-5 space-y-3 border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner">
                            {crop.icon}
                          </div>
                          <Badge variant="emerald" size="sm">
                            {crop.durationDisplay}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                            {crop.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-semibold block">Variety: {crop.defaultVariety}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          Category: {crop.category} • {crop.timelineStages.length} Growth Stages included.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectCatalogItem(crop)}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          View Agronomic Guide
                        </button>

                        <Button
                          variant="accent"
                          size="sm"
                          leftIcon="add"
                          onClick={() => handleAddDirectFromCatalog(crop)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                        >
                          Add to Farm
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                /* DEEP INSPECTOR VIEW FOR SELECTED CROP */
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => setInspectCatalogItem(null)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    <Icon name="arrow_back" size={16} /> Back to Catalog Grid
                  </button>

                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 border border-emerald-500/40">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-4xl">
                        {inspectCatalogItem.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{inspectCatalogItem.name}</h2>
                        <span className="text-xs text-emerald-300 font-bold block">Variety: {inspectCatalogItem.defaultVariety} • {inspectCatalogItem.durationDisplay}</span>
                      </div>
                    </div>

                    <Button
                      variant="accent"
                      size="md"
                      leftIcon="add_circle"
                      onClick={() => handleAddDirectFromCatalog(inspectCatalogItem)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold shadow-xl shrink-0"
                    >
                      Add This Crop to Active Schedule
                    </Button>
                  </div>

                  {/* Complete 10 features display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-emerald-400">1 & 3. Duration & Stages</h4>
                      <p className="text-xs text-slate-300">Total Duration: {inspectCatalogItem.durationDisplay}</p>
                      <p className="text-xs text-slate-300">Stages count: {inspectCatalogItem.timelineStages.length} phases from germination to harvest.</p>
                    </Card>

                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-teal-400">5. Daily Inspection Reminders</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {inspectCatalogItem.dailyReminders.map((r, i) => <li key={i}>• {r}</li>)}
                      </ul>
                    </Card>

                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-amber-400">6. Fertilizer Schedule</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {inspectCatalogItem.fertilizerSchedule.map((f, i) => <li key={i}>• <strong>{f.stage}:</strong> {f.dosage}</li>)}
                      </ul>
                    </Card>

                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-cyan-400">7. Irrigation Schedule</h4>
                      <p className="text-xs text-slate-300">Method: {inspectCatalogItem.irrigationSchedule.method}</p>
                      <p className="text-xs text-slate-300">Frequency: {inspectCatalogItem.irrigationSchedule.frequency}</p>
                      <p className="text-xs text-slate-300">Critical: {inspectCatalogItem.irrigationSchedule.criticalStages.join(', ')}</p>
                    </Card>

                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-rose-400">8. Pest Alerts</h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {inspectCatalogItem.pestAlerts.map((p, i) => <li key={i}>• <strong>{p.pestName}:</strong> {p.treatment}</li>)}
                      </ul>
                    </Card>

                    <Card variant="glass" className="p-4 space-y-2 border-slate-800 bg-slate-900">
                      <h4 className="text-sm font-bold text-teal-400">9 & 10. Disease & Harvest</h4>
                      <p className="text-xs text-slate-300">Disease: {inspectCatalogItem.diseasePrevention[0]?.diseaseName}</p>
                      <p className="text-xs text-slate-300">Expected Yield: {inspectCatalogItem.harvestReminder.expectedYieldPerAcre}</p>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: ADD NEW CROP FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <Card variant="glass" className="w-full max-w-lg p-6 space-y-5 border-emerald-500/40 bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold flex items-center gap-2 text-white">
                <Icon name="event" size={22} className="text-emerald-400" />
                Add Crop to Active Farm Schedule
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Select Crop from Catalog (17 Crops)</label>
                <select
                  value={formCropId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setFormCropId(id);
                    const match = CROP_CATALOG.find(c => c.id === id);
                    if (match) {
                      setFormVariety(match.defaultVariety);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-white font-semibold outline-none"
                >
                  {CROP_CATALOG.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.icon} {crop.name} ({crop.durationDisplay})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Custom Crop Title (Optional Override)</label>
                <input
                  type="text"
                  value={formCustomName}
                  onChange={(e) => setFormCustomName(e.target.value)}
                  placeholder="e.g., Organic Sonamasuri Paddy or Teja Chilli Block"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Variety Name</label>
                  <input
                    type="text"
                    value={formVariety}
                    onChange={(e) => setFormVariety(e.target.value)}
                    placeholder="e.g., Arka Rakshak F1"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Sowing / Planting Date</label>
                  <input
                    type="date"
                    value={formSowingDate}
                    onChange={(e) => setFormSowingDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Field Area & Block Name</label>
                <input
                  type="text"
                  value={formFieldArea}
                  onChange={(e) => setFormFieldArea(e.target.value)}
                  placeholder="e.g., 2.5 Acres (Field Block A)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleAddCropSubmit}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold shadow-lg"
              >
                Install Timeline & Reminders
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
