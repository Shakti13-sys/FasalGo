import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, User, Phone, Lock, MapPin, Package, Sparkles } from 'lucide-react';
import { register as registerService } from '@/services/authService';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

const states = ['Maharashtra', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'];
const districts: Record<string, string[]> = {
  Maharashtra: ['Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Ajmer'],
  Punjab: ['Ludhiana', 'Amritsar', 'Patiala', 'Bathinda'],
  Haryana: ['Hisar', 'Karnal', 'Rohtak', 'Gurugram'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Meerut', 'Varanasi'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  Gujarat: ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara'],
};
const crops = ['Wheat', 'Rice', 'Mustard', 'Soybean', 'Maize', 'Cotton', 'Bajra', 'Gram'];

export default function Register() {
  const navigate = useNavigate();
  const { login, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: 'Ramesh Patel',
    mobile: '9811223344',
    password: 'farmerpassword123',
    location: 'Chomu Mandi Area',
    state: 'Rajasthan',
    district: 'Jaipur',
    crop: 'Wheat',
    expectedQuantity: 85,
  });

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.password) {
      showToast('warning', 'Please fill in Name, Mobile Number, and Password.');
      return;
    }
    setLoading(true);
    try {
      const result = await registerService(form);
      login(result.farmer);
      showToast('success', `Account created successfully! Welcome, ${result.farmer.name}.`);
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Registration failed. Mobile may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillRandom = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setForm({
      name: `Kisan Sharma ${rand}`,
      mobile: `98${rand}${rand}`,
      password: 'password123',
      location: 'Dausa Village',
      state: 'Rajasthan',
      district: 'Jaipur',
      crop: 'Mustard',
      expectedQuantity: 120,
    });
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
              Join the <br />
              <span className="text-emerald-400">Smart Procurement</span> Platform.
            </h2>
            <p className="mt-4 text-emerald-100 max-w-md text-base leading-relaxed">
              Create your farmer account to receive AI-powered slot recommendations, transparent wait times, and instant queue alerts.
            </p>
          </div>
          <p className="text-emerald-200/60 text-sm">SIH26032 — Smart Procurement & Queue Intelligence</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ivory-50 dark:bg-ink-950 overflow-y-auto relative">
        <div className="absolute top-4 right-4 lg:hidden">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-6">
            <Logo size="md" showText />
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-display font-bold text-ink-900 dark:text-white">Create Account</h1>
            <button
              type="button"
              onClick={handleFillRandom}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill New
            </button>
          </div>
          <p className="text-ink-500 dark:text-ink-400 mb-6">Register to start your smart procurement journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} label="Full Name" placeholder="Rajesh Kumar" value={form.name} onChange={(v) => update('name', v)} />
            <Field icon={Phone} label="Mobile Number" placeholder="9876543210" value={form.mobile} onChange={(v) => update('mobile', v)} type="tel" />
            <Field icon={Lock} label="Password" placeholder="Create a password" value={form.password} onChange={(v) => update('password', v)} type="password" />
            <Field icon={MapPin} label="Location / Village" placeholder="Panchavati, Nashik" value={form.location} onChange={(v) => update('location', v)} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="State" value={form.state} onChange={(v) => update('state', v)} options={states} placeholder="Select state" />
              <SelectField
                label="District"
                value={form.district}
                onChange={(v) => update('district', v)}
                options={form.state ? districts[form.state] || [] : []}
                placeholder="Select district"
                disabled={!form.state}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Crop" value={form.crop} onChange={(v) => update('crop', v)} options={crops} placeholder="Select crop" />
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">Quantity (Qtl)</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
                  <input
                    type="number"
                    value={form.expectedQuantity || ''}
                    onChange={(e) => update('expectedQuantity', parseInt(e.target.value) || 0)}
                    placeholder="85"
                    min={1}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 dark:text-ink-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-600"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
        className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none transition-all text-ink-900 dark:text-ink-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
