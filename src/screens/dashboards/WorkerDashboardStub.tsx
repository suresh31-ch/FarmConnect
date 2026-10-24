/**
 * FarmConnect Worker Dashboard
 * Dedicated portal for agricultural laborers, tractor drivers, and contract teams
 * to find daily wage jobs, accept farm contracts, track direct payouts, and review ratings.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const WorkerDashboardStub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useAppState();

  const [appliedJobs, setAppliedJobs] = useState<string[]>(['j1']);

  const jobsList = [
    {
      id: 'j1',
      title: 'Cotton Harvest Team Needed (10 Workers)',
      farmName: 'Sri Venkateswara Organic Farm',
      location: 'Tenali, Guntur (3.2 km)',
      wage: '₹650 / day',
      duration: '4 Days (Jul 26 - Jul 29)',
      badge: 'Immediate',
      tags: ['Cotton Harvest', 'Direct Bank Payout', 'Lunch Provided'],
    },
    {
      id: 'j2',
      title: 'Experienced Tractor Driver for Plowing',
      farmName: 'Krishna Valley Estate',
      location: 'Vijayawada Rural (8.5 km)',
      wage: '₹850 / day',
      duration: '2 Days (Jul 25 - Jul 26)',
      badge: 'Skilled Driver',
      tags: ['50HP Mahindra', 'Hourly Incentive'],
    },
    {
      id: 'j3',
      title: 'Paddy Transplanting Daily Wage Group',
      farmName: 'Lakshmi Bio Farm',
      location: 'Mangalagiri (5.1 km)',
      wage: '₹580 / day',
      duration: '3 Days',
      badge: 'Daily Wage',
      tags: ['Paddy Field', 'Escrow Guarantee'],
    },
  ];

  const workerEarningsData = [
    { week: 'W1', earnings: 3900 },
    { week: 'W2', earnings: 4550 },
    { week: 'W3', earnings: 5200 },
    { week: 'W4', earnings: 4800 },
  ];

  const toggleApplyJob = (id: string) => {
    setAppliedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. WORKER HERO BANNER */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1E88E5]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm" icon="groups">
                AGRICULTURAL WORKER PORTAL
              </Badge>
              <span className="text-xs text-blue-100 font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                Guaranteed Direct Bank Payouts
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || 'Ramu Naik'}! 🚜
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Find nearby farm daily wage jobs, tractor operator shifts, and seasonal contract harvest teams in Guntur district.
            </p>

            <div className="pt-1 flex flex-wrap gap-3 text-xs text-amber-300 font-bold">
              <span>★ 4.8 Rating (16 Farmer Reviews)</span>
              <span>• Skilled Tractor Driver & Harvest Lead</span>
            </div>
          </div>

          <Button
            variant="accent"
            size="lg"
            leftIcon="work"
            onClick={() => setActiveTab('worker_marketplace')}
            className="shadow-2xl shrink-0"
          >
            Explore 28 Available Jobs
          </Button>
        </div>
      </Card>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Job Opportunities', value: '28 Jobs', icon: 'work_outline', change: 'Within 15 km' },
          { label: 'Avg Daily Wage', value: '₹650 / day', icon: 'payments', change: 'Direct Bank Transfer' },
          { label: 'Days Worked This Month', value: '14 Days', icon: 'event_available', change: '₹9,100 Earned' },
          { label: 'Worker Reputation Rating', value: '4.8 ★', icon: 'thumb_up', change: '16 Verified Reviews' },
        ].map((m, idx) => (
          <Card key={idx} variant="glass" className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">{m.label}</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                <Icon name={m.icon} size={20} />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{m.change}</div>
          </Card>
        ))}
      </div>

      {/* 3. NEARBY JOBS LIST & EARNINGS CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Nearby Farm Job Openings
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300">
                Direct job invitations from local verified farmers
              </p>
            </div>
            <Badge variant="blue" size="sm">Guntur Region</Badge>
          </div>

          <div className="space-y-3">
            {jobsList.map((job) => {
              const isApplied = appliedJobs.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-emerald-800/40 space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" size="sm">{job.badge}</Badge>
                        <span className="text-xs font-bold text-[#2E7D32] dark:text-emerald-300">
                          {job.farmName}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-500">📍 {job.location} • 📅 {job.duration}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {job.wage}
                      </div>
                      <Button
                        variant={isApplied ? 'outline' : 'primary'}
                        size="sm"
                        leftIcon={isApplied ? 'check_circle' : 'send'}
                        onClick={() => toggleApplyJob(job.id)}
                      >
                        {isApplied ? 'Application Sent' : 'Express Interest'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-emerald-300 px-2 py-0.5 rounded-lg"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Earnings Bar Chart */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Earnings History
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300">Direct wallet payouts</p>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D47A1',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${val}`, 'Payout']}
                />
                <Bar dataKey="earnings" fill="#1E88E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Icon name="verified_user" size={16} /> Direct Escrow Payouts
            </div>
            <p className="text-[11px] opacity-90">
              Wages are credited automatically to your linked Aadhaar bank account within 2 hours of farmer shift approval.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
