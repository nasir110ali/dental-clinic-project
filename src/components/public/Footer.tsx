import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Sparkles, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onBookClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onBookClick }) => {
  const { settings } = useClinic();

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';
  const clinicAddress = settings?.clinic_address || '123 Main Street, New York, NY';
  const clinicPhone = settings?.clinic_phone || '+1 (555) 123-4567';
  const clinicEmail = settings?.clinic_email || 'hello@brightsmile.com';

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>{clinicName}</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              State-of-the-art restorative, aesthetic, and preventive dentistry delivered with an uncompromising standard of patient comfort and clinical precision.
            </p>
            <div className="flex items-center gap-2 text-slate-500 pt-2 text-[11px]">
              <Heart className="w-3.5 h-3.5 text-teal-500" />
              <span>Dedicated to healthy, confident smiles.</span>
            </div>
          </div>

          {/* Practice Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Treatments & Fees
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Our Facility & Standards
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-white transition-colors">
                  Office Hours & Location
                </a>
              </li>
              <li>
                <button
                  onClick={onBookClick}
                  className="hover:text-white transition-colors text-left cursor-pointer text-teal-400 font-medium"
                >
                  Book an Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Clinic Inquiries
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>{clinicAddress}</p>
              <p className="tabular-nums">Phone: {clinicPhone}</p>
              <p>Email: {clinicEmail}</p>
            </div>

            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px] font-medium cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-teal-500" />
                <span>Dental Office Admin Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>HIPAA-Compliant Protocols</span>
            <span aria-hidden="true">·</span>
            <span>OSHA Certified Facility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
