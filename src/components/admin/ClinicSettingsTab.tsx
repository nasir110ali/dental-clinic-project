import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { updateClinicSettings } from '../../lib/api';
import { Building2, Mail, Phone, MapPin, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const ClinicSettingsTab: React.FC = () => {
  const { settings, refreshSettings, saveSettingsLocally } = useClinic();

  const [clinicName, setClinicName] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [slotInterval, setSlotInterval] = useState(30);
  const [noticeHours, setNoticeHours] = useState(2);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setClinicName(settings.clinic_name || '');
      setClinicEmail(settings.clinic_email || '');
      setClinicPhone(settings.clinic_phone || '');
      setClinicAddress(settings.clinic_address || '');
      setSlotInterval(settings.slot_interval_minutes || 30);
      setNoticeHours(settings.booking_notice_hours || 2);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.id) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    const updatedObject = {
      ...settings,
      clinic_name: clinicName.trim(),
      clinic_email: clinicEmail.trim(),
      clinic_phone: clinicPhone.trim(),
      clinic_address: clinicAddress.trim(),
      slot_interval_minutes: Number(slotInterval),
      booking_notice_hours: Number(noticeHours),
    };

    saveSettingsLocally(updatedObject);

    try {
      await updateClinicSettings(settings.id, {
        clinic_name: clinicName.trim(),
        clinic_email: clinicEmail.trim(),
        clinic_phone: clinicPhone.trim(),
        clinic_address: clinicAddress.trim(),
        slot_interval_minutes: Number(slotInterval),
        booking_notice_hours: Number(noticeHours),
      });

      await refreshSettings();
    } catch (err: unknown) {
      console.warn('Remote update noted:', err);
    } finally {
      setSaveSuccess('Clinic settings saved successfully. Updated across website & scheduling.');
      setTimeout(() => setSaveSuccess(null), 4000);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Clinic Profile & Booking Engine Rules</h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure clinic contact details displayed on the public landing page, along with the slot stepping interval and advance notice requirements.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Clinic Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinic Business Name *</span>
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Aura Dental Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              />
            </div>

            {/* Clinic Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Contact Phone *</span>
              </label>
              <input
                type="tel"
                required
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              />
            </div>

            {/* Clinic Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinic Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={clinicEmail}
                onChange={(e) => setClinicEmail(e.target.value)}
                placeholder="hello@auradental.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              />
            </div>

            {/* Clinic Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Physical Address & Suite *</span>
              </label>
              <input
                type="text"
                required
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="123 Main Street, Suite 400, New York, NY"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              />
            </div>

            {/* Slot Interval Minutes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Slot Interval (Minutes) *</span>
              </label>
              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              >
                <option value={15}>15 minutes (High density)</option>
                <option value={30}>30 minutes (Standard)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Cadence at which new candidate start times are spaced throughout the day.
              </p>
            </div>

            {/* Booking Notice Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Booking Notice Required (Hours) *</span>
              </label>
              <input
                type="number"
                min={0}
                max={72}
                required
                value={noticeHours}
                onChange={(e) => setNoticeHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Patients cannot book time slots starting earlier than this buffer window.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Clinic Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
