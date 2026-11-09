import React from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractApiErrorMessage } from '../../services/api';
import {
  adminLoginSchema,
  type AdminLoginValues,
} from '../../validations/clientSchemas';
import { BrandLogo } from '../../components/common/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: string } | null)?.from || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (values: AdminLoginValues) => {
    try {
      await login(values.email, values.password);
      showToast('Welcome back to your Portfolio CMS!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Authentication failed.'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#030514] text-[#F5F5FF] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-[520px] h-[520px] rounded-full bg-[#8B19FF]/15 blur-[130px]"
      />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <BrandLogo name="Mahim Dev" subtitle="Admin Portal" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5BCD9] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>

        <div className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-6 border border-[#8B19FF]/35">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-[#8B19FF]/20 border border-[#8B19FF]/40 flex items-center justify-center text-[#00D9FF]">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              Administrator Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#B5BCD9]">
              Protected CMS console. Public account registration is disabled.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B5BCD9] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  {...register('email')}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#E2E8F0] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B5BCD9] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:outline-none focus:border-[#8B19FF]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-neon-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
