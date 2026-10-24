/**
 * Live Delivery Tracking Component with Animated Driver Marker & Route
 * Features:
 * - Farmer Location Pin (Pickup)
 * - Consumer Location Pin (Dropoff)
 * - Live Moving Delivery Driver Marker along Polyline route
 * - Route Polyline visualization
 * - Live ETA countdown
 * - Call Driver & WhatsApp Driver buttons
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

export interface LiveTrackingProps {
  orderNumber: string;
  farmerName: string;
  farmerAddress: string;
  consumerName: string;
  consumerAddress: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleNumber: string;
  distanceKm?: number;
  initialEtaMinutes?: number;
}

export const LiveTrackingMap: React.FC<LiveTrackingProps> = ({
  orderNumber,
  farmerName,
  farmerAddress,
  consumerName,
  consumerAddress,
  driverName,
  driverPhone,
  vehicleType,
  vehicleNumber,
  distanceKm = 14.2,
  initialEtaMinutes = 18,
}) => {
  // Driver route progress from 0% (Farmer Farm Gate) to 100% (Consumer Doorstep)
  const [progress, setProgress] = useState(35);
  const [etaMinutes, setEtaMinutes] = useState(initialEtaMinutes);

  // Animate driver moving along route
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 1.5;
      });
      setEtaMinutes((prev) => Math.max(2, Math.round(initialEtaMinutes * (1 - progress / 100))));
    }, 2000);

    return () => clearInterval(interval);
  }, [initialEtaMinutes, progress]);

  // Interpolate SVG path coordinates for smooth driver marker movement
  // Route goes from (50, 180) [Farmer] through control points to (350, 60) [Consumer]
  const calculateDriverCoord = (pct: number) => {
    const startX = 60;
    const startY = 170;
    const endX = 340;
    const endY = 60;
    const ctrl1X = 140;
    const ctrl1Y = 220;
    const ctrl2X = 260;
    const ctrl2Y = 40;

    const t = pct / 100;
    // Cubic Bezier curve calculation
    const x =
      Math.pow(1 - t, 3) * startX +
      3 * Math.pow(1 - t, 2) * t * ctrl1X +
      3 * (1 - t) * Math.pow(t, 2) * ctrl2X +
      Math.pow(t, 3) * endX;
    const y =
      Math.pow(1 - t, 3) * startY +
      3 * Math.pow(1 - t, 2) * t * ctrl1Y +
      3 * (1 - t) * Math.pow(t, 2) * ctrl2Y +
      Math.pow(t, 3) * endY;

    return { x, y };
  };

  const driverCoord = calculateDriverCoord(progress);

  const cleanPhone = driverPhone.replace(/\s+/g, '');

  return (
    <Card variant="glass" className="p-5 space-y-4 border-2 border-emerald-500/50 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-emerald-900/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm" icon="navigation">
              LIVE GPS TRACKING
            </Badge>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-300">
              Order #{orderNumber}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
            Doorstep Delivery in Progress 🚚
          </h3>
        </div>

        {/* Live ETA Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 shrink-0">
          <Icon name="schedule" size={20} className="animate-spin" />
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-900">
              Estimated Arrival
            </div>
            <div className="text-base leading-none font-extrabold">
              {etaMinutes} Mins ({Math.round(distanceKm * (1 - progress / 100))} km away)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
        {/* Grid Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-40" />

        {/* SVG Route Canvas */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Route Polyline (Bezier Curve) */}
          <path
            d="M 60 170 C 140 220, 260 40, 340 60"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeDasharray="8 4"
            className="animate-pulse"
            filter="url(#glow)"
          />

          {/* Farmer Location Pin (Start) */}
          <g transform="translate(60, 170)">
            <circle r="16" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
            <circle r="12" fill="#047857" stroke="#34D399" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              🌾
            </text>
          </g>

          {/* Consumer Location Pin (End) */}
          <g transform="translate(340, 60)">
            <circle r="18" fill="#3B82F6" fillOpacity="0.2" className="animate-ping" />
            <circle r="14" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
              🏠
            </text>
          </g>

          {/* Live Moving Delivery Driver Marker */}
          <g transform={`translate(${driverCoord.x}, ${driverCoord.y})`} filter="url(#glow)">
            <circle r="16" fill="#F59E0B" fillOpacity="0.3" className="animate-ping" />
            <circle r="13" fill="#D97706" stroke="#FBBF24" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
              🚚
            </text>
          </g>
        </svg>

        {/* On-Map Floating Labels */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-300 font-bold shadow-lg">
          📍 Pickup: {farmerName} ({farmerAddress})
        </div>

        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/40 text-[11px] text-blue-300 font-bold shadow-lg">
          📍 Drop: {consumerName} ({consumerAddress})
        </div>

        <div
          className="absolute bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-black text-[10px] shadow-2xl transition-all duration-300 pointer-events-none"
          style={{
            left: `${(driverCoord.x / 400) * 100}%`,
            top: `${(driverCoord.y / 240) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {driverName} • {vehicleType} ({Math.round(progress)}% Route)
        </div>
      </div>

      {/* Driver Contact & Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {driverName}
              </h4>
              <Badge variant="amber" size="sm">★ 4.9 Rating</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-300">
              Vehicle: {vehicleType} ({vehicleNumber})
            </p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={`tel:${cleanPhone}`}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="call" size={16} /> Call Driver
          </a>

          <a
            href={`https://wa.me/${cleanPhone.replace('+', '')}?text=Hi%20${encodeURIComponent(driverName)},%20checking%20status%20for%20order%20%23${orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="chat" size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </Card>
  );
};
