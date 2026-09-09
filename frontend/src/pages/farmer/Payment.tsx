import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle2, Clock, Receipt, ArrowDownToLine, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui';
import { getPaymentInfo } from '@/services/paymentService';
import { useApp } from '@/context/AppContext';
import type { PaymentInfo } from '@/types';

export default function Payment() {
  const { showToast } = useApp();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getPaymentInfo();
      setPayment(p);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-6 h-6 text-success-600 dark:text-success-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Payment</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Track your procurement payment status and transaction details.</p>
      </div>

      {/* Payment Hero Card */}
      <Card className="overflow-hidden shadow-lg border-0" elevated>
        <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 p-8 text-white overflow-hidden pattern-contour">
          {/* Subtle glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Payment Amount
                </p>
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-white mt-1">
                  ₹<AnimatedCounter value={payment?.amount || 0} />
                </p>
              </div>
              <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-100 border border-emerald-600/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Payment Completed
                </span>
                <p className="text-emerald-200/90 text-sm font-medium">{payment?.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-100/90 pt-4 border-t border-emerald-800/60">
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">Transferred directly to your linked bank account</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-ink-500 dark:text-ink-400" />
              <h3 className="font-bold text-ink-900 dark:text-ink-100">Transaction Details</h3>
            </div>
            <div className="space-y-3">
              <Row label="Transaction Reference" value={payment?.transactionRef || ''} mono />
              <Row label="Procurement ID" value={payment?.procurementId || ''} mono />
              <Row label="Payment Date" value={payment?.date || ''} />
              <Row label="Payment Status" value="Completed" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-ink-500 dark:text-ink-400" />
              <h3 className="font-bold text-ink-900 dark:text-ink-100">Procurement Summary</h3>
            </div>
            <div className="space-y-3">
              <Row label="Crop" value={payment?.crop || ''} />
              <Row label="Quantity" value={`${payment?.quantity} Qtl`} />
              <Row label="Rate per Qtl" value="₹500" />
              <Row label="Total Amount" value={`₹${payment?.amount.toLocaleString('en-IN')}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold text-ink-900 dark:text-ink-100 mb-4">Payment Timeline</h3>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, title: 'Procurement Completed', desc: 'Crop accepted and procured at Centre A', time: '3:45 PM', color: 'bg-primary-500' },
              { icon: Clock, title: 'Payment Initiated', desc: 'Payment request sent to treasury', time: '3:50 PM', color: 'bg-teal-500' },
              { icon: CheckCircle2, title: 'Payment Processed', desc: 'Amount transferred via DBT to bank account', time: '4:05 PM', color: 'bg-success-500' },
              { icon: CheckCircle2, title: 'Payment Confirmed', desc: 'SMS sent to registered mobile number', time: '4:06 PM', color: 'bg-success-600' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900 dark:text-ink-100">{step.title}</p>
                    <p className="text-sm text-ink-500 dark:text-ink-400">{step.desc}</p>
                  </div>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{step.time}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => showToast('info', 'Receipt download would be available in production.')}>
          <ArrowDownToLine className="w-4 h-4" /> Download Receipt
        </Button>
        <Button variant="ghost" onClick={() => showToast('success', 'SMS confirmation sent to your registered mobile.')}>
          Resend SMS Confirmation
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500 dark:text-ink-400">{label}</span>
      <span className={`text-sm font-bold text-ink-900 dark:text-ink-100 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
