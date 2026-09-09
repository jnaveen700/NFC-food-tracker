export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack 1' | 'Snack 2' | 'Snack 3';

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
  meal_type: MealType;
  meal_date: string;
  scanned_at: string;
  student_name?: string;
  roll_number?: string;
  department?: string;
  card_id?: string;
  formatted_time?: string;
}

export type ScanStatusType = 'recorded' | 'already_recorded' | 'not_found' | 'inactive' | 'error';

export interface ScanResponse {
  status: ScanStatusType;
  message: string;
  recordId?: number;
  student?: Student;
  mealType?: MealType;
  mealDate?: string;
  scannedAt?: string;
  formattedTime?: string;
  cardId?: string;
  error?: string;
}

export interface DayCollections {
  snack: { count: number; percentage: number };
  meal?: { count: number; percentage: number };
}

export interface DashboardData {
  date: string;
  activeMeal: MealType;
  activeDay?: EventDay;
  totalStudents: number;
  activeMealCount: number;
  activeMealPercentage: number;
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
  dayCollections?: {
    day1: { snack: number; meal: number };
    day2: { snack: number };
    day3: { snack: number };
  };
}

export interface AppSettings {
  breakfast_start: string;
  breakfast_end: string;
  lunch_start: string;
  lunch_end: string;
  dinner_start: string;
  dinner_end: string;
  mess_name: string;
  total_capacity: string;
  auto_dismiss_overlay: string; // 'true' or 'false'
  current_calculated_meal?: MealType;
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
