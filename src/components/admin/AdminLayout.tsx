import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { OverviewTab } from './OverviewTab';
import { AppointmentsTab } from './AppointmentsTab';
import { ServicesTab } from './ServicesTab';
import { BusinessHoursTab } from './BusinessHoursTab';
import { BlockedDatesTab } from './BlockedDatesTab';
import { ClinicSettingsTab } from './ClinicSettingsTab';
import {
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  Clock,
  CalendarOff,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  User,
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToWebsite }) => {
  const { user, signOut } = useAuth();
  const { settings } = useClinic();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const clinicName = settings?.clinic_name || 'Aura Dental Studio';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'business_hours', label: 'Business Hours', icon: Clock },
    { id: 'blocked_dates', label: 'Blocked Dates', icon: CalendarOff },
    { id: 'clinic_settings', label: 'Clinic Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Brand & Clinic Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-sm font-bold text-white truncate">
                  {clinicName}
                </span>
                <span className="block text-[11px] text-teal-400 font-medium">
                  Practice Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Admin User Tag */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden text-left flex-1">
              <span className="text-[11px] font-semibold text-white block truncate">
                {user?.email || 'Admin Staff'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block">
                ID: {user?.id ? user.id.slice(0, 10) + '...' : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onBackToWebsite}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </button>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Context */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Admin Management</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-bold capitalize">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </button>
          </div>
        </header>

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'business_hours' && <BusinessHoursTab />}
          {activeTab === 'blocked_dates' && <BlockedDatesTab />}
          {activeTab === 'clinic_settings' && <ClinicSettingsTab />}
        </main>
      </div>
    </div>
  );
};
