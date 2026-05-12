import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import '@/models/Department';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallelize all main data fetching tasks
    const [
      kpiCounts,
      byDepartment,
      genderAgg,
      contractAgg,
      educationAgg,
      growthAgg,
      salaryDistAgg,
      avgSalaryByDept,
      recentHires
    ] = await Promise.all([
      // 1. KPI Counts
      Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: 'Đang làm việc' }),
        Employee.countDocuments({ status: 'Đã nghỉ' }),
        Employee.countDocuments({ joinDate: { $gte: firstDayOfMonth } }),
      ]),

      // 2. Department Stats
      Employee.aggregate([
        {
          $group: {
            _id: '$departmentId',
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Đang làm việc'] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        {
          $project: {
            name: '$dept.name',
            code: '$dept.code',
            total: 1,
            active: 1,
          },
        },
        { $sort: { total: -1 } },
      ]),

      // 3. Gender Distribution
      Employee.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),

      // 4. Contract Types
      Employee.aggregate([
        { $group: { _id: '$contractType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 5. Education Levels
      Employee.aggregate([
        { $group: { _id: '$educationLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 6. Growth Data
      Employee.aggregate([
        {
          $group: {
            _id: { $year: '$joinDate' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 7. Salary Distribution (using bucket for performance)
      Employee.aggregate([
        { $match: { status: 'Đang làm việc' } },
        {
          $bucket: {
            groupBy: '$baseSalary',
            boundaries: [0, 8000000, 12000000, 20000000, 35000000],
            default: 'High',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // 8. Average Salary by Dept
      Employee.aggregate([
        { $match: { status: 'Đang làm việc' } },
        {
          $group: {
            _id: '$departmentId',
            avgSalary: { $avg: '$baseSalary' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        {
          $project: {
            name: '$dept.name',
            avgSalary: { $round: ['$avgSalary', 0] },
            count: 1,
          },
        },
        { $sort: { avgSalary: -1 } },
      ]),

      // 9. Recent Hires
      Employee.find({ status: 'Đang làm việc' })
        .populate('departmentId', 'name')
        .populate('positionId', 'name')
        .sort({ joinDate: -1 })
        .limit(8)
        .select('employeeCode fullName gender joinDate baseSalary departmentId positionId'),
    ]);

    // Format results
    const [total, active, resigned, newThisMonth] = kpiCounts;
    
    const genderMap: Record<string, number> = {};
    genderAgg.forEach((g: any) => { genderMap[g._id] = g.count; });

    let cumulative = 0;
    const growthData = growthAgg.map((g: any) => {
      cumulative += g.count;
      return { year: String(g._id), newHires: g.count, total: cumulative };
    });

    const salaryMap: Record<string, string> = {
      '0': '< 8M',
      '8000000': '8-12M',
      '12000000': '12-20M',
      '20000000': '20-35M',
      'High': '> 35M'
    };

    const salaryDistribution = Object.keys(salaryMap).map(key => {
      const match = salaryDistAgg.find((b: any) => String(b._id) === key);
      return {
        label: salaryMap[key],
        count: match ? match.count : 0
      };
    });

    return NextResponse.json({
      kpi: { total, active, resigned, newThisMonth },
      byDepartment,
      gender: {
        Nam: genderMap['Nam'] || 0,
        Nữ: genderMap['Nữ'] || 0,
        Khác: genderMap['Khác'] || 0,
      },
      contractTypes: contractAgg,
      educationLevels: educationAgg,
      growthData,
      salaryDistribution,
      recentHires,
      avgSalaryByDept,
    });
  } catch (error: any) {
    console.error('[STATS ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

