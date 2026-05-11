import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    // In a real app, you'd check if session.user.role === 'Admin'
    // For now, let's just connect and return users
    
    await dbConnect();
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
