import { NextResponse } from "next/server";
import { advanceRound } from "@/lib/store";

export async function POST() {
  const result = advanceRound();
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
