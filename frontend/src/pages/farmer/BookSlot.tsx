import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Package, Check, ArrowRight, Ticket, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, CongestionBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getCentres } from '@/services/centreService';
import { bookSlot } from '@/services/slotService';
import { useApp } from '@/context/AppContext';
import type { ProcurementCentre } from '@/types';

const dates = ['Today', 'Tomorrow', '7 Sep', '8 Sep'];
const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '4:30 PM'];

export default function BookSlot() {
  const { farmer, showToast } = useApp();
  const navigate = useNavigate();
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [quantity, setQuantity] = useState(farmer?.expectedQuantity || 85);
  const [booking, setBooking] = useState(false);
  const [token, setToken] = useState<{ number: number; centreName: string; date: string; time: string; estimatedWait: number } | null>(null);

  useEffect(() => {
    (async () => {
      const cs = await getCentres();
      setCentres(cs);
      setLoading(false);
    })();
  }, []);

  const handleBook = async () => {
    if (!selectedCentre || !selectedDate || !selectedTime) return;
    setBooking(true);
    const t = await bookSlot({
      centreId: selectedCentre.id,
      centreName: selectedCentre.name,
      date: selectedDate,
      time: selectedTime,
      crop: farmer?.crop || 'Wheat',
      quantity,
    });
    setToken({
      number: t.number,
      centreName: t.centreName,
      date: t.date,
      time: t.time,
      estimatedWait: t.estimatedWait,
    });
    setBooking(false);
    setStep(4);
    showToast('success', `Token #${t.number} generated successfully!`);
  };

  if (loading) {
    return <div className="skeleton rounded-2xl h-96" />;
  }

  // Success Screen
  if (token) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <Card className="overflow-hidden" elevated>
            <div className="gradient-forest p-8 text-white text-center relative overflow-hidden pattern-contour">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold">Token Generated!</h2>
              <p className="text-primary-100 mt-1">Your slot has been confirmed</p>
            </div>

            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/40 mb-4">
                <Ticket className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">Your Token Number</span>
              </div>
              <p className="text-7xl font-display font-extrabold text-primary-700 dark:text-primary-400 mb-6">#{token.number}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6 text-left">
                <div className="rounded-xl surface-subtle p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                    <span className="text-xs text-ink-500 dark:text-ink-400">Centre</span>
                  </div>
                  <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{token.centreName}</p>
                </div>
                <div className="rounded-xl surface-subtle p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                    <span className="text-xs text-ink-500 dark:text-ink-400">Date & Time</span>
                  </div>
                  <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{token.date} — {token.time}</p>
                </div>
                <div className="rounded-xl surface-subtle p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                    <span className="text-xs text-ink-500 dark:text-ink-400">Crop & Quantity</span>
                  </div>
                  <p className="font-bold text-ink-900 dark:text-ink-100 text-sm">{farmer?.crop || 'Wheat'} · {quantity} Qtl</p>
                </div>
                <div className="rounded-xl bg-primary-50 dark:bg-primary-950/40 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-xs text-primary-600 dark:text-primary-400">Estimated Wait</span>
                  </div>
                  <p className="font-bold text-primary-700 dark:text-primary-400">{token.estimatedWait} minutes</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 mb-6 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-bold text-teal-800 dark:text-teal-300">AI Prediction</p>
                  <p className="text-sm text-teal-700 dark:text-teal-400">Estimated wait time is {token.estimatedWait} minutes with 89% confidence. You don't need to stand in queue continuously — we'll notify you.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button className="flex-1" onClick={() => navigate('/live-queue')}>
                  Track Live Queue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const steps = ['Select Centre', 'Select Date', 'Select Time', 'Enter Quantity'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-white">Book Slot &amp; Get Token</h1>
        </div>
        <p className="text-ink-500 dark:text-ink-400">Select a centre, date, and time to generate your procurement token.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
              i <= step ? 'bg-primary-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400'}`}>{label}</span>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded ${i < step ? 'bg-primary-600' : 'bg-ink-200 dark:bg-ink-800'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            {centres.map((c) => (
              <Card key={c.id} hover onClick={() => { setSelectedCentre(c); setStep(1); }} className={selectedCentre?.id === c.id ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center font-bold text-primary-700 dark:text-primary-400">
                      {c.name.split(' ')[1]}
                    </div>
                    <div>
                      <p className="font-bold text-ink-900 dark:text-ink-100">{c.name}</p>
                      <p className="text-sm text-ink-500 dark:text-ink-400">{c.distance} km · {c.waitTime} min wait</p>
                    </div>
                  </div>
                  <CongestionBadge level={c.congestion} />
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="p-6">
                <h3 className="font-bold text-ink-900 dark:text-ink-100 mb-4">Select Date</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setStep(2); }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedDate === d ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'border-ink-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-700 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mx-auto mb-2" />
                      <p className="font-semibold">{d}</p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  <h3 className="font-bold text-ink-900 dark:text-ink-100">Select Time</h3>
                  <Badge variant="ai" size="sm">AI suggests 4:00 PM for shortest wait</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((t) => {
                    const isRecommended = t === '4:00 PM';
                    return (
                      <button
                        key={t}
                        onClick={() => { setSelectedTime(t); setStep(3); }}
                        className={`p-3 rounded-xl border-2 transition-all text-center relative ${
                          selectedTime === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'border-ink-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-700 text-ink-700 dark:text-ink-300'
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <p className="font-semibold text-sm">{t}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <div className="p-6">
                <h3 className="font-bold text-ink-900 dark:text-ink-100 mb-4">Confirm Details</h3>
                <div className="space-y-4">
                  <div className="rounded-xl surface-subtle p-4 space-y-2">
                    <Row label="Centre" value={selectedCentre?.name || ''} />
                    <Row label="Date" value={selectedDate} />
                    <Row label="Time" value={selectedTime} />
                    <Row label="Crop" value={farmer?.crop || 'Wheat'} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">Crop Quantity (Quintals)</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 5))}
                        className="w-10 h-10 rounded-xl border-2 border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 font-bold hover:border-primary-300 dark:hover:border-primary-700"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none font-bold text-lg text-ink-900 dark:text-ink-100"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 5)}
                        className="w-10 h-10 rounded-xl border-2 border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 font-bold hover:border-primary-300 dark:hover:border-primary-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={handleBook} loading={booking} className="flex-1">
                      {booking ? 'Generating Token...' : 'Confirm & Generate Token'} <Ticket className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && step < 4 && (
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className="text-sm font-semibold text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span className="font-semibold text-ink-900 dark:text-ink-100">{value}</span>
    </div>
  );
}
