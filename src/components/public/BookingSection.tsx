import React, { useState, useMemo, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service, TimeSlot, Appointment } from '../../types/database';
import {
  computeAvailableSlots,
  formatDateKey,
  formatDisplayDate,
} from '../../lib/availability';
import { createAppointment } from '../../lib/api';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

interface BookingSectionProps {
  selectedService: Service | null;
  onSelectService: (service: Service | null) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  selectedService,
  onSelectService,
}) => {
  const {
    activeServices,
    businessHours,
    blockedDates,
    settings: clinicSettings,
    appointments,
    refreshAppointments,
    addAppointmentLocally,
    isLoading,
  } = useClinic();

  // Booking Step State: 1 = Service, 2 = Date & Time, 3 = Patient Details, 4 = Success
  const [currentStep, setCurrentStep] = useState<number>(selectedService ? 2 : 1);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  // Selected Slot State
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Patient Details State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Update currentStep when selectedService is passed from parent
  useEffect(() => {
    if (selectedService && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedService]);

  // Compute available dates for the next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Auto-advance to first open date if selectedDate is closed or blocked
  useEffect(() => {
    if (businessHours.length === 0) return;
    const currentWeekday = selectedDate.getDay();
    const currentSchedule = businessHours.find((b) => b.weekday === currentWeekday);
    const currentDateKey = formatDateKey(selectedDate);
    const isCurrentBlocked = blockedDates.some((b) => (b.blocked_date || '').trim() === currentDateKey);

    if (!currentSchedule || !currentSchedule.is_open || isCurrentBlocked) {
      for (const d of availableDates) {
        const sched = businessHours.find((b) => b.weekday === d.getDay());
        const dKey = formatDateKey(d);
        const isB = blockedDates.some((b) => (b.blocked_date || '').trim() === dKey);
        if (sched && sched.is_open && !isB) {
          setSelectedDate(d);
          break;
        }
      }
    }
  }, [businessHours, blockedDates, availableDates]);

  // Compute slots for current selectedDate & selectedService
  const availabilityResult = useMemo(() => {
    if (!selectedService) {
      return { slots: [], isBlocked: false, isClosedDay: false };
    }

    return computeAvailableSlots({
      selectedDate,
      service: selectedService,
      businessHours,
      blockedDates,
      clinicSettings,
      existingAppointments: appointments,
    });
  }, [
    selectedDate,
    selectedService,
    businessHours,
    blockedDates,
    clinicSettings,
    appointments,
  ]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setSubmitError('Please fill out all required contact fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const dateKey = formatDateKey(selectedDate);

      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        service_id: selectedService.id,
        appointment_date: dateKey,
        start_time: selectedSlot.startTimeStr,
        end_time: selectedSlot.endTimeStr,
        status: 'pending' as const,
        notes: notes.trim() ? notes.trim() : null,
      };

      const result = await createAppointment(payload);
      addAppointmentLocally({
        ...result,
        service: selectedService,
      });
      setCreatedAppointment({
        ...result,
        service: selectedService,
      });
      await refreshAppointments();
      setCurrentStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule appointment';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    onSelectService(null);
    setSelectedSlot(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setCreatedAppointment(null);
    setSubmitError(null);
    setCurrentStep(1);
  };

  return (
    <section id="booking" className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Real-Time Online Scheduling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            Book your consultation or treatment
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed px-2">
            Choose your service, select a live open time slot, and reserve your chair in seconds.
          </p>
        </div>

        {/* Responsive Step Indicator (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="mb-5 sm:mb-8 md:mb-10 px-1 sm:px-0">
            <div className="flex items-center justify-between max-w-md mx-auto relative px-3 sm:px-4">
              <div className="absolute left-8 right-8 top-3.5 sm:top-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

              {/* Step 1 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 1
                      ? 'bg-teal-700 text-white shadow-xs ring-4 ring-white'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  1
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 mt-1 text-center">
                  Treatment
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 2
                      ? 'bg-teal-700 text-white shadow-xs ring-4 ring-white'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 mt-1 text-center">
                  Date & Time
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 3
                      ? 'bg-teal-700 text-white shadow-xs ring-4 ring-white'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 mt-1 text-center">
                  Patient Info
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg sm:shadow-xl overflow-hidden p-3.5 sm:p-6 md:p-8 lg:p-10">
          {/* ================= STEP 1: SELECT SERVICE ================= */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-slate-100 pb-3 sm:pb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Choose a Dental Treatment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a treatment to load real-time doctor availability and duration.
                </p>
              </div>

              {isLoading && activeServices.length === 0 ? (
                <div className="p-8 sm:p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Loading Available Treatments...</p>
                  <p className="text-xs text-slate-500">Retrieving clinic catalog directly from database.</p>
                </div>
              ) : activeServices.length === 0 ? (
                <div className="p-8 sm:p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No Services Available Currently</p>
                  <p className="text-xs text-slate-500">
                    The clinic does not currently have active public procedures listed. Please contact the front desk directly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {activeServices.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          onSelectService(service);
                          setSelectedSlot(null);
                        }}
                        className={`text-left p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[105px] active:scale-[0.99] ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/60 shadow-sm ring-1 ring-teal-600'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">{service.name}</h4>
                            <span className="text-xs sm:text-sm font-bold text-teal-800 tabular-nums shrink-0">
                              ${service.price}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="tabular-nums">{service.duration_minutes} min visit</span>
                          </span>
                          <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected' : 'Tap to Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 sm:pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm py-3 px-6 rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue to Date & Time</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SELECT DATE & TIME ================= */}
          {currentStep === 2 && selectedService && (
            <div className="space-y-5 sm:space-y-8">
              {/* Header with Selected Service Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Select Date & Available Time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live slots computed using current office hours and notice buffers.
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
                  <div className="text-left min-w-0">
                    <span className="block text-[10px] text-slate-400 font-medium">Treatment</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{selectedService.name}</span>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer ml-3 min-h-[36px] flex items-center shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Horizontal Date Picker Carousel */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Select Day (Next 14 Days)
                  </label>
                  <span className="text-[10px] text-slate-400 sm:hidden">Swipe for more</span>
                </div>
                <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2.5 pt-1 no-scrollbar snap-x snap-mandatory -mx-1 px-1 sm:mx-0 sm:px-0">
                  {availableDates.map((date, idx) => {
                    const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
                    const dayLabel = date.toLocaleDateString([], { weekday: 'short' });
                    const dateNum = date.getDate();
                    const monthLabel = date.toLocaleDateString([], { month: 'short' });

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] min-h-[64px] sm:min-h-[66px] py-2 sm:py-3 px-1.5 sm:px-2 rounded-xl border text-xs transition-all cursor-pointer shrink-0 snap-center active:scale-[0.98] ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-700/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[10px] sm:text-[11px] font-medium ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {dayLabel}
                        </span>
                        <span className="text-sm sm:text-base font-bold my-0.5 tabular-nums">
                          {dateNum}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {monthLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Area */}
              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Available Slots for {formatDisplayDate(selectedDate)}
                  </label>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    {availabilityResult.slots.length} open
                  </span>
                </div>

                {availabilityResult.isBlocked ? (
                  <div className="p-5 sm:p-8 text-center bg-amber-50/70 border border-amber-200/70 rounded-2xl text-amber-900 space-y-1">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                    <p className="text-sm font-bold">Clinic Unavailable on this Date</p>
                    <p className="text-xs text-amber-700">{availabilityResult.blockedReason}</p>
                  </div>
                ) : availabilityResult.isClosedDay ? (
                  <div className="p-5 sm:p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 space-y-1">
                    <CalendarDays className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800">Closed on this Weekday</p>
                    <p className="text-xs text-slate-500">
                      Our studio is closed on {selectedDate.toLocaleDateString([], { weekday: 'long' })}s. Please pick another date above.
                    </p>
                  </div>
                ) : availabilityResult.slots.length === 0 ? (
                  <div className="p-5 sm:p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 space-y-1">
                    <Clock className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800">No Open Slots Remaining</p>
                    <p className="text-xs text-slate-500">
                      All slots for this date are fully reserved or exceed the minimum notice window. Please select an alternate date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {availabilityResult.slots.map((slot, sIdx) => {
                      const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`min-h-[52px] sm:min-h-[56px] p-2 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-[0.98] ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-sm ring-1 ring-teal-700'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-teal-500/50 hover:bg-teal-50/20'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold tabular-nums">
                            {slot.label.split('–')[0]?.trim()}
                          </span>
                          <span
                            className={`text-[10px] mt-0.5 tabular-nums ${
                              isSelected ? 'text-teal-100' : 'text-slate-500'
                            }`}
                          >
                            until {slot.label.split('–')[1]?.trim()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Actions (Responsive for mobile & tablet) */}
              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer py-2 rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Services</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm py-3 px-6 rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PATIENT CONTACT DETAILS ================= */}
          {currentStep === 3 && selectedService && selectedSlot && (
            <form onSubmit={handleSubmitBooking} className="space-y-6 sm:space-y-8">
              <div className="pb-3 sm:pb-4 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Patient & Contact Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please provide your contact information to receive your confirmation.
                </p>
              </div>

              {/* Appointment Recap Card */}
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Appointment Summary
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{selectedService.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{formatDisplayDate(selectedDate)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="tabular-nums">{selectedSlot.label}</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      Fee: ${selectedService.price}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[40px] text-xs font-semibold text-teal-700 hover:text-teal-900 self-start sm:self-auto cursor-pointer flex items-center"
                >
                  Edit Time
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Input Fields with iOS zoom prevention (text-base sm:text-sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full min-h-[46px] sm:min-h-[42px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full min-h-[46px] sm:min-h-[42px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full min-h-[46px] sm:min-h-[42px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Special Notes or Symptoms (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Tooth sensitivity on lower right"
                    className="w-full min-h-[46px] sm:min-h-[42px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer py-2 rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Time</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-3 px-6 sm:px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span>Confirming Appointment...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Appointment Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 4: SUCCESS CONFIRMATION ================= */}
          {currentStep === 4 && createdAppointment && (
            <div className="text-center py-4 sm:py-8 space-y-5 sm:space-y-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto px-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Appointment Request Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you, <strong className="text-slate-800">{createdAppointment.full_name}</strong>. Your appointment has been registered in our schedule.
                </p>
              </div>

              {/* Summary Receipt Box */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-6 text-left space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Confirmation ID</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">
                    {createdAppointment.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Service</span>
                  <span className="text-xs font-bold text-slate-900 text-right">
                    {createdAppointment.service?.name || selectedService?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Date</span>
                  <span className="text-xs font-medium text-slate-900">
                    {formatDisplayDate(selectedDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Scheduled Time</span>
                  <span className="text-xs font-medium text-slate-900 tabular-nums">
                    {selectedSlot?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Contact Email</span>
                  <span className="text-xs text-slate-900 truncate max-w-[200px]">{createdAppointment.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Contact Phone</span>
                  <span className="text-xs text-slate-900 tabular-nums">{createdAppointment.phone}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Estimated Total</span>
                  <span className="text-sm font-bold text-teal-800 tabular-nums">
                    ${selectedService?.price}
                  </span>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer active:scale-[0.99] transition-all"
                >
                  Schedule Another Visit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
