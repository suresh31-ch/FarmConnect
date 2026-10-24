/**
 * FarmConnect Rating & Review Modal
 * Step 14: Ratings
 * Consumer rates Farmer, Delivery Partner, Product.
 * Farmer rates Delivery Partner.
 */

import React, { useState } from 'react';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export interface OrderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  userRole: 'consumer' | 'farmer';
  farmerName: string;
  driverName?: string;
  productName: string;
  onSubmitRating: (ratings: {
    farmerRating?: number;
    deliveryRating?: number;
    productRating?: number;
    farmerDeliveryRating?: number;
    feedback?: string;
  }) => void;
}

export const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  userRole,
  farmerName,
  driverName = 'Delivery Partner',
  productName,
  onSubmitRating,
}) => {
  const [farmerStars, setFarmerStars] = useState(5);
  const [driverStars, setDriverStars] = useState(5);
  const [productStars, setProductStars] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmitRating({
      farmerRating: farmerStars,
      deliveryRating: driverStars,
      productRating: productStars,
      farmerDeliveryRating: driverStars,
      feedback,
    });
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="text-amber-400 hover:scale-110 transition-transform"
        >
          <Icon name={star <= rating ? 'star' : 'star_border'} size={24} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-emerald-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="star" size={22} className="text-amber-500" />
              Rate Order #{orderNumber}
            </h3>
            <p className="text-xs text-slate-500">Your feedback improves direct farm logistics quality</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="close" size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto shadow-md">
              <Icon name="check_circle" size={32} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Rating Submitted!
            </h4>
            <p className="text-xs text-slate-500">
              Thank you for supporting verified local farmers and delivery partners.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {userRole === 'consumer' ? (
              <>
                {/* Rate Farmer */}
                <Card variant="glass" className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">
                      Farmer Quality ({farmerName})
                    </span>
                    {renderStars(farmerStars, setFarmerStars)}
                  </div>
                  <p className="text-[11px] text-slate-500">Freshness & farm quality</p>
                </Card>

                {/* Rate Produce / Crop */}
                <Card variant="glass" className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">
                      Product Quality ({productName})
                    </span>
                    {renderStars(productStars, setProductStars)}
                  </div>
                  <p className="text-[11px] text-slate-500">Packaging, size & organic standard</p>
                </Card>

                {/* Rate Delivery Driver */}
                <Card variant="glass" className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">
                      Delivery Partner ({driverName})
                    </span>
                    {renderStars(driverStars, setDriverStars)}
                  </div>
                  <p className="text-[11px] text-slate-500">On-time delivery & behavior</p>
                </Card>
              </>
            ) : (
              /* Farmer rating Delivery Partner */
              <Card variant="glass" className="p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">
                    Delivery Partner ({driverName})
                  </span>
                  {renderStars(driverStars, setDriverStars)}
                </div>
                <p className="text-[11px] text-slate-500">Punctuality during farm-gate pickup</p>
              </Card>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                Optional Feedback / Review
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <Button type="submit" variant="accent" size="lg" fullWidth leftIcon="rate_review">
              Submit Rating & Review
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
