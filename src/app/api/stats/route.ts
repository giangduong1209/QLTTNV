import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { Department } from '@/models/Department';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // ── 1. KPI cơ bản ────────────────────────────────────────────────────────
    const [total, active, resigned] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Đang làm việc' }),
      Employee.countDocuments({ status: 'Đã nghỉ' }),
    ]);

    // ── 2. Nhân viên theo phòng ban ──────────────────────────────────────────
    const byDepartment = await Employee.aggregate([
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
    ]);

    // ── 3. Phân bổ giới tính ─────────────────────────────────────────────────
    const genderAgg = await Employee.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);
    const genderMap: Record<string, number> = {};
    genderAgg.forEach((g: any) => { genderMap[g._id] = g.count; });

    // ── 4. Phân bổ loại hợp đồng ─────────────────────────────────────────────
    const contractAgg = await Employee.aggregate([
      { $group: { _id: '$contractType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 5. Phân bổ trình độ học vấn ──────────────────────────────────────────
    const educationAgg = await Employee.aggregate([
      { $group: { _id: '$educationLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 6. Tăng trưởng nhân viên theo năm gia nhập ──────────────────────────
    const growthAgg = await Employee.aggregate([
      {
        $group: {
          _id: { $year: '$joinDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    // Tính tích lũy
    let cumulative = 0;
    const growthData = growthAgg.map((g: any) => {
      cumulative += g.count;
      return { year: String(g._id), newHires: g.count, total: cumulative };
    });

    // ── 7. Phân bổ lương ─────────────────────────────────────────────────────
    const salaryBrackets = [
      { label: '< 8M', min: 0, max: 8_000_000 },
      { label: '8-12M', min: 8_000_000, max: 12_000_000 },
      { label: '12-20M', min: 12_000_000, max: 20_000_000 },
      { label: '20-35M', min: 20_000_000, max: 35_000_000 },
      { label: '> 35M', min: 35_000_000, max: Infinity },
    ];
    const salaryDist = await Promise.all(
      salaryBrackets.map(async (b) => ({
        label: b.label,
        count: await Employee.countDocuments({
          baseSalary: { $gte: b.min, ...(b.max !== Infinity ? { $lt: b.max } : {}) },
          status: 'Đang làm việc',
        }),
      }))
    );

    // ── 8. Nhân viên gia nhập gần đây ────────────────────────────────────────
    const recentHires = await Employee.find({ status: 'Đang làm việc' })
      .populate('departmentId', 'name')
      .populate('positionId', 'name')
      .sort({ joinDate: -1 })
      .limit(8)
      .select('employeeCode fullName gender joinDate baseSalary departmentId positionId');

    // ── 9. Lương trung bình theo phòng ban ───────────────────────────────────
    const avgSalaryByDept = await Employee.aggregate([
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
    ]);

    return NextResponse.json({
      kpi: { total, active, resigned, newThisMonth: 0 },
      byDepartment,
      gender: {
        Nam: genderMap['Nam'] || 0,
        Nữ: genderMap['Nữ'] || 0,
        Khác: genderMap['Khác'] || 0,
      },
      contractTypes: contractAgg,
      educationLevels: educationAgg,
      growthData,
      salaryDistribution: salaryDist,
      recentHires,
      avgSalaryByDept,
    });
  } catch (error: any) {
    console.error('[STATS ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
