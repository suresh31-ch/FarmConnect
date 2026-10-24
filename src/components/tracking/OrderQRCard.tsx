/**
 * FarmConnect Professional Order Delivery Verification QR Card
 * Renders dynamic SVG QR code encoding real order data for doorstep delivery verification
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { OrderItem } from '../../context/FarmDataContext';
import { generateVerificationToken, QRVerificationData } from '../../services/qrVerificationService';

export interface OrderQRCardProps {
  order: OrderItem;
  className?: string;
}

export const OrderQRCard: React.FC<OrderQRCardProps> = ({ order, className = '' }) => {
  const [showFullModal, setShowFullModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const verificationToken =
    order.verificationToken || generateVerificationToken(order.id, order.orderNumber);

  const qrPayload: QRVerificationData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    productIds: order.items.map((i) => i.productId),
    farmerId: order.farmerName || 'f1',
    consumerId: order.consumerName || 'c1',
    deliveryPartnerId: order.driverId || 'd3',
    orderAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    orderTimestamp: order.createdAt,
    verificationToken: verificationToken,
    deliveryStatus: order.status,
  };

  const qrString = JSON.stringify(qrPayload);

  const isDelivered = order.status === 'delivered';
  const isDriverAssigned = !!(order.driverId || order.driverName);

  if (!isDriverAssigned && !isDelivered) {
    return (
      <Card variant="glass" className={`p-5 text-center space-y-3 border border-amber-300 dark:border-amber-800/60 ${className}`}>
        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow">
          <Icon name="schedule" size={24} className="animate-spin" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Delivery Partner Assignment Pending
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Your unique delivery verification QR code will be generated automatically as soon as a verified delivery partner accepts your order.
          </p>
        </div>
      </Card>
    );
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verificationToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <>
      <Card
        variant="glass"
        className={`p-5 space-y-4 border-2 ${
          isDelivered
            ? 'border-emerald-500/50 bg-emerald-950/10'
            : 'border-emerald-600/80 dark:border-emerald-500/70'
        } shadow-2xl relative overflow-hidden ${className}`}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow">
              <Icon name="qr_code_2" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Order Delivery QR Code
                </span>
                <Badge variant={isDelivered ? 'emerald' : 'amber'} size="sm">
                  {isDelivered ? 'VERIFIED & DELIVERED' : 'READY FOR SCAN'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300">
                Order #{order.orderNumber} • Driver: {order.driverName || 'Assigned Driver'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullModal(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-emerald-300 hover:bg-emerald-100 hover:text-emerald-900 transition-all text-xs font-bold flex items-center gap-1"
            title="Expand Fullscreen QR"
          >
            <Icon name="fullscreen" size={18} />
          </button>
        </div>

        {/* QR Display Container */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <div
            onClick={() => setShowFullModal(true)}
            className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-lg cursor-pointer hover:scale-105 transition-transform flex flex-col items-center shrink-0"
          >
            <QRCodeSVG
              value={qrString}
              size={130}
              level="H"
              includeMargin={false}
              aria-label={`Delivery QR Code for Order ${order.orderNumber}`}
            />
            <span className="text-[9px] font-mono text-slate-600 font-bold mt-1">
              TAP TO EXPAND
            </span>
          </div>

          <div className="flex-1 space-y-2 text-left w-full">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                Verification Security Token
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-300 overflow-hidden">
                <span className="truncate flex-1">{verificationToken}</span>
                <button
                  onClick={handleCopyToken}
                  className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                  title="Copy Token"
                >
                  <Icon name={copiedToken ? 'check' : 'content_copy'} size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Payment Status</span>
                <span className="font-extrabold text-slate-800 dark:text-emerald-200 uppercase">
                  {order.paymentStatus === 'paid' ? '✅ PAID (Escrow)' : '💵 CASH ON DELIVERY'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Bill</span>
                <span className="font-extrabold text-[#2E7D32] dark:text-emerald-400">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
              {isDelivered
                ? 'Order delivery has been verified and completed via QR scan. Invoice & earnings updated.'
                : 'Show this QR code to your delivery partner upon arrival to complete verification and release farm escrow.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Fullscreen QR Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-sm w-full p-6 text-center space-y-4 border border-emerald-500 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <Icon name="qr_code_scanner" size={22} className="text-[#2E7D32]" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Doorstep Delivery QR
                  </h3>
                  <p className="text-[11px] text-slate-500">Order #{order.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Large QR */}
            <div className="p-5 bg-white rounded-3xl border-4 border-slate-900 shadow-xl inline-block mx-auto">
              <QRCodeSVG value={qrString} size={220} level="H" includeMargin={false} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                Verification Token
              </span>
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl font-mono text-xs font-bold text-[#2E7D32] dark:text-emerald-300 break-all">
                {verificationToken}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Delivery Partner will scan this screen to complete verification.
            </p>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowFullModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
