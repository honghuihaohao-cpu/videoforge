import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { projectId, views, likes, comments, shares, favorites, coins, retentionData, audienceData } = body;

  if (!projectId) {
    return NextResponse.json({ error: "缺少 projectId" }, { status: 400 });
  }

  const data = await db.videoData.upsert({
    where: { projectId },
    update: {
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      favorites: favorites || 0,
      coins: coins || 0,
      retentionData: retentionData || null,
      audienceData: audienceData || null,
      syncedAt: new Date(),
    },
    create: {
      projectId,
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      favorites: favorites || 0,
      coins: coins || 0,
      retentionData: retentionData || null,
      audienceData: audienceData || null,
      syncedAt: new Date(),
    },
  });

  return NextResponse.json(data);
}
