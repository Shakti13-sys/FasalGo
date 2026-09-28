import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain,
  Route,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
  MapPin,
  Sprout,
  Sparkles,
  Mic,
  ShieldCheck,
  Zap,
  Ticket,
  ListOrdered,
  Truck,
  Wallet,
  CheckCircle2,
  Scale,
  FlaskConical,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const journeySteps = [
  { icon: Sprout, label: 'Farm Dispatch', sub: 'Harvest ready', color: 'from-primary-400 to-primary-600' },
  { icon: MapPin, label: 'Smart Mandi', sub: 'Jaipur APMC Recommended', color: 'from-teal-400 to-teal-600' },
  { icon: Ticket, label: 'Digital Slot', sub: 'Token #47 Allocated', color: 'from-secondary-400 to-secondary-600' },
  { icon: ListOrdered, label: 'Live Queue', sub: 'ETA 18 min · 4 Ahead', color: 'from-accent-400 to-accent-600' },
  { icon: Scale, label: 'Weighbridge & Assay', sub: 'Grade A · 11.2% Moisture', color: 'from-primary-500 to-teal-500' },
  { icon: Wallet, label: 'DBT Payment', sub: '₹1,93,375 (Govt MSP)', color: 'from-success-400 to-success-600' },
];

export default function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl border-b border-white/60 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" showText />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-semibold text-ink-700 dark:text-ink-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 lg:pt-16 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-900 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                AI-Powered Smart Mandi Intelligence · SIH26032
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-ink-900 dark:text-white leading-[1.1] tracking-tight text-balance">
              Smart Mandi Queue. <br />
              Zero Waiting. <span className="gradient-text">Predictive Procurement.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 dark:text-ink-400 leading-relaxed max-w-xl">
              FasalGo empowers farmers across APMC procurement centres with AI waiting time prediction,
              smart centre recommendations, live digital token queues, and instant DBT payment tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 group"
              >
                Book Mandi Slot
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 font-semibold px-8 py-4 rounded-xl border-2 border-ink-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
              >
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Live Demo Portal
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {['R', 'S', 'A', 'M'].map((c, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-ink-950 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: ['#1f8049', '#f59e0b', '#0d9488', '#dc2626'][i] }}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">Integrated with Rajasthan APMC Network</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">Jaipur, Chomu, Dausa, Kishangarh & Bagru Mandis</p>
              </div>
            </div>
          </motion.div>

          {/* Real Photo Showcase Card with Live Journey Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-ink-100 dark:border-ink-800 group">
              <img
                src="/images/farmer_hero_mandi.jpg"
                alt="Empowered Farmer at APMC Mandi"
                className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Floating Real-time Live Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/90 text-white border border-emerald-500/50 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold">LIVE MANDI WEBSOCKET ACTIVE</span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 dark:bg-ink-950/90 backdrop-blur-md border border-white/40 dark:border-ink-800 text-ink-900 dark:text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 font-bold uppercase">Active Procurement</p>
                    <p className="font-display font-bold text-sm lg:text-base">Jaipur APMC (Muhana Mandi Yard)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">RMS 2024–25 MSP</p>
                    <p className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">₹2,275/Qtl</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ink-200/60 dark:border-ink-800 text-center">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                    <p className="text-[10px] text-ink-500 dark:text-ink-400">Token</p>
                    <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">#47</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40">
                    <p className="text-[10px] text-ink-500 dark:text-ink-400">Wait ETA</p>
                    <p className="font-bold text-sm text-teal-700 dark:text-teal-400">18 min</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40">
                    <p className="text-[10px] text-ink-500 dark:text-ink-400">Moisture</p>
                    <p className="font-bold text-sm text-amber-700 dark:text-amber-400">11.2% (Grade A)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real Mandi Infrastructure Showcase Gallery */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-900 dark:text-white">
            Ground-Truth Mandi Operations
          </h2>
          <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-2xl mx-auto">
            From gate weighbridge check-in to digital moisture analysis — precision engineering for Indian agriculture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Electronic Weighbridge */}
          <div className="rounded-3xl overflow-hidden card-surface border border-ink-100 dark:border-ink-800 shadow-xl group">
            <div className="relative h-64 overflow-hidden">
              <img
                src="/images/mandi_weighbridge_yard.jpg"
                alt="Electronic Weighbridge Terminal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-xs font-bold">Counter Throughput</span>
                <h3 className="text-xl font-bold font-display mt-1">Digital Weighbridge Integration</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                Live counter tracking monitors electronic weighbridge transit speeds in real time, detecting anomalies and bottlenecks before queues form.
              </p>
            </div>
          </div>

          {/* Card 2: Quality & Assay Lab */}
          <div className="rounded-3xl overflow-hidden card-surface border border-ink-100 dark:border-ink-800 shadow-xl group">
            <div className="relative h-64 overflow-hidden">
              <img
                src="/images/mandi_quality_lab.jpg"
                alt="Moisture Testing Quality Lab"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="px-2.5 py-1 rounded-md bg-teal-600 text-xs font-bold">Quality Assay</span>
                <h3 className="text-xl font-bold font-display mt-1">Digital Moisture & Grading</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                Automated certification of moisture content (&lt;12% optimal for Wheat & Mustard) ensures fair MSP valuation and instant DBT payment clearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Predict → Optimize → Notify → Track */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-900 dark:text-white">
            Predict. Optimize. Notify. Track.
          </h2>
          <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-2xl mx-auto">
            We don't just manage the queue — we predict, optimize and minimize the farmer's waiting time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: 'Predict', desc: 'AI predicts waiting time with confidence scores.', color: 'from-teal-400 to-teal-600' },
            { icon: Route, title: 'Optimize', desc: 'AI recommends the best centre and time to visit.', color: 'from-primary-400 to-primary-600' },
            { icon: Bell, title: 'Notify', desc: 'Farmer gets real-time turn and queue alerts.', color: 'from-secondary-400 to-secondary-600' },
            { icon: TrendingUp, title: 'Track', desc: 'Farmer tracks procurement and payment status.', color: 'from-success-400 to-success-600' },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface p-6 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-ink-900 dark:text-ink-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 p-12 text-center relative overflow-hidden shadow-2xl">
          <img
            src="/images/mandi_weighbridge_yard.jpg"
            alt="Mandi Background"
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              Ready to experience smart procurement?
            </h2>
            <p className="text-emerald-100 max-w-xl mx-auto mb-8 text-base">
              Join thousands of farmers cutting waiting times and managing APMC procurement with FasalGo AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-emerald-800/80 text-white font-semibold px-8 py-4 rounded-xl border border-emerald-600/50 hover:bg-emerald-800 transition-all"
              >
                Admin Command Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
