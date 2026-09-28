import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  Building2,
  Receipt,
  Download,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
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

  const isCompleted = payment?.status === 'completed';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Payment Status</h1>
          <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
            Govt MSP Scheme · RMS 2024–25 (₹2,275/Qtl)
          </Badge>
        </div>
        <p className="text-ink-500 dark:text-ink-400">
          Track your procurement DBT payment status and official PFMS bank transaction details.
        </p>
      </div>

      {/* Payment Hero Card */}
      <Card className="overflow-hidden shadow-lg border-0" elevated>
        <div className={`relative p-8 text-white overflow-hidden pattern-contour ${
          isCompleted 
            ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900' 
            : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950'
        }`}>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {isCompleted ? 'Payment Amount Disbursed' : 'Estimated MSP Payment Entitlement'}
                </p>
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-white mt-1">
                  ₹<AnimatedCounter value={payment?.amount || 0} />
                </p>
                {!isCompleted && (
                  <p className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Disbursed: ₹0.00 (Pending weighment and quality certification)
                  </p>
                )}
              </div>
              <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isCompleted 
                    ? 'bg-emerald-800/80 text-emerald-100 border border-emerald-600/50' 
                    : 'bg-amber-900/70 text-amber-200 border border-amber-600/40'
                }`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Payment Disbursed (Completed)
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-300" /> Payment In-Process (Pending Turn)
                    </>
                  )}
                </span>
                <p className="text-emerald-200/90 text-sm font-medium">{payment?.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-100/90 pt-4 border-t border-emerald-800/60">
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">
                {isCompleted 
                  ? 'Transferred directly to your linked bank account via PFMS DBT.' 
                  : 'Funds will be transferred directly to linked SBI Account via DBT within 24h of weighbridge certification.'}
              </span>
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
              <Row label="Transaction Reference" value={payment?.transactionRef || 'PFMS-HOLD-PENDING'} mono />
              <Row label="Procurement ID" value={payment?.procurementId || 'PRC-2026-0891'} mono />
              <Row label="Beneficiary Account" value={payment?.bankAccountHint || '•••• 4821 (SBI)'} />
              <Row label="Payment Status" value={isCompleted ? 'Completed (Disbursed)' : 'Pending Turn & Weighment'} />
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
              <Row label="Crop" value={payment?.crop || 'Wheat (Sharbati Grade A)'} />
              <Row label="Quantity" value={`${payment?.quantity || 85} Qtl`} />
              <Row label="Govt MSP Rate (RMS 24-25)" value={`₹${Math.round((payment?.amount || 193375) / (payment?.quantity || 85)).toLocaleString('en-IN')}/Qtl`} />
              <Row label="Total Value" value={`₹${payment?.amount.toLocaleString('en-IN')}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold text-ink-900 dark:text-ink-100 mb-4">Payment Lifecycle Timeline</h3>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle2,
                title: 'Slot & Token Booked',
                desc: 'Token #47 generated for Jaipur APMC (Muhana Mandi)',
                time: '9:30 AM',
                status: 'done',
              },
              {
                icon: CheckCircle2,
                title: 'Gate Entry Check-in',
                desc: 'Vehicle check-in recorded at Mandi Entry Gate #2',
                time: '10:15 AM',
                status: 'done',
              },
              {
                icon: isCompleted ? CheckCircle2 : Clock,
                title: 'Weighbridge Weighment & Moisture Assay',
                desc: isCompleted ? 'Gross weighment 85.0 Quintals & Grade A assay verified' : 'Awaiting turn in live queue at Counter #3',
                time: isCompleted ? '10:45 AM' : 'Pending Turn',
                status: isCompleted ? 'done' : 'current',
              },
              {
                icon: isCompleted ? CheckCircle2 : Clock,
                title: 'PFMS DBT Payment Disbursal',
                desc: isCompleted ? '₹1,93,375.00 credited to Bank A/C •••• 4821 via DBT' : 'Will initiate immediately upon batch acceptance',
                time: isCompleted ? '4:06 PM' : 'Pending Clearance',
                status: isCompleted ? 'done' : 'pending',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              const isDone = step.status === 'done';
              const isCurrent = step.status === 'current';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isDone 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                      ? 'bg-amber-500 text-white animate-pulse' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isDone ? 'text-ink-900 dark:text-ink-100' : isCurrent ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-ink-400 dark:text-ink-600'}`}>
                      {step.title}
                    </p>
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
        <Button variant="outline" onClick={() => showToast('info', 'Official MSP e-Receipt will be downloadable once procurement weighment is completed.')}>
          <Download className="w-4 h-4" /> Download Official Receipt
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span className={`font-semibold text-ink-900 dark:text-ink-100 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
