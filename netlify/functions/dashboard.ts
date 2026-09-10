import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getTodayDateString, formatTime12H } from './lib/mealHelper';
import { resolveNexusSession, formatSessionLabel } from './scan';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const selectedSession = resolveNexusSession({
      session: queryParams.session,
      day: queryParams.day,
      sessionType: queryParams.sessionType || queryParams.session_type
    });

    const supabase = getSupabaseClient();

    // 1. Total active participants
    const { count: totalActiveCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const totalStudents = totalActiveCount || 65;

    // 2. Query all fest collection records
    const { data: allFestRecords, error: recordsErr } = await supabase
      .from('meal_records')
      .select('id, student_id, meal_type, meal_date, scanned_at');

    if (recordsErr) {
      console.error('[Dashboard Records Error]', recordsErr);
      return jsonResponse(500, { error: recordsErr.message });
    }

    const allRecordsList = allFestRecords || [];

    // 3. Exact session counts — NO shared fallback that leaks counts across sessions!
    const d1SnackCount = allRecordsList.filter((r) => r.meal_type === 'Day 1 Snack').length;
    const d1MealCount = allRecordsList.filter((r) => r.meal_type === 'Day 1 Meal').length;
    const d2SnackCount = allRecordsList.filter((r) => r.meal_type === 'Day 2 Snack').length;
    const d3SnackCount = allRecordsList.filter((r) => r.meal_type === 'Day 3 Snack').length;

    // Active session metrics
    const getSessionCount = (sess: string) => {
      switch (sess) {
        case 'Day 1 Snack': return d1SnackCount;
        case 'Day 1 Meal': return d1MealCount;
        case 'Day 2 Snack': return d2SnackCount;
        case 'Day 3 Snack': return d3SnackCount;
        default: return d1SnackCount;
      }
    };

    const activeMealCount = getSessionCount(selectedSession);
    const rawPct = totalStudents > 0 ? (activeMealCount / totalStudents) * 100 : 0;
    const activeMealPercentage = Number(rawPct.toFixed(2));

    // 4. Recent scans with student details
    const { data: recentRaw } = await supabase
      .from('meal_records')
      .select(`
        id,
        meal_type,
        meal_date,
        scanned_at,
        student_id,
        students (
          id,
          name,
          roll_number,
          department,
          card_id
        )
      `)
      .order('scanned_at', { ascending: false })
      .limit(10);

    const formattedRecentScans = (recentRaw || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      student_name: r.students?.name || 'Participant',
      roll_number: r.students?.roll_number || '',
      department: r.students?.department || 'CSD',
      card_id: r.students?.card_id || '',
      meal_type: r.meal_type,
      session: r.meal_type,
      sessionLabel: formatSessionLabel(r.meal_type),
      scanned_at: r.scanned_at,
      formatted_time: formatTime12H(r.scanned_at)
    }));

    // 5. Participants yet to collect for active session
    const { data: allActiveStudents } = await supabase
      .from('students')
      .select('id, name, roll_number, department, year, card_id')
      .eq('active', true)
      .order('roll_number', { ascending: true });

    const collectedStudentIds = new Set(
      allRecordsList.filter((r) => r.meal_type === selectedSession).map((r) => r.student_id)
    );

    const missingStudents = (allActiveStudents || []).filter((s) => !collectedStudentIds.has(s.id));

    // 6. Department breakdown for active session
    const deptCountMap: Record<string, number> = {};
    if (allActiveStudents) {
      const studentDeptMap = new Map<number, string>();
      allActiveStudents.forEach((s) => studentDeptMap.set(s.id, s.department));

      allRecordsList
        .filter((r) => r.meal_type === selectedSession)
        .forEach((r) => {
          const dept = studentDeptMap.get(r.student_id) || 'CSD';
          deptCountMap[dept] = (deptCountMap[dept] || 0) + 1;
        });
    }

    const departmentBreakdown = Object.entries(deptCountMap).map(([department, count]) => ({
      department,
      count
    }));

    return jsonResponse(200, {
      date: getTodayDateString(),
      activeMeal: selectedSession,
      activeSession: selectedSession,
      activeSessionLabel: formatSessionLabel(selectedSession),
      totalStudents,
      activeMealCount,
      activeMealPercentage,
      dayCollections: {
        day1: { snack: d1SnackCount, meal: d1MealCount },
        day2: { snack: d2SnackCount },
        day3: { snack: d3SnackCount }
      },
      meals: {
        breakfast: 0,
        lunch: 0,
        dinner: d1MealCount,
        snack1: d1SnackCount,
        snack2: d2SnackCount,
        snack3: d3SnackCount
      },
      recentScans: formattedRecentScans,
      missingStudents,
      departmentBreakdown
    });
  } catch (err: any) {
    console.error('[Dashboard Function Error]', err);
    return jsonResponse(500, { error: err.message || 'Error generating dashboard metrics' });
  }
};
