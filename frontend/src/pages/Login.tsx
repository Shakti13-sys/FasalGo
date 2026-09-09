import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Lock, ChevronRight } from 'lucide-react';
import { login as loginService } from '@/services/authService';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const farmer = await loginService({ mobile, password });
    login(farmer);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="hidden lg:block relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-900 text-white pattern-contour overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 relative z-10">
          <div className="flex items-center justify-between">
            <Logo size="md" showText lightOnDark />
            <ThemeToggle />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold text-white leading-tight">
              Welcome back, <br />
              <span className="text-emerald-400">Farmer.</span>
            </h2>
            <p className="mt-4 text-emerald-100 max-w-md text-base leading-relaxed">
              Track your token, get AI-powered recommendations, and never wait in long queues again.
            </p>
            <div className="mt-8 space-y-3">
              {['Real-time queue tracking', 'AI centre recommendations', 'Live payment updates'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-emerald-100/90 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-emerald-300" />
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <p className="text-emerald-200/60 text-sm">SIH26032 — Smart Procurement Platform</p>
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
          <p className="text-ink-500 dark:text-ink-400 mb-8">Enter your details to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
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
              className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
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

          <div className="mt-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900">
            <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
              Demo: Enter any mobile number and password to login.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
