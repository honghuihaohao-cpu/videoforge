import { describe, it, expect } from "vitest";
import { WORKFLOW_STEPS, getStepByNumber, getPhaseName, calculateStepScore } from "../workflow-engine";

describe("workflow-engine", () => {
  it("has exactly 10 steps", () => {
    expect(WORKFLOW_STEPS).toHaveLength(10);
  });

  it("each step has correct sequential numbering", () => {
    WORKFLOW_STEPS.forEach((step, i) => {
      expect(step.number).toBe(i + 1);
    });
  });

  it("all steps have AI evaluation enabled", () => {
    WORKFLOW_STEPS.forEach((step) => {
      expect(step.aiEvaluationEnabled).toBe(true);
      expect(step.aiPrompt).toBeTruthy();
    });
  });

  it("steps are grouped into 3 phases with correct counts", () => {
    const prepareSteps = WORKFLOW_STEPS.filter((s) => s.phase === "prepare");
    const produceSteps = WORKFLOW_STEPS.filter((s) => s.phase === "produce");
    const postSteps = WORKFLOW_STEPS.filter((s) => s.phase === "post");

    expect(prepareSteps).toHaveLength(3); // steps 1-3
    expect(produceSteps).toHaveLength(4); // steps 4-7
    expect(postSteps).toHaveLength(3);    // steps 8-10
  });

  it("getStepByNumber returns correct step", () => {
    const step = getStepByNumber(1);
    expect(step?.name).toBe("选题验证");
    expect(step?.phase).toBe("prepare");
  });

  it("getStepByNumber returns undefined for invalid number", () => {
    expect(getStepByNumber(0)).toBeUndefined();
    expect(getStepByNumber(11)).toBeUndefined();
  });

  it("getPhaseName returns Chinese names", () => {
    expect(getPhaseName("prepare")).toBe("准备期");
    expect(getPhaseName("produce")).toBe("制作期");
    expect(getPhaseName("post")).toBe("后期期");
  });

  it("calculateStepScore computes weighted score", () => {
    const gates = [
      { id: "a", label: "", description: "", type: "checkbox" as const, weight: 1.0 },
      { id: "b", label: "", description: "", type: "checkbox" as const, weight: 0.5 },
    ];
    const passed = new Set(["a"]);
    expect(calculateStepScore(gates, passed)).toBe(67); // 1.0 / 1.5 = 0.67 → 67
  });

  it("calculateStepScore returns 100 for empty gates", () => {
    expect(calculateStepScore([], new Set())).toBe(100);
  });

  it("every step has quality gates", () => {
    WORKFLOW_STEPS.forEach((step) => {
      expect(step.qualityGates.length).toBeGreaterThan(0);
    });
  });

  it("every step has a valid inputType", () => {
    const validTypes = ["text", "file", "link", "form", "data-table"];
    WORKFLOW_STEPS.forEach((step) => {
      expect(validTypes).toContain(step.inputType);
    });
  });
});
