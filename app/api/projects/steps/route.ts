import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const saveStepSchema = z.object({
  projectId: z.string().min(1),
  stepNumber: z.number().int().min(1).max(10),
  stepName: z.string().optional(),
  status: z.enum(["pending", "in_progress", "passed", "failed"]).optional(),
  inputData: z.string().optional(),
  aiFeedback: z.string().optional(),
  userNotes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = saveStepSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.flatten() }, { status: 400 });
    }

    const { projectId, stepNumber, stepName, status, inputData, aiFeedback, userNotes } = parsed.data;

    const existing = await db.workflowStep.findFirst({
      where: { projectId, stepNumber },
    });

    const data = {
      status: status || "in_progress",
      inputData: inputData || null,
      aiFeedback: aiFeedback || null,
      userNotes: userNotes || null,
      passedAt: status === "passed" ? new Date() : existing?.passedAt || null,
    };

    let step;
    if (existing) {
      step = await db.workflowStep.update({ where: { id: existing.id }, data });
    } else {
      step = await db.workflowStep.create({
        data: { projectId, stepNumber, stepName: stepName || `Step ${stepNumber}`, ...data },
      });
    }

    // Update project status based on step completion
    if (status === "passed" && stepNumber === 3) {
      await db.project.update({ where: { id: projectId }, data: { status: "scripting" } });
    } else if (status === "passed" && stepNumber === 7) {
      await db.project.update({ where: { id: projectId }, data: { status: "producing" } });
    } else if (status === "passed" && stepNumber === 10) {
      await db.project.update({ where: { id: projectId }, data: { status: "published" } });
    }

    // Save AI analysis if present
    if (aiFeedback) {
      const scoreMatch = aiFeedback.match(/【综合评分】\s*(\d+)/);
      await db.analysis.create({
        data: {
          projectId,
          type: stepNumber <= 4 ? "script" : stepNumber === 10 ? "performance" : "video",
          content: aiFeedback,
          score: scoreMatch ? parseInt(scoreMatch[1]) : null,
        },
      });

      // Auto-extract improvement suggestions from AI feedback
      const sugRegex = /\d+\.\s*\[([^\]]+)\]\s*(.+)/g;
      let sugMatch;
      while ((sugMatch = sugRegex.exec(aiFeedback)) !== null) {
        await db.improvementLog.create({
          data: {
            projectId,
            category: sugMatch[1].trim(),
            suggestion: sugMatch[2].trim(),
          },
        });
      }
    }

    return NextResponse.json(step);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "保存失败" }, { status: 500 });
  }
}
