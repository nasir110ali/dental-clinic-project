import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types/database';
import { updateAppointmentStatus } from '../../lib/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const {
    appointments,
    activeServices,
    refreshAppointments,
    updateAppointmentLocally,
    isLoading,
  } = useClinic();

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleQuickStatusChange = async (
    id: string,
    newStatus: Appointment['status']
  ) => {
    updateAppointmentLocally(id, newStatus);
    try {
      await updateAppointmentStatus(id, newStatus);
      await refreshAppointments();
    } catch (err) {
      console.warn('Remote update noted:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Pending Requests
            </span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block tabular-nums">
              {pending}
            </span>
            <span className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Requires confirmation</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Confirmed Visits
            </span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block tabular-nums">
              {confirmed}
            </span>
            <span className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>On calendar</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Completed Visits
            </span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block tabular-nums">
              {completed}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Treated patients</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Active Treatments
            </span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block tabular-nums">
              {activeServices.length}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Bookable online</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area: Recent Appointments & Operational Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Booking Submissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Newest appointment requests from prospective and existing patients.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading && appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">Loading recent appointments...</p>
              <p className="text-xs text-slate-400">Fetching records from Supabase.</p>
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No appointments registered yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Submissions from the public booking form will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((appt) => {
                const statusStyles: Record<string, string> = {
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
                  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                };

                return (
                  <div key={appt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{appt.full_name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                            statusStyles[appt.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {appt.service?.name || 'Dental Service'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-mono">{appt.appointment_date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-mono">{appt.start_time.slice(0, 5)}</span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-1">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Fast Status Dropdown / Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => handleQuickStatusChange(appt.id, 'confirmed')}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleQuickStatusChange(appt.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateTab('appointments')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Clinic Controls</h3>
            <p className="text-xs text-slate-500">
              Quick access to operational settings and scheduling configuration.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigateTab('services')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Manage Treatments</span>
                  <span className="text-[11px] text-slate-500">Add, edit pricing, or toggle active status</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('business_hours')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Weekly Office Hours</span>
                  <span className="text-[11px] text-slate-500">Configure open weekdays and hours</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('blocked_dates')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Blocked Dates & Holidays</span>
                  <span className="text-[11px] text-slate-500">Prevent appointments on specific days</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('clinic_settings')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Clinic Contact & Intervals</span>
                  <span className="text-[11px] text-slate-500">Notice hours, slot intervals, location</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
