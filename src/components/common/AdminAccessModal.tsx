import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractApiErrorMessage } from '../../services/api';
import {
  adminLoginSchema,
  type AdminLoginValues,
} from '../../validations/clientSchemas';

interface AdminAccessModalProps {
  onClose: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ onClose }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  closeRef.current = onClose;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLInputElement>('input')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, []);

  const onSubmit = async (values: AdminLoginValues) => {
    try {
      await login(values.email, values.password);
      showToast('Welcome back to your Portfolio CMS!', 'success');
      closeRef.current();
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('root.server', {
        type: 'server',
        message: extractApiErrorMessage(err, 'Sign in could not be completed. Try again.'),
      });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02030D]/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeRef.current();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-access-title"
        aria-describedby="admin-access-description"
        className="cosmic-card relative w-full max-w-md rounded-3xl border border-[#8B19FF]/35 p-6 sm:p-8 text-[#F5F5FF]"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => closeRef.current()}
          aria-label="Close admin login"
          className="absolute right-4 top-4 rounded-lg p-2 text-[#B5BCD9] hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/70"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mb-6 space-y-3 pr-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8B19FF]/40 bg-[#8B19FF]/20 text-[#00D9FF]">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="admin-access-title" className="font-display text-2xl font-bold text-white">
              Admin Login
            </h2>
            <p id="admin-access-description" className="mt-1 text-sm text-[#B5BCD9]">
              Sign in to continue to the private dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="private-admin-email" className="mb-1.5 block text-xs font-semibold text-[#E2E8F0]">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5BCD9]" aria-hidden="true" />
              <input
                id="private-admin-email"
                type="email"
                autoComplete="username"
                autoFocus
                placeholder="admin@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'private-admin-email-error' : undefined}
                {...register('email')}
                className="w-full rounded-xl border border-white/15 bg-[#05081D] py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:border-[#8B19FF] focus:outline-none"
              />
            </div>
            {errors.email && (
              <p id="private-admin-email-error" className="mt-1 text-xs text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="private-admin-password" className="mb-1.5 block text-xs font-semibold text-[#E2E8F0]">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5BCD9]" aria-hidden="true" />
              <input
                id="private-admin-password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'private-admin-password-error' : undefined}
                {...register('password')}
                className="w-full rounded-xl border border-white/15 bg-[#05081D] py-3 pl-10 pr-12 text-sm text-white placeholder:text-[#B5BCD9]/45 focus:border-[#8B19FF] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={passwordVisible}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#B5BCD9] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/70"
              >
                {passwordVisible
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && (
              <p id="private-admin-password-error" className="mt-1 text-xs text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root?.server && (
            <p role="alert" className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300">
              {errors.root.server.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-neon-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign in'}</span>
            {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
