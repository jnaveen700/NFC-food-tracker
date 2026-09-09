import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getCurrentMealType, getTodayDateString, formatTime12H } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const today = getTodayDateString();
    const activeMeal = await getCurrentMealType();
    const supabase = getSupabaseClient();

    // 1. Total active students
    const { count: totalActiveCount, error: countErr } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const totalStudents = totalActiveCount || 0;

    // 2. Fetch meal records for today to calculate session metrics
    const { data: todayRecords, error: recordsErr } = await supabase
      .from('meal_records')
      .select('id, student_id, meal_type, meal_date, scanned_at')
      .eq('meal_date', today);

    const allTodayRecords = todayRecords || [];

    const getMealCount = (mType: string) => {
      return allTodayRecords.filter((r) => r.meal_type === mType).length;
    };

    const bCount = getMealCount('Breakfast');
    const lCount = getMealCount('Lunch');
    const dCount = getMealCount('Dinner');
    const s1Count = getMealCount('Snack 1');
    const s2Count = getMealCount('Snack 2');
    const s3Count = getMealCount('Snack 3');

    const activeMealCount = getMealCount(activeMeal);
    const activeMealPercentage = totalStudents > 0 ? Math.round((activeMealCount / totalStudents) * 100) : 0;

    // 3. Recent 5 scans today
    const { data: recentRaw, error: recentErr } = await supabase
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
      .eq('meal_date', today)
      .order('scanned_at', { ascending: false })
      .limit(5);

    const formattedRecentScans = (recentRaw || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      student_name: r.students?.name || 'Unknown',
      roll_number: r.students?.roll_number || '',
      department: r.students?.department || '',
      card_id: r.students?.card_id || '',
      meal_type: r.meal_type,
      scanned_at: r.scanned_at,
      formatted_time: formatTime12H(r.scanned_at)
    }));

    // 4. Missing students for active meal today
    // Get all active students
    const { data: allActiveStudents } = await supabase
      .from('students')
      .select('id, name, roll_number, department, year, card_id')
      .eq('active', true)
      .order('roll_number', { ascending: true });

    // Filter out students who already ate active meal today
    const studentIdsWhoAte = new Set(
      allTodayRecords.filter((r) => r.meal_type === activeMeal).map((r) => r.student_id)
    );

    const missingStudents = (allActiveStudents || [])
      .filter((s) => !studentIdsWhoAte.has(s.id))
      .slice(0, 15);

    // 5. Department breakdown for active meal today
    const deptCountMap: Record<string, number> = {};
    if (allActiveStudents) {
      const studentDeptMap = new Map<number, string>();
      allActiveStudents.forEach((s) => studentDeptMap.set(s.id, s.department));

      allTodayRecords
        .filter((r) => r.meal_type === activeMeal)
        .forEach((r) => {
          const dept = studentDeptMap.get(r.student_id) || 'Other';
          deptCountMap[dept] = (deptCountMap[dept] || 0) + 1;
        });
    }

    const departmentBreakdown = Object.entries(deptCountMap).map(([department, count]) => ({
      department,
      count
    }));

    return jsonResponse(200, {
      date: today,
      activeMeal,
      totalStudents,
      activeMealCount,
      activeMealPercentage,
      meals: {
        breakfast: bCount,
        lunch: lCount,
        dinner: dCount,
        snack1: s1Count,
        snack2: s2Count,
        snack3: s3Count
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
