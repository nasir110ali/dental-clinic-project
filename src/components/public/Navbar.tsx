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
  const { isAdmin, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';
  const clinicPhone = settings?.clinic_phone || '+1 (555) 234-5678';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <a
              href="#"
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors"
            >
              {clinicName}
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-teal-700 transition-colors">
              Treatments
            </a>
            <a href="#about" className="hover:text-teal-700 transition-colors">
              The Clinic
            </a>
            <a href="#schedule" className="hover:text-teal-700 transition-colors">
              Hours & Location
            </a>
            <button
              onClick={onOpenAdmin}
              className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Controls */}
          <div className="hidden sm:flex items-center gap-4">
            {clinicPhone && (
              <a
                href={`tel:${clinicPhone.replace(/\s+/g, '')}`}
                className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span className="tabular-nums">{clinicPhone}</span>
              </a>
            )}

            <button
              onClick={onBookClick}
              className="flex items-center gap-2 bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50"
            >
              Treatments
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50"
            >
              The Clinic
            </a>
            <a
              href="#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-slate-50"
            >
              Hours & Location
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center gap-2 text-left px-2 py-1.5 text-teal-700 font-semibold"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal {isAdmin && '(Signed In)'}</span>
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            {clinicPhone && (
              <a
                href={`tel:${clinicPhone.replace(/\s+/g, '')}`}
                className="text-center text-xs text-slate-600 py-1"
              >
                Call: {clinicPhone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
