import React from 'react';
import { CLINIC_IMAGES } from '../../lib/images';
import { Calendar, ArrowRight, CheckCircle2, Star, Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface HeroProps {
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const { settings } = useClinic();
  const noticeHours = settings?.booking_notice_hours ?? 2;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-16 lg:pb-24">
      {/* Subtle ambient lighting glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-72 sm:w-96 h-72 sm:h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-4 sm:left-10 -z-10 w-60 sm:w-80 h-60 sm:h-80 bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Editorial Proposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Editorial kicker */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-teal-800">
              <span>Modern Preventive & Aesthetic Dentistry</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>Private Practice</span>
            </div>

            <h1 className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.14] text-balance">
              Thoughtful, gentle dental care designed around your comfort.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
              Experience modern oral healthcare free of stress. We blend digital precision diagnostics with an exceptionally calm, boutique clinical environment.
            </p>

            {/* Primary Action Zone */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Book Your Appointment</span>
                <ArrowRight className="w-4 h-4 opacity-80 shrink-0" />
              </button>

              <a
                href="#services"
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-colors text-xs sm:text-sm hover:bg-slate-50 text-center"
              >
                <span>View Treatments & Fees</span>
              </a>
            </div>

            {/* Trust Markers with dot separators (Zero-Pill discipline) */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium">3D Digital Imaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium">Biocompatible Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium">Notice: {noticeHours}h In Advance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Focal Anchor */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Image Frame with refined layered border */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl lg:shadow-2xl bg-white aspect-4/3 sm:aspect-5/4 lg:aspect-5/4">
                <img
                  src={CLINIC_IMAGES.hero}
                  alt="Modern private dental treatment suite with panoramic natural lighting"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                {/* Subtle soft gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Floating calm metric card */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-white/50 shadow-lg text-slate-800">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 shrink-0" />
                        ))}
                        <span className="ml-1 text-[11px] sm:text-xs font-bold text-slate-900 tabular-nums">4.9 / 5.0</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                        Over 2,400 verified reviews
                      </p>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-2.5 sm:pl-4 shrink-0">
                      <span className="text-[10px] sm:text-xs font-semibold text-teal-700 block whitespace-nowrap">
                        Accepting Patients
                      </span>
                      <span className="text-[9px] sm:text-[11px] text-slate-500 whitespace-nowrap">
                        New & Emergency
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
