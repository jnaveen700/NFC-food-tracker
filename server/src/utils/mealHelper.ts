import { db } from '../db';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack 1' | 'Snack 2' | 'Snack 3';

export function getSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settingsMap: Record<string, string> = {};
  for (const r of rows) {
    settingsMap[r.key] = r.value;
  }
  return settingsMap;
}

export function getCurrentMealType(customTime?: Date): MealType {
  const settings = getSettings();
  const date = customTime || new Date();
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const parseTimeMinutes = (timeStr: string, defaultMinutes: number) => {
    if (!timeStr) return defaultMinutes;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const bStart = parseTimeMinutes(settings.breakfast_start, 7 * 60);
  const bEnd = parseTimeMinutes(settings.breakfast_end, 10 * 60);

  const s1Start = parseTimeMinutes(settings.snack1_start, 10 * 60 + 30);
  const s1End = parseTimeMinutes(settings.snack1_end, 11 * 60 + 30);
  
  const lStart = parseTimeMinutes(settings.lunch_start, 12 * 60);
  const lEnd = parseTimeMinutes(settings.lunch_end, 15 * 60);

  const s2Start = parseTimeMinutes(settings.snack2_start, 16 * 60);
  const s2End = parseTimeMinutes(settings.snack2_end, 17 * 60 + 30);
  
  const dStart = parseTimeMinutes(settings.dinner_start, 19 * 60);
  const dEnd = parseTimeMinutes(settings.dinner_end, 22 * 60);

  const s3Start = parseTimeMinutes(settings.snack3_start, 22 * 60);
  const s3End = parseTimeMinutes(settings.snack3_end, 23 * 60 + 30);

  // Range checks
  if (currentMinutes >= bStart && currentMinutes <= bEnd) return 'Breakfast';
  if (currentMinutes >= s1Start && currentMinutes <= s1End) return 'Snack 1';
  if (currentMinutes >= lStart && currentMinutes <= lEnd) return 'Lunch';
  if (currentMinutes >= s2Start && currentMinutes <= s2End) return 'Snack 2';
  if (currentMinutes >= dStart && currentMinutes <= dEnd) return 'Dinner';
  if (currentMinutes >= s3Start && currentMinutes <= s3End) return 'Snack 3';

  // Fallback map
  if (currentMinutes < bStart) return 'Breakfast';
  if (currentMinutes > bEnd && currentMinutes < lStart) return 'Snack 1';
  if (currentMinutes > lEnd && currentMinutes < dStart) return 'Snack 2';
  if (currentMinutes > dEnd) return 'Snack 3';
  
  return 'Breakfast';
}

export function getTodayDateString(customDate?: Date): string {
  const d = customDate || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime12H(dateInput?: Date | string): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}
