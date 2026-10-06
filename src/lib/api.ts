import { supabase } from './supabase';
import {
  ClinicSettings,
  Service,
  BusinessHours,
  BlockedDate,
  Appointment,
} from '../types/database';

export async function getClinicSettings(): Promise<ClinicSettings | null> {
  const { data, error } = await supabase
    .from('clinic_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic settings:', error);
    return null;
  }
  return data;
}

export async function updateClinicSettings(
  id: string,
  updates: Partial<ClinicSettings>
): Promise<ClinicSettings> {
  const { data, error } = await supabase
    .from('clinic_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching active services:', error);
    return [];
  }
  return data || [];
}

export async function getAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching all services:', error);
    return [];
  }
  return data || [];
}

export async function createService(
  service: Omit<Service, 'id' | 'created_at'>
): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateService(
  id: string,
  updates: Partial<Service>
): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('weekday', { ascending: true });

  if (error) {
    console.error('Error fetching business hours:', error);
    return [];
  }
  return data || [];
}

export async function updateBusinessHours(
  id: string,
  updates: Partial<BusinessHours>
): Promise<BusinessHours> {
  const { data, error } = await supabase
    .from('business_hours')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('blocked_date', { ascending: true });

  if (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }
  return data || [];
}

export async function createBlockedDate(
  blocked_date: string,
  reason: string
): Promise<BlockedDate> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert([{ blocked_date, reason }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteBlockedDate(id: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAppointments(statusFilter?: string): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select('*, service:services(*)')
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: true });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  return data || [];
}

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'created_at' | 'service'>
): Promise<Appointment> {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `apt-${Date.now()}`;
  const created_at = new Date().toISOString();

  const record: Appointment = {
    ...appointment,
    id,
    created_at,
  };

  const { error } = await supabase
    .from('appointments')
    .insert([record]);

  if (error) {
    throw new Error(error.message);
  }

  return record;
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error('Check admin exception:', err);
    return false;
  }
}
