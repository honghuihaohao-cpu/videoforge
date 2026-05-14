import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "缺少 projectId" }, { status: 400 });

  const improvements = await db.improvementLog.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(improvements);
}

const createSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().optional(),
  suggestion: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
    }

    const improvement = await db.improvementLog.create({
      data: {
        projectId: parsed.data.projectId,
        category: parsed.data.category || "other",
        suggestion: parsed.data.suggestion,
      },
    });
    return NextResponse.json(improvement);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "创建失败" }, { status: 500 });
  }
}

const feedbackSchema = z.object({
  id: z.string().min(1),
  wasHelpful: z.boolean(),
});

export async function PATCH(req: Request) {
  try {
    const raw = await req.json();
    const parsed = feedbackSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
    }

    const improvement = await db.improvementLog.update({
      where: { id: parsed.data.id },
      data: { wasHelpful: parsed.data.wasHelpful, appliedAt: new Date() },
    });
    return NextResponse.json(improvement);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "建议不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || "更新失败" }, { status: 500 });
  }
}
