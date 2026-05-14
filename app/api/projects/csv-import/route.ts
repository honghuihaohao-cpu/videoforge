import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, rows }: { projectId: string; rows: Record<string, string>[] } = body;

    if (!projectId || !rows?.length) {
      return NextResponse.json({ error: "缺少 projectId 或 rows" }, { status: 400 });
    }

    // Map CSV columns to VideoData fields
    const keyMap: Record<string, string> = {
      "播放量": "views", "views": "views",
      "点赞": "likes", "likes": "likes",
      "评论": "comments", "comments": "comments",
      "分享": "shares", "shares": "shares",
      "收藏": "favorites", "favorites": "favorites",
      "投币": "coins", "coins": "coins",
    };

    let imported = 0;
    for (const row of rows) {
      const data: Record<string, number> = {};
      for (const [key, value] of Object.entries(row)) {
        const mapped = keyMap[key.toLowerCase()] || keyMap[key];
        if (mapped) {
          data[mapped] = (data[mapped] || 0) + (parseInt(value) || 0);
        }
      }

      if (Object.keys(data).length > 0) {
        await db.videoData.upsert({
          where: { projectId },
          update: { ...data, syncedAt: new Date() },
          create: { projectId, ...data, syncedAt: new Date() },
        });
        imported++;
      }
    }

    return NextResponse.json({ success: true, imported });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "导入失败" }, { status: 500 });
  }
}
