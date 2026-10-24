/**
 * Payments, Wallet & Escrow Module
 * Zero-commission UPI payments, direct escrow vaults, wallet balances, and PDF invoices.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const PaymentsScreen: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(14250.0);
  const [escrowLocked, setEscrowLocked] = useState(3800.0);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('1000');
  const [showInvoiceModal, setShowInvoiceModal] = useState<any>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-90182',
      orderId: 'FC-ORD-98214',
      description: 'Tomato Produce Batch Sale (500 kg)',
      amount: 19000.0,
      type: 'credit',
      status: 'Escrow Locked',
      date: 'July 24, 2026',
      buyer: 'Vijayawada Wholesale Supermarket'
    },
    {
      id: 'TXN-88102',
      orderId: 'FC-ORD-88120',
      description: 'Mahindra Tractor Rental Fee',
      amount: -1600.0,
      type: 'debit',
      status: 'Settled (UPI)',
      date: 'July 21, 2026',
      buyer: 'Srinivas Machinery Rentals'
    },
    {
      id: 'TXN-77123',
      orderId: 'FC-ORD-77112',
      description: 'YSR Rythu Bharosa DBT Credit',
      amount: 7500.0,
      type: 'credit',
      status: 'Bank Direct Transfer',
      date: 'July 15, 2026',
      buyer: 'Government of Andhra Pradesh'
    }
  ]);

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(addAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setWalletBalance(prev => prev + parsed);
    setShowAddMoneyModal(false);
    setPaymentSuccessToast(true);
    setTimeout(() => setPaymentSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-emerald-100 flex items-center gap-2">
            <Icon name="account_balance_wallet" size={28} className="text-emerald-600 dark:text-emerald-400" />
            Agri Wallet & Escrow Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-emerald-400 mt-0.5">
            Zero-commission direct UPI transfers, buyer protection escrow, and PDF invoices
          </p>
        </div>

        <Badge variant="emerald" size="lg">
          <Icon name="verified_user" size={16} className="mr-1" />
          100% Escrow Protected
        </Badge>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Main Wallet */}
        <Card className="p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white border-emerald-700 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <Icon name="account_balance_wallet" size={24} className="text-emerald-300" />
            </div>
            <h2 className="text-3xl font-black text-white mt-2">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[11px] text-emerald-200/80 mt-1">Ready for instant bank withdrawal</p>
          </div>

          <div className="pt-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddMoneyModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              <Icon name="add" size={16} />
              Add Money
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/40 hover:bg-white/10"
              onClick={() => {
                alert('Withdrawal of ₹' + walletBalance + ' initiated to SBI Account ****4892');
              }}
            >
              <Icon name="arrow_downward" size={16} />
              Instant Withdraw
            </Button>
          </div>
        </Card>

        {/* Escrow Vault */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white border-emerald-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                Escrow Locked Vault
              </span>
              <Icon name="lock" size={24} className="text-amber-400" />
            </div>
            <h2 className="text-3xl font-black text-amber-400 mt-2">
              ₹{escrowLocked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[11px] text-slate-300 mt-1">
              Funds automatically release upon delivery verification
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2">
            <Badge variant="gold">Auto-Release Active</Badge>
          </div>
        </Card>
      </div>

      {/* Payment Success Toast */}
      <AnimatePresence>
        {paymentSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-center text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <Icon name="check_circle" size={20} />
            Wallet reloaded successfully via PhonePe UPI!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section: Select Payment Method */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
          <Icon name="credit_card" size={20} className="text-emerald-600 dark:text-emerald-400" />
          Supported Direct Payment Channels
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'UPI', label: 'Direct UPI', desc: 'PhonePe / GPay / BHIM', icon: 'qr_code_2' },
            { id: 'Card', label: 'Debit / Credit Card', desc: 'Visa, MasterCard, RuPay', icon: 'credit_card' },
            { id: 'NetBanking', label: 'Net Banking', desc: '50+ Indian Banks', icon: 'account_balance' },
            { id: 'COD', label: 'Cash on Delivery', desc: 'Pay on Farm Pickup', icon: 'payments' }
          ].map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMethod(m.id as any)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedMethod === m.id
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/50 ring-2 ring-emerald-500/30'
                  : 'border-emerald-200/60 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name={m.icon} size={22} className="text-emerald-600 dark:text-emerald-400" />
                {selectedMethod === m.id && <Icon name="check_circle" size={18} className="text-emerald-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-emerald-100">{m.label}</p>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section: Recent Transaction Ledger */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100">
            Transaction & Settlement History
          </h3>
          <span className="text-xs text-slate-500 dark:text-emerald-400">Showing last 3 transactions</span>
        </div>

        <div className="divide-y divide-emerald-100 dark:divide-emerald-800/40">
          {transactions.map(txn => (
            <div key={txn.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl mt-0.5 ${
                  txn.type === 'credit'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  <Icon name={txn.type === 'credit' ? 'arrow_downward' : 'arrow_upward'} size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-emerald-100">{txn.description}</h4>
                    <Badge variant={txn.status.includes('Escrow') ? 'gold' : 'emerald'} size="sm">
                      {txn.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-emerald-400 mt-0.5">
                    Order: <span className="font-mono">{txn.orderId}</span> • {txn.date} • {txn.buyer}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className={`text-base font-black ${
                  txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-emerald-100'
                }`}>
                  {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInvoiceModal(txn)}
                  className="text-xs"
                >
                  <Icon name="receipt" size={16} />
                  Receipt
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100">
                  Add Funds to Agri Wallet
                </h3>
                <button onClick={() => setShowAddMoneyModal(false)} className="text-slate-400">
                  <Icon name="close" size={24} />
                </button>
              </div>

              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                    Enter Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-slate-900 dark:text-emerald-100 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['500', '1000', '5000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAddAmount(val)}
                      className="py-2 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>

                <Button type="submit" variant="primary" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700">
                  Proceed to UPI Payment
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-50 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Icon name="description" size={24} className="text-emerald-600" />
                  <h3 className="text-base font-black">Official Tax Invoice #{showInvoiceModal.id}</h3>
                </div>
                <button onClick={() => setShowInvoiceModal(null)} className="text-slate-400">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p><span className="font-semibold text-slate-500">Order ID:</span> {showInvoiceModal.orderId}</p>
                <p><span className="font-semibold text-slate-500">Item:</span> {showInvoiceModal.description}</p>
                <p><span className="font-semibold text-slate-500">Entity:</span> {showInvoiceModal.buyer}</p>
                <p><span className="font-semibold text-slate-500">Date:</span> {showInvoiceModal.date}</p>
                <p><span className="font-semibold text-slate-500">Settlement:</span> {showInvoiceModal.status}</p>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-between mt-4">
                  <span>Total Paid Amount:</span>
                  <span>₹{Math.abs(showInvoiceModal.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowInvoiceModal(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    alert('Simulated downloading invoice PDF for ' + showInvoiceModal.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Icon name="download" size={16} />
                  Download PDF Receipt
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
