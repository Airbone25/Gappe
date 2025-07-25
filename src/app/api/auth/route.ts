import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  const { email, username, gender, dob } = body;

  try {
    const user = await User.create({ email, username, gender, dob });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
