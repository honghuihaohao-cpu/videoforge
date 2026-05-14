import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  title: z.string().min(1, "项目名称不能为空"),
  platform: z.enum(["bilibili", "douyin", "wechat"]).default("bilibili"),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const withVideoData = searchParams.get("withVideoData") === "true";

  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      workflowSteps: { select: { status: true } },
      videoData: withVideoData,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, platform, description } = parsed.data;
    const project = await db.project.create({
      data: {
        title: title.trim(),
        platform,
        description: description?.trim() || null,
      },
    });
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "创建失败" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  try {
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || "删除失败" }, { status: 500 });
  }
}
