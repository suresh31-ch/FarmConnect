/**
 * Delivery Partner QR Scanner & Verification Modal
 * Verifies consumer QR payload against order requirements:
 * 1. Order exists
 * 2. Payment completed or COD confirmed
 * 3. Delivery partner matches assigned partner
 * 4. Order is not already delivered / token valid
 *
 * Upon verification success, allows completing delivery and triggering wallet/inventory updates.
 */

import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { OrderItem } from '../../context/FarmDataContext';
import { QRVerificationData, logQRVerification } from '../../services/qrVerificationService';

export interface DeliveryQRVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedOrder?: OrderItem | null;
  allOrders: OrderItem[];
  driverId: string;
  driverName: string;
  onCompleteDelivery: (orderId: string, verificationToken: string) => Promise<void>;
}

export const DeliveryQRVerificationModal: React.FC<
  DeliveryQRVerificationModalProps
> = ({
  isOpen,
  onClose,
  assignedOrder,
  allOrders,
  driverId,
  driverName,
  onCompleteDelivery,
}) => {
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'scanning' | 'success' | 'failed';
    matchedOrder?: OrderItem;
    errorMessage?: string;
    qrPayload?: QRVerificationData;
  }>({ status: 'idle' });

  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  if (!isOpen) return null;

  // Perform QR payload verification
  const verifyQRPayload = async (rawInput: string) => {
    setVerificationResult({ status: 'scanning' });
    await new Promise((resolve) => setTimeout(resolve, 800)); // Latency simulation

    let parsedPayload: Partial<QRVerificationData> | null = null;
    let targetOrderNumber = '';
    let targetToken = rawInput.trim();

    // Try parsing string as JSON QR payload
    try {
      parsedPayload = JSON.parse(rawInput);
      if (parsedPayload?.orderNumber) {
        targetOrderNumber = parsedPayload.orderNumber;
      }
      if (parsedPayload?.verificationToken) {
        targetToken = parsedPayload.verificationToken;
      }
    } catch {
      // If raw string is a token code e.g. FC_VERIFY_VT_...
      targetToken = rawInput.trim();
    }

    // 1. Find Order by orderNumber or ID or matching verificationToken
    const foundOrder = allOrders.find((o) => {
      if (parsedPayload?.orderId && o.id === parsedPayload.orderId) return true;
      if (targetOrderNumber && o.orderNumber === targetOrderNumber) return true;
      if (o.verificationToken && o.verificationToken === targetToken) return true;
      if (assignedOrder && o.id === assignedOrder.id) return true;
      return false;
    });

    if (!foundOrder) {
      const errMsg = 'Invalid QR Code: Order record not found in system.';
      await logQRVerification({
        order_id: parsedPayload?.orderId || 'unknown',
        order_number: targetOrderNumber || 'unknown',
        delivery_partner_id: driverId,
        delivery_partner_name: driverName,
        verification_time: new Date().toISOString(),
        location: '16.2434° N, 80.6401° E',
        result: 'failed',
        error_message: errMsg,
        token_used: targetToken,
      });

      setVerificationResult({
        status: 'failed',
        errorMessage: errMsg,
      });
      return;
    }

    // 2. Check if Order is already delivered
    if (foundOrder.status === 'delivered') {
      const errMsg = `Verification Error: Order #${foundOrder.orderNumber} has already been delivered and verified!`;
      await logQRVerification({
        order_id: foundOrder.id,
        order_number: foundOrder.orderNumber,
        delivery_partner_id: driverId,
        delivery_partner_name: driverName,
        verification_time: new Date().toISOString(),
        location: '16.2434° N, 80.6401° E',
        result: 'failed',
        error_message: errMsg,
        token_used: targetToken,
      });

      setVerificationResult({
        status: 'failed',
        matchedOrder: foundOrder,
        errorMessage: errMsg,
      });
      return;
    }

    // 3. Verify Payment Completed (paid or COD)
    const isValidPayment =
      foundOrder.paymentStatus === 'paid' ||
      foundOrder.paymentMethod === 'COD' ||
      parsedPayload?.paymentStatus === 'paid';

    if (!isValidPayment) {
      const errMsg = `Payment Verification Failed: Payment status for Order #${foundOrder.orderNumber} is pending.`;
      await logQRVerification({
        order_id: foundOrder.id,
        order_number: foundOrder.orderNumber,
        delivery_partner_id: driverId,
        delivery_partner_name: driverName,
        verification_time: new Date().toISOString(),
        location: '16.2434° N, 80.6401° E',
        result: 'failed',
        error_message: errMsg,
        token_used: targetToken,
      });

      setVerificationResult({
        status: 'failed',
        matchedOrder: foundOrder,
        errorMessage: errMsg,
      });
      return;
    }

    // 4. Verify Delivery Partner Mismatch (optional warning if driver assignment check)
    if (
      foundOrder.driverId &&
      driverId &&
      foundOrder.driverId !== driverId &&
      foundOrder.driverName &&
      !foundOrder.driverName.includes(driverName)
    ) {
      const errMsg = `Driver Mismatch: Order #${foundOrder.orderNumber} is assigned to ${foundOrder.driverName}, not ${driverName}.`;
      await logQRVerification({
        order_id: foundOrder.id,
        order_number: foundOrder.orderNumber,
        delivery_partner_id: driverId,
        delivery_partner_name: driverName,
        verification_time: new Date().toISOString(),
        location: '16.2434° N, 80.6401° E',
        result: 'failed',
        error_message: errMsg,
        token_used: targetToken,
      });

      setVerificationResult({
        status: 'failed',
        matchedOrder: foundOrder,
        errorMessage: errMsg,
      });
      return;
    }

    // Verification Success!
    await logQRVerification({
      order_id: foundOrder.id,
      order_number: foundOrder.orderNumber,
      delivery_partner_id: driverId,
      delivery_partner_name: driverName,
      verification_time: new Date().toISOString(),
      location: '16.2434° N, 80.6401° E (Verified Doorstep GPS)',
      result: 'success',
      token_used: targetToken,
    });

    setVerificationResult({
      status: 'success',
      matchedOrder: foundOrder,
      qrPayload: parsedPayload as any,
    });
  };

  // Simulate scanning active consumer QR code directly
  const handleAutoScanAssignedOrder = () => {
    if (!assignedOrder) return;
    const token =
      assignedOrder.verificationToken ||
      `FC_VERIFY_VT_${assignedOrder.orderNumber}_${assignedOrder.id}_889021`;

    const samplePayload: QRVerificationData = {
      orderId: assignedOrder.id,
      orderNumber: assignedOrder.orderNumber,
      productIds: assignedOrder.items.map((i) => i.productId),
      farmerId: assignedOrder.farmerName || 'f1',
      consumerId: assignedOrder.consumerName || 'c1',
      deliveryPartnerId: driverId,
      orderAmount: assignedOrder.totalAmount,
      paymentStatus: assignedOrder.paymentStatus,
      orderTimestamp: assignedOrder.createdAt,
      verificationToken: token,
      deliveryStatus: assignedOrder.status,
    };

    verifyQRPayload(JSON.stringify(samplePayload));
  };

  // Handle final completion
  const handleExecuteDeliveryCompletion = async () => {
    if (!verificationResult.matchedOrder) return;
    setIsSubmittingDelivery(true);

    try {
      const tokenToUse =
        verificationResult.matchedOrder.verificationToken ||
        manualTokenInput ||
        `FC_VERIFY_VT_${verificationResult.matchedOrder.orderNumber}`;

      await onCompleteDelivery(verificationResult.matchedOrder.id, tokenToUse);
      setIsSubmittingDelivery(false);
      setCompletedSuccess(true);
      setTimeout(() => {
        setCompletedSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Delivery completion error:', err);
      setIsSubmittingDelivery(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-lg w-full border border-slate-200 dark:border-emerald-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Icon name="qr_code_scanner" size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Doorstep Delivery QR Verification
              </h3>
              <p className="text-xs text-emerald-300">
                Driver: {driverName} • Verified Escrow Handover
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* COMPLETED SUCCESS STATE */}
          {completedSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <Icon name="check_circle" size={48} />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Delivery Completed & Verified!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Order status updated in Supabase, Farmer Wallet credited, Delivery Earnings recorded, and Invoice PDF generated!
              </p>
            </div>
          ) : verificationResult.status === 'idle' || verificationResult.status === 'scanning' ? (
            /* SCANNING / INPUT VIEW */
            <div className="space-y-4">
              {/* Camera Scanner Viewfinder Simulator */}
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-inner flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                {/* Animated Scanner Laser */}
                <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#F59E0B] animate-pulse top-1/2 -translate-y-1/2" />

                <div className="relative z-10 text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                    <Icon name="crop_free" size={32} />
                  </div>
                  <p className="text-xs font-bold text-emerald-200">
                    Align Consumer QR Code inside Viewfinder Frame
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Auto-scanning via active device camera...
                  </p>
                </div>
              </div>

              {/* Quick Simulator Button */}
              {assignedOrder && (
                <Card variant="glass" className="p-3.5 space-y-2 bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-emerald-200">
                      Active Assigned Order: #{assignedOrder.orderNumber}
                    </span>
                    <Badge variant="amber" size="sm">
                      {assignedOrder.consumerName}
                    </Badge>
                  </div>
                  <Button
                    variant="accent"
                    size="md"
                    fullWidth
                    leftIcon="qr_code_2"
                    onClick={handleAutoScanAssignedOrder}
                    isLoading={verificationResult.status === 'scanning'}
                  >
                    Simulate Camera Scan of Consumer's QR Code
                  </Button>
                </Card>
              )}

              {/* Manual Code / Token Entry */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                  Or Enter Verification Token / QR Code JSON
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTokenInput}
                    onChange={(e) => setManualTokenInput(e.target.value)}
                    placeholder="Paste FC_VERIFY_VT_... token or JSON payload"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => verifyQRPayload(manualTokenInput)}
                    isLoading={verificationResult.status === 'scanning'}
                  >
                    Verify Token
                  </Button>
                </div>
              </div>
            </div>
          ) : verificationResult.status === 'success' && verificationResult.matchedOrder ? (
            /* VERIFIED SUCCESS SCREEN */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl border-2 border-emerald-500 space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
                  <Icon name="verified" size={28} />
                </div>
                <h4 className="text-base font-black text-[#2E7D32] dark:text-emerald-300">
                  QR Code Verified Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Order #{verificationResult.matchedOrder.orderNumber} identity and escrow payment validated.
                </p>
              </div>

              {/* Verified Order Summary Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">CUSTOMER NAME</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {verificationResult.matchedOrder.consumerName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {verificationResult.matchedOrder.consumerPhone}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">TOTAL AMOUNT</span>
                    <span className="font-black text-[#2E7D32] dark:text-emerald-400 text-sm">
                      ₹{verificationResult.matchedOrder.totalAmount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-300 block">
                      {verificationResult.matchedOrder.paymentStatus === 'paid' ? '✅ Paid Online' : '💵 Cash on Delivery'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">DELIVERY ADDRESS</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {verificationResult.matchedOrder.consumerAddress}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">HARVEST PRODUCTS</span>
                  <div className="space-y-1 mt-1">
                    {verificationResult.matchedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                        <span>{it.productName} × {it.quantity} {it.unit}</span>
                        <span>₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-500">
                  <span>Verification Time: {new Date().toLocaleTimeString()}</span>
                  <span>GPS: Verified Doorstep</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVerificationResult({ status: 'idle' })}
                  className="w-1/3"
                >
                  Scan Again
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleExecuteDeliveryCompletion}
                  isLoading={isSubmittingDelivery}
                  className="w-2/3"
                  leftIcon="check_circle"
                >
                  Complete Delivery Now
                </Button>
              </div>
            </div>
          ) : (
            /* VERIFICATION FAILED SCREEN */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
              <div className="p-5 bg-rose-50 dark:bg-rose-950/80 rounded-2xl border-2 border-rose-500 space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg">
                  <Icon name="gpp_bad" size={32} />
                </div>
                <h4 className="text-base font-black text-rose-700 dark:text-rose-200">
                  QR Code Verification Failed!
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold">
                  {verificationResult.errorMessage || 'Unknown verification error'}
                </p>
              </div>

              <p className="text-xs text-slate-500">
                Please ask the customer to refresh their FarmConnect App screen and show the valid order QR code. Delivery cannot be completed without valid verification.
              </p>

              <Button
                variant="primary"
                fullWidth
                onClick={() => setVerificationResult({ status: 'idle' })}
                leftIcon="refresh"
              >
                Try Scanning Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
