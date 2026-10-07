import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Menu, X, Calendar, Phone, Sparkles } from 'lucide-react';

interface NavbarProps {
  onBookClick: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick, onOpenAdmin }) => {
  const { settings } = useClinic();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';
  const clinicPhone = settings?.clinic_phone || '+1 (555) 234-5678';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <a
              href="#"
              className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors truncate"
            >
              {clinicName}
            </a>
          </div>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 text-xs lg:text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-teal-700 transition-colors whitespace-nowrap py-1">
              Treatments
            </a>
            <a href="#about" className="hover:text-teal-700 transition-colors whitespace-nowrap py-1">
              The Clinic
            </a>
            <a href="#schedule" className="hover:text-teal-700 transition-colors whitespace-nowrap py-1">
              Hours & Location
            </a>
            <button
              onClick={onOpenAdmin}
              className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] lg:text-xs uppercase tracking-wider font-semibold whitespace-nowrap py-1"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Controls */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-4 shrink-0">
            {clinicPhone && (
              <a
                href={`tel:${clinicPhone.replace(/\s+/g, '')}`}
                className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors py-2 px-2.5 rounded-lg hover:bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="tabular-nums">{clinicPhone}</span>
              </a>
            )}

            <button
              onClick={onBookClick}
              className="flex items-center gap-2 bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px]"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Schedule Visit</span>
            </button>
          </div>

          {/* Mobile menu trigger with 44px min touch target */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={onBookClick}
              className="sm:hidden flex items-center gap-1.5 bg-teal-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xs mr-1 min-h-[38px] active:scale-[0.98]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-40 md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold"
              >
                Treatments & Pricing
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold"
              >
                The Clinic & Technology
              </a>
              <a
                href="#schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold"
              >
                Hours & Location
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-2 text-left min-h-[44px] px-3 rounded-xl hover:bg-teal-50 text-teal-800 font-semibold w-full cursor-pointer"
              >
                <Shield className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Admin Management {isAdmin && '(Active)'}</span>
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookClick();
                }}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold py-3 rounded-xl shadow-md active:scale-[0.99] transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </button>

              {clinicPhone && (
                <a
                  href={`tel:${clinicPhone.replace(/\s+/g, '')}`}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 rounded-xl border border-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call Clinic: {clinicPhone}</span>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
