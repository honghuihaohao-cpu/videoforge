import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { projectId, stepNumber, stepName, status, inputData, aiFeedback, userNotes } = body;

  if (!projectId || stepNumber == null) {
    return NextResponse.json({ error: "缺少 projectId 或 stepNumber" }, { status: 400 });
  }

  // Check if step record exists
  const existing = await db.workflowStep.findFirst({
    where: { projectId, stepNumber },
  });

  const data: any = {
    status: status || "in_progress",
    inputData: inputData || null,
    aiFeedback: aiFeedback || null,
    userNotes: userNotes || null,
    passedAt: status === "passed" ? new Date() : existing?.passedAt || null,
  };

  if (existing) {
    const step = await db.workflowStep.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json(step);
  }

  const step = await db.workflowStep.create({
    data: {
      projectId,
      stepNumber,
      stepName: stepName || `Step ${stepNumber}`,
      ...data,
    },
  });

  // Update project status based on step
  if (status === "passed" && stepNumber === 3) {
    await db.project.update({ where: { id: projectId }, data: { status: "scripting" } });
  } else if (status === "passed" && stepNumber === 7) {
    await db.project.update({ where: { id: projectId }, data: { status: "producing" } });
  } else if (status === "passed" && stepNumber === 10) {
    await db.project.update({ where: { id: projectId }, data: { status: "published" } });
  }

  // Save AI analysis if present
  if (aiFeedback) {
    await db.analysis.create({
      data: {
        projectId,
        type: stepNumber <= 4 ? "script" : stepNumber === 10 ? "performance" : "video",
        content: aiFeedback,
        score: aiFeedback.match(/【综合评分】\s*(\d+)/)?.[1] ? parseInt(aiFeedback.match(/【综合评分】\s*(\d+)/)![1]) : null,
      },
    });
  }

  return NextResponse.json(step);
}
