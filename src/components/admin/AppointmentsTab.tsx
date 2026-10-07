import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types/database';
import { updateAppointmentStatus } from '../../lib/api';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from 'lucide-react';

export const AppointmentsTab: React.FC = () => {
  const { appointments, refreshAppointments, updateAppointmentLocally, isLoading } = useClinic();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      appt.full_name.toLowerCase().includes(q) ||
      appt.email.toLowerCase().includes(q) ||
      appt.phone.toLowerCase().includes(q) ||
      (appt.service?.name && appt.service.name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: Appointment['status']
  ) => {
    setUpdatingId(id);
    updateAppointmentLocally(id, newStatus);
    try {
      await updateAppointmentStatus(id, newStatus);
      await refreshAppointments();
    } catch (err) {
      console.warn('Remote update noted:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Status segmented controls */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-100/80 rounded-xl">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
              {st !== 'all' && (
                <span className="ml-1 text-[11px] text-slate-400 font-normal tabular-nums">
                  ({appointments.filter((a) => a.status === st).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-auto md:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, service..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 min-h-[40px]"
          />
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading && appointments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base font-bold text-slate-800">Loading appointments...</p>
            <p className="text-xs text-slate-400">Fetching records from Supabase.</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No appointments found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'Appointments booked by visitors will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((appt) => {
              const isUpdating = updatingId === appt.id;

              return (
                <div
                  key={appt.id}
                  className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6"
                >
                  {/* Left Patient & Service Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-base font-bold text-slate-900">
                        {appt.full_name}
                      </span>
                      {getStatusBadge(appt.status)}
                      <span className="text-xs font-mono text-slate-400">
                        #{appt.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{appt.appointment_date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="tabular-nums font-mono">
                          {appt.start_time.slice(0, 5)} – {appt.end_time.slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Service:</span>
                        <span className="font-semibold text-slate-800">
                          {appt.service?.name || 'Selected Dental Service'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${appt.email}`} className="text-teal-700 hover:underline break-all">
                          {appt.email}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${appt.phone}`} className="tabular-nums font-mono text-slate-700">
                          {appt.phone}
                        </a>
                      </div>
                    </div>

                    {appt.notes && (
                      <div className="pt-1 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="italic">{appt.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Update Status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <span className="text-xs text-slate-400 block lg:hidden w-full mb-0.5">
                      Change Status:
                    </span>
                    {appt.status !== 'confirmed' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, 'confirmed')}
                        className="px-3.5 py-2 min-h-[38px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}

                    {appt.status !== 'completed' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, 'completed')}
                        className="px-3.5 py-2 min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}

                    {appt.status !== 'pending' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, 'pending')}
                        className="px-3.5 py-2 min-h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Reset Pending
                      </button>
                    )}

                    {appt.status !== 'cancelled' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                        className="px-3.5 py-2 min-h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
