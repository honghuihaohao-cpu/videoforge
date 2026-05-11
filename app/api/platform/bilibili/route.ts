import { NextResponse } from "next/server";
import { fetchVideoStat, extractBilibiliVideoId } from "@/lib/platform/bilibili";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const projectId = searchParams.get("projectId");

  if (!videoId) {
    return NextResponse.json({ error: "缺少 videoId 参数" }, { status: 400 });
  }

  const id = extractBilibiliVideoId(videoId);
  if (!id) {
    return NextResponse.json({ error: "无法识别视频 ID，请提供 BV 号或 av 号" }, { status: 400 });
  }

  const stat = await fetchVideoStat(videoId);
  if (!stat) {
    return NextResponse.json({ error: "获取数据失败，请检查视频 ID 是否正确" }, { status: 404 });
  }

  // Save to project if projectId provided
  if (projectId) {
    await db.videoData.upsert({
      where: { projectId },
      update: {
        platformVideoId: id,
        views: stat.view,
        likes: stat.like,
        comments: stat.reply,
        shares: stat.share,
        favorites: stat.favorite,
        coins: stat.coin,
        syncedAt: new Date(),
      },
      create: {
        projectId,
        platformVideoId: id,
        views: stat.view,
        likes: stat.like,
        comments: stat.reply,
        shares: stat.share,
        favorites: stat.favorite,
        coins: stat.coin,
        syncedAt: new Date(),
      },
    });
  }

  return NextResponse.json(stat);
}
