import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Department, Position } from '@/models/Department';

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
