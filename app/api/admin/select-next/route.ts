import { NextResponse } from "next/server";
import { selectNext, selectNextRandom } from "@/lib/store";

type SelectNextPayload = {
  songId?: string;
  mode?: "manual" | "random";
};

export async function POST(request: Request) {
  const body = (await request.json()) as SelectNextPayload;

  if (body.mode === "random") {
    const result = selectNextRandom();
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, nextSongId: result.nextSongId });
  }

  if (!body.songId) {
    return NextResponse.json({ message: "songId is required for manual mode." }, { status: 400 });
  }

  const result = selectNext(body.songId);
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
