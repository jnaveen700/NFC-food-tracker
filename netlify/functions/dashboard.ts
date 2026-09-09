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

    // 1. Total active participants
    const { count: totalActiveCount, error: countErr } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const totalStudents = totalActiveCount || 0;

    // 2. Dates for 3-day fest schedule:
    // Day 3 = today, Day 2 = yesterday, Day 1 = 2 days ago (or custom date param)
    const now = new Date();
    const d3Date = getTodayDateString(now);
    const d2Obj = new Date(now);
    d2Obj.setDate(d2Obj.getDate() - 1);
    const d2Date = getTodayDateString(d2Obj);
    const d1Obj = new Date(now);
    d1Obj.setDate(d1Obj.getDate() - 2);
    const d1Date = getTodayDateString(d1Obj);

    // Fetch meal records for past days and today to calculate 3-day metrics
    const { data: allFestRecords } = await supabase
      .from('meal_records')
      .select('id, student_id, meal_type, meal_date, scanned_at');

    const allRecordsList = allFestRecords || [];
    const allTodayRecords = allRecordsList.filter((r) => r.meal_date === today);

    const getMealCount = (mType: string) => {
      return allTodayRecords.filter((r) => r.meal_type === mType).length;
    };

    // Calculate real counts for Day 1, Day 2, Day 3
    // Day 1: Snack 1 + Dinner (Snack + Meal) on d1Date (or today if records created today)
    const day1Records = allRecordsList.filter((r) => r.meal_date === d1Date);
    const day2Records = allRecordsList.filter((r) => r.meal_date === d2Date);
    const day3Records = allRecordsList.filter((r) => r.meal_date === d3Date);

    // If fest records are logged today for testing/live, fallback to today's records so live scans immediately reflect
    const d1SnackCount = day1Records.filter((r) => r.meal_type === 'Snack 1').length || allTodayRecords.filter((r) => r.meal_type === 'Snack 1').length;
    const d1MealCount = day1Records.filter((r) => r.meal_type === 'Dinner').length || allTodayRecords.filter((r) => r.meal_type === 'Dinner').length;
    const d2SnackCount = day2Records.filter((r) => r.meal_type === 'Snack 1').length || allTodayRecords.filter((r) => r.meal_type === 'Snack 1').length;
    const d3SnackCount = day3Records.filter((r) => r.meal_type === 'Snack 1').length || allTodayRecords.filter((r) => r.meal_type === 'Snack 1').length;

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
      dayCollections: {
        day1: { snack: d1SnackCount, meal: d1MealCount },
        day2: { snack: d2SnackCount },
        day3: { snack: d3SnackCount }
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
