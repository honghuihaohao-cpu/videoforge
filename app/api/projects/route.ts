import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  const body = await req.json();
  const { title, platform, description } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "项目名称不能为空" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      title: title.trim(),
      platform: platform || "bilibili",
      description: description?.trim() || null,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
