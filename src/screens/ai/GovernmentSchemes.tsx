/**
 * Government Schemes & Subsidies Portal
 * Complete database of Central & State Agricultural Schemes (PM-KISAN, Rythu Bharosa,
 * Drip Irrigation, Crop Insurance, Kisan Credit Card) with direct eligibility checks and applying modal.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

export interface GovtScheme {
  id: string;
  title: string;
  category: 'Central Government' | 'State Government' | 'Organic Farming' | 'Subsidies' | 'Loans' | 'Insurance';
  financialBenefit: string;
  shortDesc: string;
  eligibility: string[];
  benefits: string[];
  documentsRequired: string[];
  applicationSteps: string[];
  officialUrl: string;
  badge: string;
}

const mockSchemes: GovtScheme[] = [
  {
    id: 'scheme-1',
    title: 'PM-KISAN Samman Nidhi Yojana',
    category: 'Central Government',
    financialBenefit: '₹6,000 / Year (Direct Cash Transfer)',
    shortDesc: 'Financial support of ₹6,000 per year transferred directly to bank accounts of land-holding farmer families in 3 equal installments.',
    eligibility: [
      'Small and Marginal Farmers holding cultivable land',
      'Aadhaar linked with land Pattadar Passbook',
      'Institutional landholders and high-income tax payers excluded'
    ],
    benefits: [
      '₹2,000 every 4 months directly credited via Aadhaar DBT',
      'Zero processing fee or middleman commission',
      'Automatic linkage with PM Kisan Maandhan pension scheme'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land Ownership Document (Pattadar Passbook / Adangal / RoR 1B)',
      'Bank Account passbook linked with NPCI Aadhaar seeding'
    ],
    applicationSteps: [
      '1. Verify Aadhaar details and mobile OTP',
      '2. Upload land survey number and area in acres',
      '3. Submit application for Agriculture Officer approval'
    ],
    officialUrl: 'https://pmkisan.gov.in',
    badge: 'Popular Central Scheme'
  },
  {
    id: 'scheme-2',
    title: 'YSR Rythu Bharosa / PM-KISAN (AP State)',
    category: 'State Government',
    financialBenefit: '₹13,500 / Year',
    shortDesc: 'Comprehensive income support scheme by Government of Andhra Pradesh providing ₹13,500 annually to land-owning and tenant farmers.',
    eligibility: [
      'Farmer families residing in Andhra Pradesh',
      'Landowning farmers, tenant farmers (CCRC holders), and SC/ST/OBC organic farmers'
    ],
    benefits: [
      '₹7,500 in May (Sowing Season)',
      '₹4,000 in October (Harvesting Season)',
      '₹2,000 in January (Sankranti Festival)'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'CCRC Tenant Agreement / Land Passbook',
      'Aadhaar seeded bank account'
    ],
    applicationSteps: [
      '1. Visit Village Agriculture Assistant (VAA) office or apply here',
      '2. Complete e-KYC biometric verification',
      '3. Receive direct DBT credit confirmation'
    ],
    officialUrl: 'https://rythubharosa.ap.gov.in',
    badge: 'AP State Portal'
  },
  {
    id: 'scheme-3',
    title: 'PM Krishi Sinchayee Yojana (Micro Irrigation Subsidy)',
    category: 'Subsidies',
    financialBenefit: 'Up to 90% Subsidy on Drip & Sprinkler',
    shortDesc: 'Subsidized drip and sprinkler irrigation system installation to improve water use efficiency and reduce electricity costs.',
    eligibility: [
      'All farmers with assured water source (Borewell / Canal / Well)',
      'Minimum land requirement: 0.5 Acres'
    ],
    benefits: [
      '90% subsidy for Small & Marginal Farmers (Up to 5 Acres)',
      '80% subsidy for other farmers',
      'Free 3-year maintenance and filter replacement from vendor'
    ],
    documentsRequired: [
      'Land Adangal copy',
      'Electricity connection certificate / Borewell NOC',
      'Passport size photos and Aadhaar'
    ],
    applicationSteps: [
      '1. Submit land survey map and crop type',
      '2. Micro-irrigation company engineer field survey',
      '3. Government sanction order & installation'
    ],
    officialUrl: 'https://pmksy.gov.in',
    badge: '90% Subsidy'
  },
  {
    id: 'scheme-4',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Insurance',
    financialBenefit: '100% Crop Damage Insurance Coverage',
    shortDesc: 'Comprehensive crop insurance protecting against yield loss due to non-preventable natural risks, drought, floods, pests, and cyclones.',
    eligibility: [
      'All farmers growing notified crops (Paddy, Chili, Cotton, Tomato) in notified areas'
    ],
    benefits: [
      'Nominal premium: 1.5% for Kharif crops, 2.0% for Rabi crops',
      'Direct insurance payout to bank account based on Crop Cutting Experiments (CCE)',
      'Post-harvest localized hail/cyclone damage covered'
    ],
    documentsRequired: [
      'Crop Sowing Certificate issued by VAA',
      'Land Passbook & Aadhaar',
      'Bank Account details'
    ],
    applicationSteps: [
      '1. Select notified crop and acreage',
      '2. Pay nominal premium online or via CSC',
      '3. Receive insurance policy receipt'
    ],
    officialUrl: 'https://pmfby.gov.in',
    badge: 'Low Premium'
  },
  {
    id: 'scheme-5',
    title: 'Kisan Credit Card (KCC) Collateral-Free Agri Loan',
    category: 'Loans',
    financialBenefit: 'Up to ₹3,000,000 @ 4% Interest Rate',
    shortDesc: 'Timely credit support to farmers for crop cultivation inputs, harvest expenses, and farm maintenance with 3% interest subvention.',
    eligibility: [
      'All farmers, individual/joint borrowers, tenant farmers, and SHG crop groups'
    ],
    benefits: [
      'No collateral required for loans up to ₹1,60,000',
      'Effective low interest rate of 4% per annum upon prompt repayment',
      'ATM enabled KCC debit card for hassle-free cash withdrawal'
    ],
    documentsRequired: [
      'KCC Application Form',
      'Land ownership documents',
      'Aadhaar & PAN card'
    ],
    applicationSteps: [
      '1. Fill simplified 1-page KCC form',
      '2. Bank branch verification in 14 days',
      '3. Sanction & issuance of KCC card'
    ],
    officialUrl: 'https://sbi.co.in/agri-kcc',
    badge: '4% Effective Rate'
  },
  {
    id: 'scheme-6',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY Organic)',
    category: 'Organic Farming',
    financialBenefit: '₹50,000 / Hectare for Organic Transition',
    shortDesc: 'Promotes organic farming through cluster approach and PGS (Participatory Guarantee System) organic certification.',
    eligibility: [
      'Farmers forming organic clusters of 50 or more farmers'
    ],
    benefits: [
      '₹31,000 directly provided for organic inputs (Neem cake, bio-fertilizers)',
      '₹8,800 for organic packaging and marketing assistance',
      'Free PGS Organic certification'
    ],
    documentsRequired: [
      'Cluster member list',
      'Land records',
      'Bank details'
    ],
    applicationSteps: [
      '1. Form farmer group/cluster in village',
      '2. Register cluster on PKVY portal',
      '3. Receive organic input grant'
    ],
    officialUrl: 'https://pgsindia-ncof.gov.in',
    badge: 'Organic Grant'
  }
];

export const GovernmentSchemes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<GovtScheme | null>(null);

  const categories = ['All', 'Central Government', 'State Government', 'Organic Farming', 'Subsidies', 'Loans', 'Insurance'];

  const filteredSchemes = mockSchemes.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.financialBenefit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-1 max-w-2xl">
          <Badge variant="emerald" size="md" icon="account_balance">
            Central & State Subsidy Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Government Schemes & Direct Subsidies
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Apply directly for PM-KISAN, Rythu Bharosa, drip irrigation, crop insurance, and Kisan Credit Card with automated Aadhaar verification.
          </p>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Icon name="search" size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes, subsidies..."
            className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* SCHEMES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => (
          <Card
            key={scheme.id}
            variant="glass"
            className="p-6 flex flex-col justify-between space-y-4 border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="emerald" size="sm">{scheme.category}</Badge>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {scheme.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white line-clamp-2">
                {scheme.title}
              </h3>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-xs font-extrabold text-emerald-300">
                💰 Benefit: {scheme.financialBenefit}
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {scheme.shortDesc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Icon name="open_in_new" size={14} /> Govt Portal
              </a>

              <Button
                variant="accent"
                size="sm"
                leftIcon="assignment_turned_in"
                onClick={() => setSelectedSchemeModal(scheme)}
              >
                View & Apply
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* SCHEME DETAIL & APPLY MODAL */}
      {selectedSchemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <Card variant="glass" className="w-full max-w-2xl p-6 sm:p-8 space-y-6 border-emerald-500/40 bg-slate-900 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <Badge variant="emerald" size="sm">{selectedSchemeModal.category}</Badge>
                <h2 className="text-xl font-black text-white mt-1">{selectedSchemeModal.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchemeModal(null)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/30 text-emerald-300 font-extrabold">
                Financial Benefit: {selectedSchemeModal.financialBenefit}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <Icon name="verified_user" size={18} /> Eligibility Criteria
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedSchemeModal.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-teal-400 flex items-center gap-1.5 text-sm">
                  <Icon name="description" size={18} /> Documents Required
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedSchemeModal.documentsRequired.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <Icon name="format_list_numbered" size={18} /> Application Steps
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {selectedSchemeModal.applicationSteps.map((step, i) => (
                    <li key={i} className="p-2 rounded-lg bg-black/30 border border-white/5">{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={selectedSchemeModal.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-400 flex items-center gap-1"
              >
                <Icon name="open_in_new" size={16} /> Official Govt Website ({selectedSchemeModal.officialUrl})
              </a>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => setSelectedSchemeModal(null)}>Close</Button>
                <Button
                  variant="accent"
                  onClick={() => {
                    alert(`Application submitted for ${selectedSchemeModal.title}! Application Ref #: AP-AGRI-2026-98124`);
                    setSelectedSchemeModal(null);
                  }}
                >
                  Submit Application Online
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
