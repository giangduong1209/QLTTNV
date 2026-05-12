import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Department, Position } from '@/models/Department';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('GET /api/departments called');
  try {
    await dbConnect();
    console.log('Database connected in departments API');
    const [departments, positions] = await Promise.all([
      Department.find({}).sort({ name: 1 }),
      Position.find({}).sort({ name: 1 }),
    ]);
    console.log(`Found ${departments.length} departments and ${positions.length} positions`);
    return NextResponse.json({ departments, positions });
  } catch (error: any) {
    console.error('Error in GET /api/departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
