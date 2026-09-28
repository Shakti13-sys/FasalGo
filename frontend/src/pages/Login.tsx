import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Lock, ChevronRight, ShieldCheck, UserCheck } from 'lucide-react';
import { login as loginService } from '@/services/authService';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login, showToast } = useApp();
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('farmer123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('warning', 'Please enter both mobile/email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginService({ identifier, password });
      login(result.farmer);
      showToast('success', `Welcome, ${result.farmer.name}!`);
      if (result.role === 'admin') {
        navigate('/admin/overview');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="hidden lg:block relative bg-emerald-950 text-white overflow-hidden">
        <img
          src="/images/farmer_hero_mandi.jpg"
          alt="Smart APMC Mandi Procurement"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-emerald-950/40" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 relative z-10">
          <div className="flex items-center justify-between">
            <Logo size="md" showText lightOnDark />
            <ThemeToggle />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold text-white leading-tight">
              Welcome to <br />
              <span className="text-emerald-400">FasalGo Intelligence.</span>
            </h2>
            <p className="mt-4 text-emerald-100 max-w-md text-base leading-relaxed">
              Track your procurement tokens in real-time, get AI-powered centre recommendations, and eliminate waiting delays.
            </p>
            <div className="mt-8 space-y-3">
              {['Live queue tracking with WebSockets', 'Explainable AI centre recommendations', 'Real-time DBT payment status'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-emerald-100/90 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-emerald-300" />
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <p className="text-emerald-200/60 text-sm">SIH26032 — Smart Procurement & Queue Intelligence</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ivory-50 dark:bg-ink-950 relative">
        <div className="absolute top-4 right-4 lg:hidden">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <Logo size="md" showText />
          </Link>

          <h1 className="text-3xl font-display font-bold text-ink-900 dark:text-white mb-2">Login</h1>
          <p className="text-ink-500 dark:text-ink-400 mb-6">Enter your registered mobile number or email</p>

          {/* Quick Demo Fill Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleQuickLogin('9876543210', 'farmer123')}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Farmer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fasalgo.gov.in', 'admin123')}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="9876543210 or admin@fasalgo.gov.in"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Login <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
