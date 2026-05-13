import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Department, Position } from '@/models/Department';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const [departments, positions] = await Promise.all([
      Department.find({}).sort({ name: 1 }),
      Position.find({}).sort({ name: 1 }),
    ]);
    return NextResponse.json({ departments, positions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
