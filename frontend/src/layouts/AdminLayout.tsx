import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  TrendingUp,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/centres', label: 'Centre Monitoring', icon: Building2 },
  { to: '/admin/bottlenecks', label: 'Bottleneck Detection', icon: AlertTriangle },
  { to: '/admin/forecast', label: 'Congestion Forecast', icon: TrendingUp },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-ink-900 border-r border-ink-100 dark:border-ink-800">
      <div className="px-5 py-5 border-b border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-ink-700 dark:to-ink-950 flex items-center justify-center border border-primary-200 dark:border-ink-700">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="leading-none">
            <span className="font-display font-extrabold text-xl text-ink-900 dark:text-white tracking-tight">
              Fasal<span className="text-primary-600 dark:text-primary-400">Go</span>
            </span>
            <p className="text-xs text-ink-500 dark:text-ink-500 font-medium mt-0.5">Command Center</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <p className="px-4 text-[10px] font-bold text-ink-400 dark:text-ink-600 uppercase tracking-wider mb-2">Operations</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800/50 dark:hover:text-ink-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-600 dark:bg-primary-500"
                    />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-ink-800 border border-primary-200 dark:border-ink-700 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">Admin Operator</p>
            <p className="text-xs text-ink-500 dark:text-ink-500 truncate">Jaipur Region</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white transition-all w-full"
        >
          <LogOut className="w-5 h-5" /> Back to Farmer View
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-ink-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNav(false)}
              className="fixed inset-0 bg-ink-950/50 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl border-b border-ink-100 dark:border-ink-800 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-ink-700 dark:text-ink-300" />
            </button>
            <div>
              <p className="text-xs text-ink-500 dark:text-ink-500">Procurement Intelligence</p>
              <p className="font-display font-bold text-ink-900 dark:text-white">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20">
              <span className="w-2 h-2 rounded-full bg-success-500 dark:bg-success-400 animate-pulse" />
              <span className="text-sm font-medium text-success-700 dark:text-success-300">Live</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <VoiceAssistant />
      <ToastContainer />
    </div>
  );
}
