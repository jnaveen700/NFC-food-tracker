export type NexusSession = 'Day 1 Snack' | 'Day 1 Meal' | 'Day 2 Snack' | 'Day 3 Snack';

export type MealType = NexusSession | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack 1' | 'Snack 2' | 'Snack 3' | string;

export type EventDay = 'Day 1' | 'Day 2' | 'Day 3';

export interface Student {
  id: number;
  roll_number: string;
  name: string;
  card_id: string;
  department: string;
  year: number;
  active: number; // 1 or 0
  created_at?: string;
}

export interface MealRecord {
  id: number;
  student_id: number;
  meal_type: string;
  meal_date: string;
  scanned_at: string;
  student_name?: string;
  roll_number?: string;
  department?: string;
  card_id?: string;
  formatted_time?: string;
  session?: string;
}

export type ScanStatusType = 'recorded' | 'already_recorded' | 'not_found' | 'inactive' | 'error';

export interface ScanResponse {
  status: ScanStatusType;
  message: string;
  recordId?: number;
  student?: Student;
  mealType?: string;
  session?: string;
  sessionLabel?: string;
  mealDate?: string;
  scannedAt?: string;
  formattedTime?: string;
  cardId?: string;
  error?: string;
}

export interface DayCollections {
  day1: { snack: number; meal: number };
  day2: { snack: number };
  day3: { snack: number };
}

export interface DashboardData {
  date: string;
  activeMeal: string;
  activeDay?: EventDay;
  totalStudents: number;
  activeMealCount: number;
  activeMealPercentage: number;
  dayCollections: DayCollections;
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack1: number;
    snack2: number;
    snack3: number;
  };
  recentScans: MealRecord[];
  missingStudents: Student[];
  departmentBreakdown: { department: string; count: number }[];
}

export interface AppSettings {
  snack_start?: string;
  snack_end?: string;
  meal_start?: string;
  meal_end?: string;
  breakfast_start?: string;
  breakfast_end?: string;
  lunch_start?: string;
  lunch_end?: string;
  dinner_start?: string;
  dinner_end?: string;
  mess_name: string;
  total_capacity: string;
  auto_dismiss_overlay?: string;
  current_calculated_meal?: string;
  current_day?: EventDay;
  [key: string]: string | undefined;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
