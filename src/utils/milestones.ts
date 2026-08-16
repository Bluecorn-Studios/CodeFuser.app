export interface CanonicalMilestone {
  index: number;
  id: string;
  statusKey: string;
  label: string;
  shortLabel: string;
  details: string;
  happening: string;
  waitingFor: string;
  doing: string;
  next: string;
}

export const CANONICAL_MILESTONES: CanonicalMilestone[] = [
  {
    index: 0,
    id: "payment_received",
    statusKey: "payment_received",
    label: "Payment Received",
    shortLabel: "Payment",
    details: "Onboarding fee processed and project confirmed.",
    happening: "Your premium onboarding fee has been fully processed and confirmed.",
    waitingFor: "Setting up your custom high-speed cloud project workspace.",
    doing: "Provisioning your secure developer sandbox environment and template repository.",
    next: "Creating your custom website project specifications draft."
  },
  {
    index: 1,
    id: "project_created",
    statusKey: "project_created",
    label: "Project Created",
    shortLabel: "Created",
    details: "Secure project workspace initialized and active.",
    happening: "Your secure project environment is fully initialized and active.",
    waitingFor: "Your preference selections and business information assets.",
    doing: "Analyzing your selected package specs and aligning our design specialists.",
    next: "Onboarding and digital assets collection session."
  },
  {
    index: 2,
    id: "asset_collection",
    statusKey: "asset_collection",
    label: "Asset Collection",
    shortLabel: "Assets",
    details: "Gathering business details, logos, copywriting, and photos.",
    happening: "We're waiting for your business details or help selections before starting design.",
    waitingFor: "Providing your assets (logo, domain, copywriting) OR selecting 'Need Help' in the setup wizard.",
    doing: "Preparing visual style placeholders and copywriting guides where assistance is selected.",
    next: "Initiating custom visual interface design and mock wireframes."
  },
  {
    index: 3,
    id: "design_started",
    statusKey: "design_started",
    label: "Design Started",
    shortLabel: "Design",
    details: "Drafting custom high-fidelity layouts, typography, and color schemes.",
    happening: "Our creative design team is drafting your custom visual mockups and layouts.",
    waitingFor: "Our professional designers to finalize high-fidelity responsive page layouts.",
    doing: "Fine-tuning colors, typography schemes, layout structures, and visual page stylings.",
    next: "Handing over the approved layout specs to our frontend engineering team."
  },
  {
    index: 4,
    id: "development",
    statusKey: "development",
    label: "Development",
    shortLabel: "Dev",
    details: "Coding responsive frontend components and server routes.",
    happening: "Our engineers are actively coding your high-performance responsive website.",
    waitingFor: "Our dev team to complete full component codes and search optimization.",
    doing: "Writing semantic React components, setting up clean motion animations, and programming route codes.",
    next: "Opening the interactive draft link for your official client review and approval."
  },
  {
    index: 5,
    id: "client_review",
    statusKey: "client_review",
    label: "Client Review",
    shortLabel: "Review",
    details: "Interactive draft ready for client inspection and feedback.",
    happening: "Your custom interactive website draft is complete and ready for your official review.",
    waitingFor: "Your critical feedback on layouts, page visual appeal, text copywriting, and animations.",
    doing: "Preparing our engineers to address any feedback or refinement requests you submit.",
    next: "Applying necessary revision updates or moving directly into final quality assurance."
  },
  {
    index: 6,
    id: "revisions",
    statusKey: "revisions",
    label: "Revisions (if required)",
    shortLabel: "Revisions",
    details: "Refining pages based on client feedback notes (or bypassed if approved directly).",
    happening: "We are actively implementing your revision requests and fine-tuning specified details.",
    waitingFor: "Our visual engineers and content copywriters to complete your requested edits.",
    doing: "Polishing interface details, updating text assets, and updating layout components.",
    next: "Publishing the updated layout and moving to final testing."
  },
  {
    index: 7,
    id: "testing",
    statusKey: "testing",
    label: "Testing",
    shortLabel: "Testing",
    details: "Comprehensive speed, mobile responsiveness, and security quality check.",
    happening: "We are performing comprehensive quality assurance and device testing checks.",
    waitingFor: "Our specialists to verify all responsive, speed, and security check criteria.",
    doing: "Auditing page load speeds, testing mobile responsiveness, verifying contact forms, and security.",
    next: "Publishing to your production domain for the official live public release."
  },
  {
    index: 8,
    id: "launch",
    statusKey: "launch",
    label: "Launch",
    shortLabel: "Launch",
    details: "Final launch verification, DNS propagation, and live public release.",
    happening: "Your website is fully optimized, verified, and ready to go live to the world.",
    waitingFor: "Your green-light confirmation to trigger DNS propagation and publish.",
    doing: "Preparing live server routing, cache optimization, and search engine registrations.",
    next: "Official project handover and population of your deliverables vault."
  }
];

export const TOTAL_CANONICAL_STAGES = CANONICAL_MILESTONES.length; // 9

/**
 * Resolves a project's status string and asset readiness to one of 0..8 canonical stages.
 */
export function getCanonicalStageIndex(statusVal: any, hasEmptyAssets: boolean = false): number {
  if (!statusVal || typeof statusVal !== "string") {
    return hasEmptyAssets ? 2 : 3;
  }

  const s = statusVal.trim().toLowerCase();

  // Canonical exact matches or direct IDs
  if (s === "launch" || s === "launched" || s === "delivery" || s === "delivered" || s === "completed" || s === "live" || s.includes("live") || s.includes("launch") || s.includes("deliver")) {
    return 8; // Stage 9 (index 8: Launch)
  }
  if (s === "testing" || s === "qa" || s.includes("testing") || s.includes("qa") || s.includes("audit")) {
    return 7; // Stage 8 (index 7: Testing)
  }
  if (s === "revisions" || s === "revision" || s.includes("revision")) {
    return 6; // Stage 7 (index 6: Revisions)
  }
  if (s === "client_review" || s === "review" || s.includes("review") || s.includes("checklist ready")) {
    return 5; // Stage 6 (index 5: Client Review)
  }
  if (s === "development" || s === "dev" || s === "in_progress" || s === "inprogress" || s.includes("dev") || s.includes("core development") || s.includes("building") || s.includes("coding")) {
    return 4; // Stage 5 (index 4: Development)
  }
  if (s === "design_started" || s === "design" || s.includes("design") || s.includes("wireframe") || s.includes("specs audited")) {
    return 3; // Stage 4 (index 3: Design Started)
  }
  if (s === "asset_collection" || s === "assets" || s.includes("asset") || s.includes("collect")) {
    return 2; // Stage 3 (index 2: Asset Collection)
  }
  if (s === "project_created" || s === "created" || s === "draft" || s === "onboarding" || s === "new" || s.includes("created")) {
    return hasEmptyAssets ? 2 : 1;
  }
  if (s === "payment_received" || s === "paid" || s === "payment" || s.includes("payment")) {
    return 0; // Stage 1 (index 0: Payment Received)
  }

  // Heuristic fallback for onboarding
  if (hasEmptyAssets) {
    return 2; // Asset Collection
  }
  return 3; // Design Started if assets complete
}

/**
 * Returns human-friendly label for any stage index (0..8).
 */
export function getCanonicalStatusLabel(stageIndex: number): string {
  const milestone = CANONICAL_MILESTONES[stageIndex];
  return milestone ? milestone.label : "In Progress";
}

/**
 * Returns stage expectations object for any stage index (0..8).
 */
export function getCanonicalStageExpectations(stageIndex: number) {
  const milestone = CANONICAL_MILESTONES[stageIndex];
  if (milestone) {
    return {
      status: milestone.label,
      happening: milestone.happening,
      waitingFor: milestone.waitingFor,
      doing: milestone.doing,
      next: milestone.next
    };
  }
  return {
    status: "Project In Progress",
    happening: "Our team is actively working on your website project.",
    waitingFor: "Upcoming milestone completion.",
    doing: "Coordinating development and design assets.",
    next: "Next milestone review session."
  };
}

/**
 * Calculates deterministic progress percentage (0..100) based on the 9 canonical stages.
 * 100% is only returned if isLive is true or stage is explicitly complete.
 */
export function calculateCanonicalProgress(
  stageIndex: number,
  isLive: boolean = false,
  completedChecklistCount: number = 0,
  totalChecklistCount: number = 5
): number {
  if (isLive) return 100;

  switch (stageIndex) {
    case 0: // Payment Received
      return 10;
    case 1: // Project Created
      return 20;
    case 2: { // Asset Collection
      const ratio = totalChecklistCount > 0 ? completedChecklistCount / totalChecklistCount : 0;
      return Math.round(25 + ratio * 10); // 25% - 35%
    }
    case 3: // Design Started
      return 45;
    case 4: // Development
      return 60;
    case 5: // Client Review
      return 75;
    case 6: // Revisions
      return 85;
    case 7: // Testing
      return 92;
    case 8: // Launch (Build ready, waiting or verifying live launch)
      return 98;
    default:
      return Math.min(95, Math.max(10, Math.round(((stageIndex + 1) / TOTAL_CANONICAL_STAGES) * 100)));
  }
}

/**
 * Resolves deterministic revision state for stage 6.
 * If stage > 6 (i.e. Testing or Launch), revision is marked Bypassed / Completed rather than pending.
 */
export function getRevisionStageState(currentStageIndex: number, hasRevisionRequests: boolean = false) {
  if (currentStageIndex > 6) {
    return {
      isDone: true,
      isBypassed: !hasRevisionRequests,
      statusLabel: hasRevisionRequests ? "✓ Revisions Completed" : "✓ Skipped (Direct Approval)"
    };
  }
  if (currentStageIndex === 6) {
    return {
      isDone: false,
      isBypassed: false,
      statusLabel: "● Revisions In Progress"
    };
  }
  return {
    isDone: false,
    isBypassed: false,
    statusLabel: "Pending (If Needed)"
  };
}
