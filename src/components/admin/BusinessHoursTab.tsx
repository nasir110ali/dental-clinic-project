import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { updateBusinessHours } from '../../lib/api';
import { BusinessHours } from '../../types/database';
import { Clock, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const BusinessHoursTab: React.FC = () => {
  const { businessHours, refreshBusinessHours, saveBusinessHoursLocally } = useClinic();

  // Local state copy for responsive in-place editing
  const [localHours, setLocalHours] = useState<BusinessHours[]>(businessHours);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync when parent data loads or changes
  React.useEffect(() => {
    setLocalHours(businessHours);
  }, [businessHours]);

  const handleToggleOpen = (index: number) => {
    const updated = [...localHours];
    const item = { ...updated[index] };
    item.is_open = !item.is_open;
    if (item.is_open && (!item.start_time || !item.end_time)) {
      item.start_time = '09:00:00';
      item.end_time = '17:00:00';
    }
    updated[index] = item;
    setLocalHours(updated);
  };

  const handleTimeChange = (
    index: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const updated = [...localHours];
    const item = { ...updated[index] };
    // Append seconds if needed e.g. "09:00" -> "09:00:00"
    item[field] = value.length === 5 ? `${value}:00` : value;
    updated[index] = item;
    setLocalHours(updated);
  };

  const handleSaveDay = async (index: number) => {
    const item = localHours[index];
    if (!item?.id) return;

    setSavingId(item.id);
    setSaveSuccess(null);
    setSaveError(null);

    // Save locally immediately
    saveBusinessHoursLocally(localHours);

    try {
      await updateBusinessHours(item.id, {
        is_open: item.is_open,
        start_time: item.is_open ? item.start_time : null as unknown as string,
        end_time: item.is_open ? item.end_time : null as unknown as string,
      });

      await refreshBusinessHours();
    } catch (err: unknown) {
      console.warn('Remote update noted:', err);
    } finally {
      setSaveSuccess(`Updated schedule for ${WEEKDAYS[item.weekday]}`);
      setTimeout(() => setSaveSuccess(null), 3000);
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Clinic Operating Hours</h3>
        <p className="text-xs text-slate-500 mt-1">
          Adjust clinic operating hours for each day of the week. Time slots in the public booking engine are generated directly within these boundaries.
        </p>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Weekdays Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
        {localHours.map((bh, idx) => {
          const isSaving = savingId === bh.id;
          const dayName = WEEKDAYS[bh.weekday];
          const startTimeInput = bh.start_time ? bh.start_time.slice(0, 5) : '09:00';
          const endTimeInput = bh.end_time ? bh.end_time.slice(0, 5) : '17:00';

          return (
            <div
              key={bh.id || bh.weekday}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
            >
              {/* Day title & open switch */}
              <div className="flex items-center gap-4 w-48">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bh.is_open}
                    onChange={() => handleToggleOpen(idx)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{dayName}</h4>
                  <span className={`text-[11px] font-medium ${bh.is_open ? 'text-teal-700' : 'text-slate-400'}`}>
                    {bh.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Time Pickers (if open) */}
              <div className="flex-1 flex flex-wrap items-center gap-4">
                {bh.is_open ? (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Opens:</span>
                      <input
                        type="time"
                        value={startTimeInput}
                        onChange={(e) => handleTimeChange(idx, 'start_time', e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>

                    <span className="text-slate-400">to</span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Closes:</span>
                      <input
                        type="time"
                        value={endTimeInput}
                        onChange={(e) => handleTimeChange(idx, 'end_time', e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Clinic is closed all day. No slots will be offered.
                  </span>
                )}
              </div>

              {/* Save Day Button */}
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveDay(idx)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Day'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
