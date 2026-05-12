import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await context.params;
    const employee = await Employee.findById(params.id)
      .populate('departmentId', 'name')
      .populate('positionId', 'name');
      
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await context.params;
    const body = await request.json();

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
    const employee = await Employee.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await context.params;
    const employee = await Employee.findByIdAndDelete(params.id);
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
