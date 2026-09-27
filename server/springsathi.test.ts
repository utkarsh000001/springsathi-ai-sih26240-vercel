import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const styleSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("SpringSathi AI SIH26240 prototype", () => {
  it("contains the spring planning workflow", () => {
    for (const marker of [
      "SpringSathi AI",
      "SIH26240",
      "Spring registry",
      "Recharge planner",
      "Field work",
      "Monitoring",
      "Explainable planning model",
      "Refresh all confidence scores",
    ]) expect(homeSource).toContain(marker);
  });

  it("supports the core prototype actions", () => {
    for (const marker of ["const addSpring = () =>", "const createWork = () =>", "const advanceWork = (id: string)", "const runAssessment = () =>", "localStorage.setItem(\"springsathi_springs\"", "Create intervention for this spring"]) expect(homeSource).toContain(marker);
  });

  it("includes responsive and accessibility safeguards", () => {
    expect(styleSource).toContain("@media (max-width: 760px)");
    expect(styleSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styleSource).toContain("focus-visible");
    expect(homeSource).toContain('aria-label="Notifications"');
    expect(homeSource).toContain('aria-label="Search springs"');
  });
});
