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
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const journeySteps = [
  { icon: Sprout, label: 'Farm', sub: 'Start', color: 'from-primary-400 to-primary-600' },
  { icon: MapPin, label: 'Smart Centre', sub: 'Recommended', color: 'from-teal-400 to-teal-600' },
  { icon: Ticket, label: 'Slot', sub: 'Booked', color: 'from-secondary-400 to-secondary-600' },
  { icon: ListOrdered, label: 'Live Queue', sub: 'Token #47', color: 'from-accent-400 to-accent-600' },
  { icon: Truck, label: 'Procurement', sub: 'Tracking', color: 'from-primary-500 to-teal-500' },
  { icon: Wallet, label: 'Payment', sub: 'Done', color: 'from-success-400 to-success-600' },
];

export default function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl border-b border-white/60 dark:border-ink-800">
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
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-900 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">AI-Powered Procurement Intelligence</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-extrabold text-ink-900 dark:text-white leading-[1.1] tracking-tight text-balance">
              Smart Procurement. <br />
              Less Waiting. <span className="gradient-text">Better Planning.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-600 dark:text-ink-400 leading-relaxed max-w-xl">
              AI-powered procurement intelligence that helps farmers choose the right centre,
              predict their turn and track their procurement and payment — all in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 group"
              >
                Plan My Visit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 font-semibold px-8 py-4 rounded-xl border-2 border-ink-200 dark:border-ink-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
              >
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                See How It Works
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
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">Trusted by 12,000+ farmers</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">across 45 procurement centres</p>
              </div>
            </div>
          </motion.div>

          {/* Interactive Procurement Journey Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative card-elevated p-8 overflow-hidden pattern-field">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/8 dark:bg-primary-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/8 dark:bg-teal-500/10 rounded-full blur-3xl" />

              <div className="relative">
                {/* Journey Title */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider">The FasalGo Journey</p>
                    <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mt-0.5">From farm to payment — one connected flow</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">LIVE</span>
                  </div>
                </div>

                {/* Journey Steps with connecting line */}
                <div className="relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-300 via-teal-300 to-success-300 dark:from-primary-800 dark:via-teal-800 dark:to-success-800" />

                  {journeySteps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.12 }}
                        className="relative flex items-center gap-4 mb-4 last:mb-0"
                      >
                        {/* Step circle */}
                        <div className="relative z-10">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        {/* Step info */}
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm">{step.label}</p>
                            <p className="text-xs text-ink-500 dark:text-ink-400">{step.sub}</p>
                          </div>
                          {i === 3 && (
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-xs font-bold text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/40 px-2 py-1 rounded-full border border-accent-200 dark:border-accent-900"
                            >
                              31 min ETA
                            </motion.div>
                          )}
                          {i === 5 && (
                            <div className="text-xs font-bold text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-950/40 px-2 py-1 rounded-full border border-success-200 dark:border-success-900">
                              ₹42,500
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* AI confidence indicator */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-white dark:bg-ink-800 rounded-xl shadow-lg p-3 border border-ink-100 dark:border-ink-700 hidden sm:block"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-900 dark:text-ink-100">AI Prediction</p>
                      <p className="text-[9px] text-ink-500 dark:text-ink-400">89% confidence</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
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

      {/* Key Features */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: 'AI Wait-Time Prediction', desc: 'Get accurate waiting time estimates with confidence scores, updated in real time as queue conditions change.' },
            { icon: MapPin, title: 'Smart Centre Recommendation', desc: 'Not just the nearest centre — AI considers distance, queue, counters, capacity, and congestion to find your best option.' },
            { icon: Route, title: 'Dynamic Re-routing', desc: 'If congestion spikes, the app automatically suggests a better alternative centre with lower wait time.' },
            { icon: Mic, title: 'Voice-First Assistant', desc: 'Ask in your language — Hindi or English. Get answers about your token, centre, procurement, and payment.' },
            { icon: TrendingUp, title: 'Congestion Forecast', desc: 'See predicted crowd levels for the next 5 hours so you can plan the best time to visit.' },
            { icon: ShieldCheck, title: 'Full Procurement Tracking', desc: 'From booking to payment — track every stage of your procurement with live status updates.' },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-surface p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 p-12 text-center relative overflow-hidden pattern-contour shadow-2xl">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
          />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              Ready to experience smart procurement?
            </h2>
            <p className="text-emerald-100/90 mb-8 max-w-xl mx-auto text-base sm:text-lg">
              Join thousands of farmers who save time with AI-powered queue intelligence.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-lg group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 dark:border-ink-800 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showText />
          <p className="text-sm text-ink-500 dark:text-ink-400">SIH26032 — AI-Powered Smart Procurement & Queue Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
