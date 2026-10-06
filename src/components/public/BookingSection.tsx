import React, { useState, useMemo } from 'react';
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
  } = useClinic();

  // Booking Step State: 1 = Service, 2 = Date & Time, 3 = Patient Details, 4 = Success
  const [currentStep, setCurrentStep] = useState<number>(selectedService ? 2 : 1);

  // Date selection state
  // Start from tomorrow or today depending on hours
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    // Default to tomorrow to maximize slot availability
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
  React.useEffect(() => {
    if (selectedService && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedService]);

  // Compute available dates for the next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const now = new Date();
    // Next 14 days
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

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
    <section id="booking" className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Real-Time Online Scheduling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            Book your consultation or treatment
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Choose your service, select a live open time slot, and reserve your chair in seconds.
          </p>
        </div>

        {/* Step Indicator (Only steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-xl mx-auto relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 w-full -z-0" />

              {/* Step 1 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep >= 1
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  1
                </div>
                <span className="text-xs font-medium text-slate-700 mt-1.5 whitespace-nowrap">
                  Select Service
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep >= 2
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  2
                </div>
                <span className="text-xs font-medium text-slate-700 mt-1.5 whitespace-nowrap">
                  Date & Time
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep >= 3
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-500'
                  }`}
                >
                  3
                </div>
                <span className="text-xs font-medium text-slate-700 mt-1.5 whitespace-nowrap">
                  Patient Info
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
          {/* ================= STEP 1: SELECT SERVICE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Choose a Dental Treatment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a treatment to load real-time doctor availability and duration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold text-slate-900">{service.name}</h4>
                          <span className="text-sm font-bold text-teal-800 tabular-nums">
                            ${service.price}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span className="tabular-nums">{service.duration_minutes} min appointment</span>
                        </span>
                        <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Continue to Date & Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SELECT DATE & TIME ================= */}
          {currentStep === 2 && selectedService && (
            <div className="space-y-8">
              {/* Header with Selected Service Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Date & Available Time</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Slots calculated using active operating hours and buffer times.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
                  <div className="text-left">
                    <span className="block text-[11px] text-slate-400 font-medium">Selected Treatment</span>
                    <span className="text-xs font-bold text-slate-800">{selectedService.name}</span>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer ml-2"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Horizontal Date Picker Carousel */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Select Day (Next 14 Days)
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
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
                        className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-700/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {dayLabel}
                        </span>
                        <span className="text-base font-bold my-0.5 tabular-nums">
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
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Available Time Slots for {formatDisplayDate(selectedDate)}
                  </label>
                  <span className="text-xs text-slate-400">
                    {availabilityResult.slots.length} available
                  </span>
                </div>

                {availabilityResult.isBlocked ? (
                  <div className="p-8 text-center bg-amber-50/70 border border-amber-200/70 rounded-2xl text-amber-900 space-y-1">
                    <AlertCircle className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                    <p className="text-sm font-bold">Clinic Unavailable on this Date</p>
                    <p className="text-xs text-amber-700">{availabilityResult.blockedReason}</p>
                  </div>
                ) : availabilityResult.isClosedDay ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 space-y-1">
                    <CalendarDays className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800">Closed on this Weekday</p>
                    <p className="text-xs text-slate-500">
                      Our studio is closed on {selectedDate.toLocaleDateString([], { weekday: 'long' })}s. Please pick another date above.
                    </p>
                  </div>
                ) : availabilityResult.slots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 space-y-1">
                    <Clock className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-bold text-slate-800">No Open Slots Remaining</p>
                    <p className="text-xs text-slate-500">
                      All slots for this date are fully reserved or exceed the minimum notice window. Please select an alternate date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availabilityResult.slots.map((slot, sIdx) => {
                      const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-teal-500/50 hover:bg-teal-50/20'
                          }`}
                        >
                          <span className="text-xs font-bold tabular-nums">
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

              {/* Navigation Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Services</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PATIENT CONTACT DETAILS ================= */}
          {currentStep === 3 && selectedService && selectedSlot && (
            <form onSubmit={handleSubmitBooking} className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Patient & Contact Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide your contact information to receive your confirmation.
                  </p>
                </div>
              </div>

              {/* Appointment Recap Card */}
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Appointment Summary
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{selectedService.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-700" />
                      <span>{formatDisplayDate(selectedDate)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-700" />
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
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 self-start sm:self-auto cursor-pointer"
                >
                  Edit Time
                </button>
              </div>

              {submitError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Time</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold text-xs py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
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
            <div className="text-center py-6 sm:py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-slate-900">
                  Appointment Request Confirmed!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Thank you, <strong className="text-slate-800">{createdAppointment.full_name}</strong>. Your appointment has been registered in our schedule.
                </p>
              </div>

              {/* Summary Receipt Box */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200/80 p-6 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Confirmation ID</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">
                    {createdAppointment.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Service</span>
                  <span className="text-xs font-bold text-slate-900">
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
                  <span className="text-xs text-slate-900">{createdAppointment.email}</span>
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

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
