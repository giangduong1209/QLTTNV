import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export const dynamic = 'force-dynamic';

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  employeeCode: 'employeeCode',
  fullName: 'fullName',
  joinDate: 'joinDate',
  baseSalary: 'baseSalary',
  createdAt: 'createdAt',
};

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const status = searchParams.get('status') || '';
    const educationLevel = searchParams.get('educationLevel') || '';
    const sortBy = ALLOWED_SORT_FIELDS[searchParams.get('sortBy') || ''] || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    let filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (departmentId) {
      filter.departmentId = departmentId;
    }
    if (status) {
      filter.status = status;
    }
    if (educationLevel) {
      filter.educationLevel = educationLevel;
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('departmentId', 'name')
        .populate('positionId', 'name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate age (must be 18+ at join date)
    if (body.dateOfBirth && body.joinDate) {
      const dob = new Date(body.dateOfBirth);
      const join = new Date(body.joinDate);
      const ageAtJoin = new Date(dob);
      ageAtJoin.setFullYear(ageAtJoin.getFullYear() + 18);
      
      if (join < ageAtJoin) {
        return NextResponse.json(
          { error: 'Nhân viên phải từ 18 tuổi trở lên tính đến ngày vào làm.' },
          { status: 400 }
        );
      }
    }
    
    const newEmployee = await Employee.create(body);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate field value entered' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
