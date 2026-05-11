import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { WorkflowStepPage } from "@/components/workflow/workflow-step-page";

export const dynamic = "force-dynamic";

export default async function WorkflowStepDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { step } = await params;
  const { projectId } = await searchParams;

  const stepNum = parseInt(step, 10);
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 10) {
    redirect("/workflow");
  }

  let project = null;
  let stepRecord = null;

  if (projectId) {
    project = await db.project.findUnique({
      where: { id: projectId },
      include: { workflowSteps: true },
    });

    if (project) {
      stepRecord = project.workflowSteps.find((s) => s.stepNumber === stepNum) || null;
    }
  }

  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <WorkflowStepPage
      stepNumber={stepNum}
      project={project}
      stepRecord={stepRecord}
      allProjects={projects}
    />
  );
}
