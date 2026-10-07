import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { createBlockedDate, deleteBlockedDate } from '../../lib/api';
import { Calendar, Trash2, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const BlockedDatesTab: React.FC = () => {
  const {
    blockedDates,
    refreshBlockedDates,
    addBlockedDateLocally,
    removeBlockedDateLocally,
    isLoading,
  } = useClinic();

  const [dateInput, setDateInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateInput.trim() || !reasonInput.trim()) {
      setErrorMsg('Please specify both the date and reason.');
      return;
    }

    setIsAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newBlockedItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `blk-${Date.now()}`,
      blocked_date: dateInput.trim(),
      reason: reasonInput.trim(),
      created_at: new Date().toISOString(),
    };

    addBlockedDateLocally(newBlockedItem);

    try {
      await createBlockedDate(dateInput.trim(), reasonInput.trim());
      await refreshBlockedDates();
    } catch (err: unknown) {
      console.warn('Remote update noted:', err);
    } finally {
      setDateInput('');
      setReasonInput('');
      setSuccessMsg('Date blocked successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMsg(null);
    removeBlockedDateLocally(id);
    try {
      await deleteBlockedDate(id);
      await refreshBlockedDates();
    } catch (err: unknown) {
      console.warn('Remote delete noted:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Blocked Dates & Holidays</h3>
          <p className="text-xs text-slate-500 mt-1">
            Specify clinical maintenance days, national holidays, or staff training. Visitors will not be able to select any slots on blocked dates.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddBlockedDate} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Date *
            </label>
            <input
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Public Notice *
            </label>
            <input
              type="text"
              required
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Annual Staff Training Seminar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Blocking...' : 'Block Date'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Blocked Dates List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Currently Blocked Dates</h4>
          <span className="text-xs text-slate-400 tabular-nums font-mono">
            {blockedDates.length} entries
          </span>
        </div>

        {isLoading && blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">Loading blocked dates...</p>
            <p className="text-xs text-slate-400">Fetching records from Supabase.</p>
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No dates currently blocked</p>
            <p className="text-xs text-slate-400 mt-1">
              The clinic operates on normal weekly schedules with no blackout dates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedDates.map((item) => {
              const isDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {item.blocked_date}
                      </span>
                      <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium">
                        {item.reason}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Blocked on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    disabled={isDeleting}
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove blackout date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
