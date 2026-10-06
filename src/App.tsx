import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { AboutSection } from './components/public/AboutSection';
import { BookingSection } from './components/public/BookingSection';
import { Footer } from './components/public/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Service } from './types/database';
import { Loader2, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isAdmin, isLoadingSession, isCheckingAdmin } = useAuth();
  const [isAdminPortal, setIsAdminPortal] = useState<boolean>(() => {
    return window.location.hash === '#admin' || window.location.search.includes('admin=true');
  });
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<Service | null>(null);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminPortal(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminPortal(true);
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSite = () => {
    setIsAdminPortal(false);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBooking = (service?: Service) => {
    if (service) {
      setSelectedServiceToBook(service);
    }
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If viewing Admin Portal
  if (isAdminPortal) {
    if (isLoadingSession || isCheckingAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>Verifying administrative credentials...</span>
          </div>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return <AdminLogin onBackToSite={handleBackToSite} />;
    }

    return <AdminLayout onBackToWebsite={handleBackToSite} />;
  }

  // Public Dental Clinic Website
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Navbar
        onBookClick={() => scrollToBooking()}
        onOpenAdmin={handleOpenAdmin}
      />

      <main className="flex-1">
        <Hero onBookClick={() => scrollToBooking()} />
        <ServicesSection onSelectServiceToBook={(s) => scrollToBooking(s)} />
        <AboutSection />
        <BookingSection
          selectedService={selectedServiceToBook}
          onSelectService={setSelectedServiceToBook}
        />
      </main>

      <Footer
        onOpenAdmin={handleOpenAdmin}
        onBookClick={() => scrollToBooking()}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <MainApp />
      </ClinicProvider>
    </AuthProvider>
  );
}
