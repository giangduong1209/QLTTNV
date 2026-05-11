import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Department, Position } from '@/models/Department';
import { seedDepartments } from '@/lib/seed-data';

export async function GET() {
  try {
    await dbConnect();
    const departments = await Department.find({});
    const positions = await Position.find({});
    
    return NextResponse.json({ departments, positions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDepartments();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
