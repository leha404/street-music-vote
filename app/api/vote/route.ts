import { NextResponse } from "next/server";
import { addVotes } from "@/lib/store";

type VotePayload = {
  songIds?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as VotePayload;
  const songIds = Array.isArray(body.songIds) ? body.songIds : [];
  const result = addVotes(songIds);

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
