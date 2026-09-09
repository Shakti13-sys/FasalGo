import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  ListOrdered,
  Flame,
  Truck,
  Wallet,
  Bell,
  Sparkles,
  LogOut,
  Menu,
  Sprout,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/visit-planner', label: 'AI Visit Planner', icon: Sparkles },
  { to: '/find-centre', label: 'Find Centre', icon: MapPin },
  { to: '/book-slot', label: 'Book Slot', icon: Calendar },
  { to: '/live-queue', label: 'Live Queue', icon: ListOrdered },
  { to: '/heatmap', label: 'Congestion Heatmap', icon: Flame },
  { to: '/procurement', label: 'Procurement', icon: Truck },
  { to: '/payment', label: 'Payment', icon: Wallet },
];

export function FarmerLayout({ children }: { children: ReactNode }) {
  const { farmer, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-ink-900">
      <div className="px-5 py-5 border-b border-ink-100 dark:border-ink-800">
        <Logo size="md" showText />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800/60 dark:hover:text-ink-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="farmer-nav-active"
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {farmer?.name?.charAt(0) || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{farmer?.name || 'Rajesh Kumar'}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{farmer?.mobile || '98765 43210'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950/40 transition-all w-full"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-ink-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-ink-100 dark:border-ink-800 fixed inset-y-0 left-0 z-30">
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
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm z-40 lg:hidden"
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
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl border-b border-ink-100 dark:border-ink-800 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-ink-700 dark:text-ink-300" />
            </button>
            <div>
              <p className="text-xs text-ink-500 dark:text-ink-400">{getCurrentGreeting()}</p>
              <p className="font-display font-bold text-ink-900 dark:text-ink-100">
                {farmer?.name?.split(' ')[0] || 'Rajesh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/notifications"
              className="relative p-2.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-ink-600 dark:text-ink-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <ThemeToggle />
            <NavLink
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800 dark:bg-ink-800 dark:hover:bg-ink-700 dark:text-ink-100 transition-colors"
            >
              <Sprout className="w-4 h-4" />
              Admin
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
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

function getCurrentGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
