import { Appointment, BusinessHours, BlockedDate, ClinicSettings, Service, TimeSlot } from '../types/database';

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeString(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDisplayTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function parseTimeParts(timeStr: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const parts = timeStr.split(':');
  return {
    hours: parseInt(parts[0] || '0', 10),
    minutes: parseInt(parts[1] || '0', 10),
  };
}

export interface AvailabilityParams {
  selectedDate: Date;
  service: Service;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  clinicSettings: ClinicSettings | null;
  existingAppointments: Appointment[];
}

export function computeAvailableSlots(params: AvailabilityParams): {
  slots: TimeSlot[];
  isBlocked: boolean;
  blockedReason?: string;
  isClosedDay: boolean;
} {
  const {
    selectedDate,
    service,
    businessHours,
    blockedDates,
    clinicSettings,
    existingAppointments,
  } = params;

  const dateStr = formatDateKey(selectedDate);

  // 1. Check if date is blocked
  const blocked = blockedDates.find((b) => b.blocked_date === dateStr);
  if (blocked) {
    return {
      slots: [],
      isBlocked: true,
      blockedReason: blocked.reason || 'Clinic closed on this date',
      isClosedDay: false,
    };
  }

  // 2. Check business hours for weekday (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const weekday = selectedDate.getDay();
  const daySchedule = businessHours.find((b) => b.weekday === weekday);

  if (!daySchedule || !daySchedule.is_open || !daySchedule.start_time || !daySchedule.end_time) {
    return {
      slots: [],
      isBlocked: false,
      isClosedDay: true,
    };
  }

  const { hours: openH, minutes: openM } = parseTimeParts(daySchedule.start_time);
  const { hours: closeH, minutes: closeM } = parseTimeParts(daySchedule.end_time);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();

  const openTime = new Date(year, month, day, openH, openM, 0, 0);
  const closeTime = new Date(year, month, day, closeH, closeM, 0, 0);

  const durationMin = Math.max(15, service.duration_minutes || 30);
  const intervalMin = Math.max(15, clinicSettings?.slot_interval_minutes || 30);
  const noticeHours = clinicSettings?.booking_notice_hours ?? 2;

  const now = new Date();
  const noticeThreshold = new Date(now.getTime() + noticeHours * 60 * 60 * 1000);

  // Filter existing active appointments on this day (ignore cancelled)
  const dayAppointments = existingAppointments
    .filter((a) => a.appointment_date === dateStr && a.status !== 'cancelled')
    .map((a) => {
      const { hours: sh, minutes: sm } = parseTimeParts(a.start_time);
      const { hours: eh, minutes: em } = parseTimeParts(a.end_time);
      return {
        start: new Date(year, month, day, sh, sm, 0, 0),
        end: new Date(year, month, day, eh, em, 0, 0),
      };
    });

  const slots: TimeSlot[] = [];
  let currentMs = openTime.getTime();
  const closeMs = closeTime.getTime();
  const durationMs = durationMin * 60 * 1000;
  const intervalMs = intervalMin * 60 * 1000;

  while (currentMs + durationMs <= closeMs) {
    const slotStart = new Date(currentMs);
    const slotEnd = new Date(currentMs + durationMs);

    // Rule: Respect booking notice time
    const isPastNotice = slotStart.getTime() > noticeThreshold.getTime();

    if (isPastNotice) {
      // Overlap rule: new_start < existing_end AND new_end > existing_start
      const hasOverlap = dayAppointments.some(
        (appt) => slotStart < appt.end && slotEnd > appt.start
      );

      if (!hasOverlap) {
        const startLabel = formatDisplayTime(slotStart);
        const endLabel = formatDisplayTime(slotEnd);
        slots.push({
          start: slotStart,
          end: slotEnd,
          startTimeStr: formatTimeString(slotStart),
          endTimeStr: formatTimeString(slotEnd),
          label: `${startLabel} – ${endLabel}`,
        });
      }
    }

    currentMs += intervalMs;
  }

  return {
    slots,
    isBlocked: false,
    isClosedDay: false,
  };
}
