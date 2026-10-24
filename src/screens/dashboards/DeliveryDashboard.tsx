/**
 * FarmConnect Delivery Partner Dashboard
 * Features:
 * - Online / Offline duty status toggle
 * - Vehicle specification & payload meter powered by logisticsService
 * - Interactive QR Verification simulation for farm-gate pickup & customer delivery handoff
 * - Active Delivery Trips list with live status stepper
 * - Simulated AI Route Navigation Map
 * - Daily Earnings breakdown & Instant Bank Payout request
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useFarmData } from '../../context/FarmDataContext';
import { calculateLogistics, DRIVER_POOL } from '../../services/logisticsService';
import { ChatModal } from '../../components/chat/ChatModal';
import { DeliveryQRVerificationModal } from '../../components/tracking/DeliveryQRVerificationModal';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, completeDelivery } = useFarmData();

  // Partner Duty Status
  const [isOnline, setIsOnline] = useState(true);

  // Selected driver profile from pool (or user)
  const myDriverInfo = DRIVER_POOL[2]; // Venkat Subbaiah (Bolero Pickup)

  // QR Verification Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrModalOrder, setActiveQrModalOrder] = useState<any | null>(null);
  const [payoutRequested, setPayoutRequested] = useState(false);

  // Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{
    orderNumber: string;
    name: string;
    role: 'consumer' | 'farmer';
    phone?: string;
  } | null>(null);

  // Active deliveries from global state or mock fallback
  const activeDeliveries = orders.filter(
    (o) => o.status === 'packed' || o.status === 'out_for_delivery' || o.status === 'accepted'
  );

  // Calculate logistics info for active orders
  const sampleWeightKg = activeDeliveries.reduce((acc, o) => {
    const itemWeight = o.items.reduce((w, i) => w + i.quantity * 5, 0); // approx 5kg per unit
    return acc + itemWeight;
  }, 120);

  const logisticsData = calculateLogistics(sampleWeightKg, 18.5);

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER WITH ONLINE DUTY TOGGLE */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/80 border border-emerald-500/20 shadow-2xl rounded-3xl"
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="rose" size="sm" icon="local_shipping">
                LOGISTICS PARTNER PORTAL
              </Badge>
              <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full backdrop-blur-md">
                Vehicle: {logisticsData.vehicle.type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {user?.name || myDriverInfo.name}! 🚚
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Assigned Route: <strong className="text-emerald-400">Tenali Farm Cluster ➔ Vijayawada Hub</strong>. Real-time GPS tracking & instant QR verification enabled.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-300">
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/50">
                <Icon name="verified" size={16} className="text-emerald-400" /> Reg: {myDriverInfo.vehicleNumber}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/50">
                <Icon name="star" size={16} className="text-amber-400" /> Rating: {myDriverInfo.rating} ★ ({myDriverInfo.completedTrips} Trips)
              </span>
            </div>
          </div>

          {/* Duty Status Button Toggle */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="p-3.5 bg-slate-900/80 backdrop-blur-xl rounded-2xl flex items-center justify-between gap-4 border border-emerald-500/30 shadow-xl">
              <div>
                <span className="text-xs font-bold text-white block">Duty Status</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {isOnline ? 'Ready for Pickups' : 'Offline'}
                </span>
              </div>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md ${
                  isOnline
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isOnline ? 'ONLINE' : 'GO ONLINE'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. LOGISTICS ENGINE VEHICLE SPEC & METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 space-y-2 border-slate-200/80 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Logistics Vehicle</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Icon name="local_shipping" size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {logisticsData.vehicle.type}
          </div>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            Cap: Up to {logisticsData.vehicle.maxWeightKg} kg
          </span>
        </Card>

        <Card variant="glass" className="p-4 space-y-2 border-slate-200/80 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Load</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Icon name="line_weight" size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {sampleWeightKg} kg
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (sampleWeightKg / logisticsData.vehicle.maxWeightKg) * 100)}%`,
              }}
            />
          </div>
        </Card>

        <Card variant="glass" className="p-4 space-y-2 border-slate-200/80 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Icon name="account_balance_wallet" size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            ₹1,850
          </div>
          <button
            onClick={() => setPayoutRequested(true)}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline block"
          >
            {payoutRequested ? '✓ Bank Transfer Initiated' : 'Request Instant Payout ➔'}
          </button>
        </Card>

        <Card variant="glass" className="p-4 space-y-2 border-slate-200/80 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Est. Route ETA</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Icon name="schedule" size={18} />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {logisticsData.formattedEta}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Distance: {logisticsData.distanceKm} km
          </span>
        </Card>
      </div>

      {/* 3. ACTIVE DELIVERIES & ROUTE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliveries List */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-2 border-slate-200 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Assigned Delivery Orders ({activeDeliveries.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pick up directly from farms & deliver to customer doorstep
              </p>
            </div>
            <Badge variant="rose" size="sm">Active Shift</Badge>
          </div>

          <div className="space-y-4">
            {activeDeliveries.length === 0 ? (
              <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300">
                <Icon name="check_circle" size={40} className="text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-white">
                  All assigned orders delivered successfully!
                </p>
                <p className="text-xs text-slate-500">Stay online for new order assignments.</p>
              </div>
            ) : (
              activeDeliveries.map((ord) => {
                const totalKg = ord.items.reduce((acc, i) => acc + i.quantity * 5, 0);

                return (
                  <div
                    key={ord.id}
                    className="p-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-emerald-800/40 space-y-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                            Order #{ord.orderNumber}
                          </span>
                          <Badge variant="blue" size="sm">
                            {totalKg} kg payload
                          </Badge>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                          🌾 Farm: {ord.farmerName} (Guntur Organic Farm)
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-emerald-200">
                          🏠 Customer: {ord.consumerName} • {ord.consumerAddress}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          Trip Pay: ₹{ord.deliveryFee || 180}
                        </div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {ord.status.toUpperCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Order items summary */}
                    <div className="text-xs text-slate-600 dark:text-emerald-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-emerald-900/40">
                      <span className="font-bold text-slate-700 dark:text-emerald-200 block mb-1">
                        Package Contents:
                      </span>
                      {ord.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(' • ')}
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon="chat"
                          onClick={() => {
                            setChatTarget({
                              orderNumber: ord.orderNumber,
                              name: ord.consumerName,
                              role: 'consumer',
                              phone: ord.consumerPhone,
                            });
                            setChatModalOpen(true);
                          }}
                        >
                          Chat Customer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon="chat"
                          onClick={() => {
                            setChatTarget({
                              orderNumber: ord.orderNumber,
                              name: ord.farmerName,
                              role: 'farmer',
                              phone: ord.farmerPhone || '+91 98490 55112',
                            });
                            setChatModalOpen(true);
                          }}
                        >
                          Chat Farmer
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === 'accepted' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon="close"
                              onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                              className="text-rose-600 border-rose-300 hover:bg-rose-50"
                            >
                              Reject Delivery
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon="check_circle"
                              onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                            >
                              Accept Delivery (Assign)
                            </Button>
                          </>
                        )}

                        {(ord.status === 'packed' || ord.status === 'out_for_delivery') && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon="qr_code_scanner"
                            onClick={() => {
                              setActiveQrModalOrder(ord);
                              setIsQrModalOpen(true);
                            }}
                          >
                            Scan Delivery QR
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* AI Route Navigation Simulation */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-1 border-slate-200 dark:border-emerald-800/40">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Route Guidance Map
            </h3>
            <p className="text-xs text-slate-500">Live GPS & Traffic Sequence</p>
          </div>

          <div className="h-64 w-full bg-slate-950 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-800 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Map Visual Pin */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <Icon name="navigation" size={28} />
              </div>

              <div>
                <span className="text-xs font-black text-white block">
                  Next Stop: Guntur Farmers Mandi
                </span>
                <span className="text-[11px] text-rose-300 font-semibold">
                  Distance: 4.2 km • Speed: 38 km/h
                </span>
              </div>

              <span className="inline-block text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-mono">
                ✓ Lowest Carbon Footprint Route
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-emerald-200">
              <span>Optimized Fuel Usage:</span>
              <span className="font-bold">1.2 Liters</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-emerald-200">
              <span>Traffic Condition:</span>
              <span className="font-bold text-emerald-600">Clear Green Corridor</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. REALTIME QR CODE HANDOFF VERIFICATION MODAL */}
      <DeliveryQRVerificationModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setActiveQrModalOrder(null);
        }}
        assignedOrder={activeQrModalOrder}
        allOrders={orders}
        driverId={myDriverInfo.id}
        driverName={user?.name || myDriverInfo.name}
        onCompleteDelivery={async (orderId, token) => {
          await completeDelivery(orderId, token, {
            driverId: myDriverInfo.id,
            driverName: user?.name || myDriverInfo.name,
          });
        }}
      />

      {/* Realtime Chat Modal */}
      {chatModalOpen && chatTarget && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          orderNumber={chatTarget.orderNumber}
          myRole="delivery"
          myName={user?.name || myDriverInfo.name}
          otherPartyName={chatTarget.name}
          otherPartyRole={chatTarget.role}
          otherPartyPhone={chatTarget.phone}
        />
      )}
    </div>
  );
};
