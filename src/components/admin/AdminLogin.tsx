import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2, UserCheck, KeyRound, Copy } from 'lucide-react';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const {
    signIn,
    signOut,
    user,
    isAdmin,
    isCheckingAdmin,
    unauthorizedMessage,
    authError,
    refreshAdminStatus,
    claimAdminRole,
  } = useAuth();
  const { settings } = useClinic();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setClaimStatus(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setClaimStatus('Attempting authorization...');
    const result = await claimAdminRole();
    if (result.success) {
      setClaimStatus('Success! Admin privileges verified.');
    } else {
      setClaimStatus(result.message);
    }
  };

  const copySqlStatement = () => {
    if (!user) return;
    const sql = `INSERT INTO admin_users (user_id) VALUES ('${user.id}');`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -z-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Clinic Website</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400">{clinicName} Management System</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
          {/* If already authenticated but checking or unauthorized */}
          {user && !isAdmin ? (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">Access Restricted</h3>
                    <p className="text-xs text-amber-800 mt-1">
                      {unauthorizedMessage || 'You are signed in, but you are not authorized as an admin.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Signed In Account
                </span>
                <p className="text-slate-800 font-medium break-all">{user.email}</p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Supabase User ID:</span>
                  <code className="text-[11px] font-mono text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded break-all select-all block mt-1">
                    {user.id}
                  </code>
                </div>
              </div>

              {claimStatus && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
                  {claimStatus}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize Current Account (admin_users)</span>
                </button>

                <button
                  type="button"
                  onClick={copySqlStatement}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied SQL Query!' : 'Copy SQL Grant Query'}</span>
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => refreshAdminStatus()}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                  >
                    Re-check Permissions
                  </button>

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Sign Out & Switch User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In to Dashboard</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate with authorized dental clinic staff credentials.
                </p>
              </div>

              {(localError || authError) && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinic.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCheckingAdmin}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {isSubmitting || isCheckingAdmin ? (
                  <span>Authenticating & Verifying...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">
                  Secured via Supabase Auth & Role-Based Access Control (RBAC).
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
