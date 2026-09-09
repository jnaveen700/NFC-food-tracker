import React, { useState } from 'react';
import { UtensilsCrossed, Lock, Mail, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@mess.edu');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const res = await api.login(email, password);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/10">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Mess NFC</h1>
          <p className="text-xs text-slate-500 font-medium">
            Food Attendance & Meal Tracking System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xl shadow-slate-200/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Staff Sign In</h2>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Sign In to Mess Portal
          </Button>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500">
              Default Credentials: <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">admin@mess.edu / admin123</code>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
