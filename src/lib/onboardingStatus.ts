export type OnboardingStepStatus = "Complete" | "Waiting for Customer" | "Needs Review";
export type AssetStepKey = "1" | "2" | "3" | "4" | "5";

export function getOnboardingStepStatus(
  stepKey: AssetStepKey,
  project: any
): OnboardingStepStatus {
  if (!project) return "Waiting for Customer";

  // STEP 1: Business Details
  if (stepKey === "1") {
    const hasName = Boolean(project.businessName && project.businessName.trim().length > 0);
    const hasContact = Boolean(
      project.clientName &&
      project.clientName.trim().length > 0 &&
      (project.whatsapp || project.email || project.phone)
    );
    if (hasName && hasContact) {
      return "Complete";
    }
    return "Waiting for Customer";
  }

  // STEP 2: Logo
  if (stepKey === "2") {
    const rawLogo = project.hasLogo || "";
    if (typeof rawLogo !== "string") return "Waiting for Customer";
    const v = rawLogo.trim();
    const vLower = v.toLowerCase();

    // CodeFuser Handles It
    if (
      v === "Confirmed: help" ||
      v === "help" ||
      vLower.includes("codefuser help") ||
      vLower.includes("design logo") ||
      vLower.includes("not_required")
    ) {
      return "Complete";
    }

    // Customer Must Provide Something
    if (
      v.startsWith("Provided:") ||
      v.startsWith("data:image") ||
      v.startsWith("http://") ||
      v.startsWith("https://")
    ) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (
        payloadVal &&
        payloadVal !== "upload_pending" &&
        payloadVal !== "link_pending" &&
        payloadVal !== "pending" &&
        payloadVal !== "upload_pending: file" &&
        payloadVal !== "upload_pending: link"
      ) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    return "Waiting for Customer";
  }

  // STEP 3: Photos / Gallery
  if (stepKey === "3") {
    const rawGallery = project.galleryReady || "";
    if (typeof rawGallery !== "string") return "Waiting for Customer";
    const v = rawGallery.trim();
    const vLower = v.toLowerCase();

    // CodeFuser Handles It
    if (
      v === "Confirmed: help" ||
      v === "help" ||
      vLower.includes("stock") ||
      vLower.includes("curated") ||
      vLower.includes("not_required")
    ) {
      return "Complete";
    }

    // Customer Must Provide Something
    if (
      v.startsWith("Provided:") ||
      v.startsWith("data:image") ||
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      vLower.includes("uploaded")
    ) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (
        payloadVal &&
        payloadVal !== "upload_pending" &&
        payloadVal !== "link_pending" &&
        payloadVal !== "pending" &&
        payloadVal !== "upload_pending: file" &&
        payloadVal !== "upload_pending: link"
      ) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    return "Waiting for Customer";
  }

  // STEP 4: Services
  if (stepKey === "4") {
    const rawCopy = project.contentReady || "";
    if (typeof rawCopy !== "string") return "Waiting for Customer";
    const v = rawCopy.trim();
    const vLower = v.toLowerCase();

    // CodeFuser Handles It
    if (
      v === "Confirmed: help" ||
      v === "help" ||
      v === "no_help" ||
      vLower.includes("codefuser write") ||
      vLower.includes("copywriting") ||
      vLower.includes("not_required")
    ) {
      return "Complete";
    }

    // Customer Must Provide Something
    if (v.startsWith("Provided:") || v.length > 0) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (
        payloadVal &&
        payloadVal !== "text_pending" &&
        payloadVal !== "pending" &&
        payloadVal !== "no" &&
        payloadVal !== "upload_pending"
      ) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    return "Waiting for Customer";
  }

  // STEP 5: Domain
  if (stepKey === "5") {
    const rawDomain = project.hasDomain || "";
    if (typeof rawDomain !== "string") return "Waiting for Customer";
    const v = rawDomain.trim();
    const vLower = v.toLowerCase();

    // CodeFuser Handles It
    if (
      v === "Provided: not_required" ||
      v === "not_required" ||
      vLower.includes("subdomain") ||
      v === "Confirmed: help" ||
      v === "help" ||
      vLower.includes("register domain") ||
      vLower.includes("buy for me")
    ) {
      return "Complete";
    }

    // Customer Must Provide Something
    if (v.startsWith("Provided:") || v.length > 0) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (
        payloadVal &&
        payloadVal !== "domain_pending" &&
        payloadVal !== "pending" &&
        payloadVal !== "no" &&
        payloadVal !== "own" &&
        payloadVal !== "upload_pending"
      ) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    return "Waiting for Customer";
  }

  return "Waiting for Customer";
}

export function getOnboardingSummary(project: any) {
  const steps: AssetStepKey[] = ["1", "2", "3", "4", "5"];
  const statuses = steps.map((key) => ({
    stepKey: key,
    status: getOnboardingStepStatus(key, project)
  }));

  const completedCount = statuses.filter(
    (s) => s.status === "Complete" || s.status === "Needs Review"
  ).length;

  return {
    completedCount,
    totalCount: 5,
    statuses,
    isAllComplete: completedCount === 5
  };
}
