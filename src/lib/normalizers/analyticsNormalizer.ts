import { NormalizedProject } from "./projectNormalizer";

export interface NormalizedCRMMetrics {
  totalLeads: number;
  paidProjectsCount: number;
  conversionRate: number;
  activePipelineValue: number;
  unpaidPipelineValue: number;
}

export function normalizeCRMMetrics(projects: NormalizedProject[]): NormalizedCRMMetrics {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const totalLeads = safeProjects.length;
  const paidProjects = safeProjects.filter(p => p.paymentStatus === "paid");
  const paidProjectsCount = paidProjects.length;
  const conversionRate = totalLeads > 0 ? Math.round((paidProjectsCount / totalLeads) * 100) : 0;

  const activePipelineValue = safeProjects.reduce((acc, p) => {
    const pkg = p.selectedPackage || p.purchasedPlan;
    const baseVal = pkg === "foundation" ? 9999 : pkg === "growth" ? 19999 : pkg === "dominance" ? 39999 : 0;
    return acc + baseVal;
  }, 0);

  const unpaidPipelineValue = safeProjects
    .filter(p => p.paymentStatus !== "paid")
    .reduce((acc, p) => {
      const pkg = p.selectedPackage || p.purchasedPlan;
      const baseVal = pkg === "foundation" ? 9999 : pkg === "growth" ? 19999 : pkg === "dominance" ? 39999 : 0;
      return acc + baseVal;
    }, 0);

  return {
    totalLeads,
    paidProjectsCount,
    conversionRate,
    activePipelineValue,
    unpaidPipelineValue,
  };
}
