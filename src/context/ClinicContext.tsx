import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ClinicSettings,
  Service,
  BusinessHours,
  BlockedDate,
  Appointment,
} from '../types/database';
import {
  getClinicSettings,
  getAllServices,
  getBusinessHours,
  getBlockedDates,
  getAppointments,
} from '../lib/api';

interface ClinicContextType {
  settings: ClinicSettings | null;
  services: Service[];
  activeServices: Service[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshBusinessHours: () => Promise<void>;
  refreshBlockedDates: () => Promise<void>;
  saveServiceLocally: (service: Service) => void;
  saveBusinessHoursLocally: (hours: BusinessHours[]) => void;
  addBlockedDateLocally: (date: BlockedDate) => void;
  removeBlockedDateLocally: (id: string) => void;
  saveSettingsLocally: (newSettings: ClinicSettings) => void;
  updateAppointmentLocally: (id: string, status: Appointment['status']) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await getClinicSettings();
      if (data) setSettings(data);
    } catch (err) {
      console.error('Failed to load clinic settings', err);
    }
  }, []);

  const refreshServices = useCallback(async () => {
    try {
      const data = await getAllServices();
      if (data && data.length > 0) setServices(data);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  }, []);

  const refreshBusinessHours = useCallback(async () => {
    try {
      const data = await getBusinessHours();
      if (data && data.length > 0) setBusinessHours(data);
    } catch (err) {
      console.error('Failed to load business hours', err);
    }
  }, []);

  const refreshBlockedDates = useCallback(async () => {
    try {
      const data = await getBlockedDates();
      setBlockedDates(data);
    } catch (err) {
      console.error('Failed to load blocked dates', err);
    }
  }, []);

  const refreshAppointments = useCallback(async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshSettings(),
        refreshServices(),
        refreshBusinessHours(),
        refreshBlockedDates(),
        refreshAppointments(),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch clinic data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    refreshSettings,
    refreshServices,
    refreshBusinessHours,
    refreshBlockedDates,
    refreshAppointments,
  ]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Optimistic local helpers
  const saveServiceLocally = (service: Service) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.map((s) => (s.id === service.id ? service : s));
      }
      return [...prev, service];
    });
  };

  const saveBusinessHoursLocally = (hours: BusinessHours[]) => {
    setBusinessHours(hours);
  };

  const addBlockedDateLocally = (date: BlockedDate) => {
    setBlockedDates((prev) => [...prev, date]);
  };

  const removeBlockedDateLocally = (id: string) => {
    setBlockedDates((prev) => prev.filter((d) => d.id !== id));
  };

  const saveSettingsLocally = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
  };

  const updateAppointmentLocally = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const activeServices = services.filter((s) => s.is_active);

  return (
    <ClinicContext.Provider
      value={{
        settings,
        services,
        activeServices,
        businessHours,
        blockedDates,
        appointments,
        isLoading,
        error,
        refreshData,
        refreshAppointments,
        refreshServices,
        refreshSettings,
        refreshBusinessHours,
        refreshBlockedDates,
        saveServiceLocally,
        saveBusinessHoursLocally,
        addBlockedDateLocally,
        removeBlockedDateLocally,
        saveSettingsLocally,
        updateAppointmentLocally,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
