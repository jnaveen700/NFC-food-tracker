import { ScanResponse, DashboardData, Student, MealRecord, AppSettings, MealType } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('nfc_mess_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMessage = `HTTP error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.message || errData.error) {
        errorMessage = errData.message || errData.error;
      }
      // If error payload has scan result status, throw object or return
      if (errData.status) {
        return errData as T;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return fetchJson<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Core Scan
  scanCard: async (cardId: string, session?: string): Promise<ScanResponse> => {
    return fetchJson<ScanResponse>('/scan', {
      method: 'POST',
      body: JSON.stringify({ cardId, session, mealTypeOverride: session })
    });
  },

  // Dashboard
  getDashboard: async (session?: string): Promise<DashboardData> => {
    const query = session ? `?session=${encodeURIComponent(session)}` : '';
    return fetchJson<DashboardData>(`/dashboard${query}`);
  },

  // Students
  getStudents: async (params?: { search?: string; department?: string; year?: number; active?: number }): Promise<Student[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.year) query.append('year', String(params.year));
    if (params?.active !== undefined) query.append('active', String(params.active));
    return fetchJson<Student[]>(`/students?${query.toString()}`);
  },

  createStudent: async (student: Partial<Student>): Promise<Student> => {
    return fetchJson<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(student)
    });
  },

  getStudentDetail: async (id: number): Promise<{ student: Student; history: MealRecord[] }> => {
    return fetchJson<{ student: Student; history: MealRecord[] }>(`/students/${id}`);
  },

  updateStudent: async (id: number, data: Partial<Student>): Promise<Student> => {
    return fetchJson<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteStudent: async (id: number): Promise<{ message: string }> => {
    return fetchJson<{ message: string }>(`/students/${id}`, {
      method: 'DELETE'
    });
  },

  importStudents: async (students: Partial<Student>[]): Promise<{ message: string; inserted: number; skipped: number }> => {
    return fetchJson<{ message: string; inserted: number; skipped: number }>('/students/import', {
      method: 'POST',
      body: JSON.stringify({ students })
    });
  },

  // Meals & History
  getMeals: async (params?: { date?: string; meal_type?: string; session?: string; search?: string; limit?: number; offset?: number }): Promise<{
    records: MealRecord[];
    total: number;
    limit: number;
    offset: number;
    date: string;
    mealType: string;
  }> => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    const sess = params?.session || params?.meal_type;
    if (sess) query.append('meal_type', sess);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));
    return fetchJson(`/meals?${query.toString()}`);
  },

  deleteMealRecord: async (params: { recordId?: number; studentId?: number; mealType?: string; session?: string; mealDate?: string }): Promise<{ success: boolean; message: string }> => {
    const query = new URLSearchParams();
    if (params.recordId) query.append('record_id', String(params.recordId));
    if (params.studentId) query.append('student_id', String(params.studentId));
    const sess = params.session || params.mealType;
    if (sess) query.append('meal_type', sess);
    if (params.mealDate) query.append('meal_date', params.mealDate);
    return fetchJson<{ success: boolean; message: string }>(`/meals?${query.toString()}`, {
      method: 'DELETE'
    });
  },

  // Reports
  getReports: async (params?: { startDate?: string; endDate?: string; department?: string; mealType?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.department) query.append('department', params.department);
    if (params?.mealType) query.append('mealType', params.mealType);
    return fetchJson(`/reports?${query.toString()}`);
  },

  getExportCsvUrl: (date: string = 'today') => {
    return `${API_BASE}/reports/export?date=${date}`;
  },

  // Settings
  getSettings: async (): Promise<AppSettings> => {
    return fetchJson<AppSettings>('/settings');
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<{ message: string; settings: AppSettings }> => {
    return fetchJson<{ message: string; settings: AppSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  reseedData: async (): Promise<{ message: string }> => {
    return fetchJson<{ message: string }>('/settings/reseed', {
      method: 'POST'
    });
  }
};
