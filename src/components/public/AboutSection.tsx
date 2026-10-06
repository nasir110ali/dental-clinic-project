import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_IMAGES } from '../../lib/images';
import { ShieldCheck, Heart, MapPin, Mail, Phone, Clock } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings, businessHours } = useClinic();

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';
  const clinicAddress = settings?.clinic_address || '123 Main Street, New York, NY';
  const clinicEmail = settings?.clinic_email || 'hello@brightsmile.com';
  const clinicPhone = settings?.clinic_phone || '+1 (555) 123-4567';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Layered Visual Storytelling */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl bg-slate-100 aspect-4/3">
                <img
                  src={CLINIC_IMAGES.consultation}
                  alt="Friendly doctor in private dental consultation discussing oral health"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Offset secondary image */}
              <div className="hidden sm:block absolute -bottom-8 -right-8 w-60 h-44 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                <img
                  src={CLINIC_IMAGES.treatmentRoom}
                  alt="High tech dental care room"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Core Philosophy & Standards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800">
              <Heart className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient-First Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
              Redefining the dental visit into a calm, welcoming ritual.
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              At {clinicName}, we believe that fear and uncertainty have no place in dentistry. By combining low-radiation digital imaging, quiet electric handpieces, and an unhurried bedside manner, we make every checkup feel seamless.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Hospital-Grade Sterilization</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Individual multi-stage autoclave sterilization protocols exceeding CDC and ADA safety standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Zero Pressure Consultations</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    We review intraoral photos together on HD displays so you make informed, confident choices for your smile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Facility Card (Schedule & Location) */}
        <div id="schedule" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
            {/* Contact Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
                <Clock className="w-4 h-4" />
                <span>Visit Us</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Our Location & Operating Hours
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Centrally located with validated parking and accessible transit access. We welcome scheduled appointments as well as same-day emergency evaluations.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{clinicAddress}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="tabular-nums">{clinicPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{clinicEmail}</span>
                </div>
              </div>
            </div>

            {/* Operating Hours Table */}
            <div className="lg:col-span-6 bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                <span>Weekly Schedule</span>
                <span className="text-xs text-teal-400 font-normal">Real-time availability</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {businessHours.length === 0 ? (
                  <p className="text-slate-400">Loading clinic schedule...</p>
                ) : (
                  businessHours.map((schedule) => {
                    const dayName = dayNames[schedule.weekday];
                    const formatTime = (timeStr: string | null) => {
                      if (!timeStr) return '';
                      const [h, m] = timeStr.split(':');
                      const hourNum = parseInt(h, 10);
                      const ampm = hourNum >= 12 ? 'PM' : 'AM';
                      const displayH = hourNum % 12 || 12;
                      return `${displayH}:${m} ${ampm}`;
                    };

                    return (
                      <div
                        key={schedule.id || schedule.weekday}
                        className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-b-0"
                      >
                        <span className="font-medium text-slate-300">{dayName}</span>
                        {schedule.is_open ? (
                          <span className="text-slate-200 tabular-nums font-mono">
                            {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Closed</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
