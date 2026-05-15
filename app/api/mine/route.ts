import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchBilibiliVideoInfo, fetchBilibiliComments, analyzeComments, extractBvid } from "@/lib/comment-miner";

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();
    if (!videoUrl) return NextResponse.json({ error: "请输入B站视频链接" }, { status: 400 });

    const bvid = extractBvid(videoUrl);
    if (!bvid) return NextResponse.json({ error: "无法识别BV号" }, { status: 400 });

    const info = await fetchBilibiliVideoInfo(bvid);
    const allComments: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const { comments } = await fetchBilibiliComments(String(info.aid), page);
      allComments.push(...comments);
      if (comments.length < 20) break;
    }
    if (!allComments.length) return NextResponse.json({ error: "暂无评论" }, { status: 404 });

    const report = await analyzeComments(allComments, info.title);
    return NextResponse.json(report);
  } catch (e: any) {
    const msg = e?.message || "分析失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
