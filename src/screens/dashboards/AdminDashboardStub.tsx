/**
 * FarmConnect Admin Governance Dashboard
 * System admin view for user verification queues, ecosystem metrics,
 * AI model health, transaction auditing, and dispute moderation.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';

export const AdminDashboardStub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useAppState();

  const [verifications, setVerifications] = useState([
    { id: 'v1', name: 'Ramesh Naidu', type: 'Farmer', location: 'Prakasam AP', land: '6.2 Acres', document: 'Aadhaar + Patta Passbook' },
    { id: 'v2', name: 'Kisan Logistics Ltd', type: 'Delivery Agency', location: 'Vijayawada', land: '12 Vehicles', document: 'GST + Transport License' },
    { id: 'v3', name: 'Chandra Sekhar', type: 'Tractor Driver', location: 'Guntur', land: 'Mahindra 575 DI', document: 'Driving License' },
  ]);

  const handleApprove = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-[#FF6F00] via-[#FF8F00] to-[#FFA000]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm" icon="admin_panel_settings">
                SYSTEM GOVERNANCE PORTAL
              </Badge>
              <span className="text-xs text-amber-950 font-bold bg-white/30 px-2.5 py-0.5 rounded-full">
                System Governance Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Ecosystem Governance • {user?.name || 'Admin'} ⚙️
            </h1>

            <p className="text-xs sm:text-sm text-slate-900/90 leading-relaxed">
              Real-time platform trade monitoring, user identity verification queues, dispute moderation, and Gemini AI health monitoring.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            leftIcon="monitoring"
            onClick={() => setActiveTab('settings')}
            className="shadow-2xl shrink-0"
          >
            System Diagnostics
          </Button>
        </div>
      </Card>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ecosystem Users', value: '14,250', icon: 'people', change: '+850 this month' },
          { label: 'Verified Farmers', value: '8,920', icon: 'verified', change: '98% Pass Rate' },
          { label: 'Gross Trade Volume', value: '₹1.84 Cr', icon: 'payments', change: 'Zero Commission' },
          { label: 'Pending Verifications', value: `${verifications.length} Queue`, icon: 'pending_actions', change: 'Action Required' },
        ].map((m, idx) => (
          <Card key={idx} variant="glass" className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">{m.label}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Icon name={m.icon} size={20} />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{m.change}</div>
          </Card>
        ))}
      </div>

      {/* 3. VERIFICATION QUEUE & AI HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Queue */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Pending Identity & Land Record Verifications ({verifications.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300">
                Aadhaar + Land Passbook verification queue
              </p>
            </div>
            <Badge variant="amber" size="sm">Verification Queue</Badge>
          </div>

          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300">
                <Icon name="verified" size={36} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">All pending user verifications approved!</p>
              </div>
            ) : (
              verifications.map((v) => (
                <div
                  key={v.id}
                  className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-emerald-800/40 space-y-2 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" size="sm">{v.type}</Badge>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {v.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">📍 {v.location} • Details: {v.land}</p>
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 pt-0.5">
                      📄 Document: {v.document}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon="check"
                      onClick={() => handleApprove(v.id)}
                    >
                      Approve & Verify
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* AI Model Health Card */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Krishi Mitra Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300">
              Gemini Vision & Disease Model metrics
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Disease Scan Latency', val: '420 ms', status: 'Optimal' },
              { label: 'Multilingual Accuracy', val: '98.6%', status: 'High' },
              { label: 'Voice Queries Today', val: '1,240', status: 'Active' },
              { label: 'Mandi Price Feed API', val: 'Online', status: 'Connected' },
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-emerald-200">{st.label}</span>
                <span className="font-bold text-[#2E7D32] dark:text-emerald-300">{st.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
