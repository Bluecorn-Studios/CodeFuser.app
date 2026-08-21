export type OnboardingStepStatus = "Complete" | "Waiting for Customer" | "Needs Review";
export type AssetStepKey = "1" | "2" | "3" | "4" | "5";

/**
 * Validates whether a string is an actual valid URL (e.g., Drive, Dropbox, HTTP/HTTPS link).
 * Explicitly rejects non-URL strings like "Uploaded photos", "My Drive", "hello", "blank", etc.
 */
export function isValidUrl(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const raw = str.replace(/^Provided:\s*/i, "").trim();
  const lower = raw.toLowerCase();

  // Blacklisted non-URL strings
  const invalidTokens = [
    "uploaded photos",
    "my drive",
    "photos",
    "hello",
    "test",
    "blank",
    "pending",
    "upload_pending",
    "link_pending",
    "upload_pending: file",
    "upload_pending: link",
    "file",
    "link",
    "none",
    "no",
    "upload"
  ];
  if (invalidTokens.includes(lower)) {
    return false;
  }

  // Known cloud/drive prefixes
  if (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("drive.google.com") ||
    lower.startsWith("www.google.com/drive") ||
    lower.startsWith("dropbox.com") ||
    lower.startsWith("www.dropbox.com") ||
    lower.startsWith("onedrive.") ||
    lower.startsWith("box.com") ||
    lower.startsWith("icloud.com")
  ) {
    return true;
  }

  // Attempt URL parsing with https:// prefix
  try {
    const urlToTest = lower.startsWith("http://") || lower.startsWith("https://") ? lower : `https://${lower}`;
    const parsed = new URL(urlToTest);
    // Must have hostname with at least one dot and length >= 4 (e.g. drive.google.com, dropbox.com)
    return Boolean(parsed.hostname && parsed.hostname.includes(".") && parsed.hostname.length >= 4);
  } catch {
    return false;
  }
}

/**
 * Validates whether a domain name is valid (e.g., example.com, www.example.com).
 * Rejects "blank", "hello", "my website", etc.
 */
export function isValidDomainName(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const raw = str.replace(/^Provided:\s*/i, "").replace(/^Help buy\s*/i, "").trim();
  const lower = raw.toLowerCase();

  const invalidTokens = [
    "blank",
    "my website",
    "hello",
    "test",
    "domain_pending",
    "pending",
    "no",
    "own",
    "upload_pending",
    "none"
  ];
  if (invalidTokens.includes(lower)) {
    return false;
  }

  // Must contain a dot separating domain and TLD, e.g. domain.com
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  if (domainRegex.test(lower)) {
    return true;
  }

  // Also check if user entered URL format like https://example.com
  try {
    const urlToTest = lower.startsWith("http://") || lower.startsWith("https://") ? lower : `https://${lower}`;
    const parsed = new URL(urlToTest);
    return Boolean(parsed.hostname && parsed.hostname.includes(".") && parsed.hostname.length >= 4);
  } catch {
    return false;
  }
}

/**
 * Validates services/document text content.
 * Rejects empty, whitespace-only, or generic pending strings.
 */
export function isValidServicesContent(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const raw = str.replace(/^Provided:\s*/i, "").trim();
  const lower = raw.toLowerCase();

  const invalidTokens = [
    "",
    "text_pending",
    "pending",
    "no",
    "none",
    "upload_pending",
    "blank",
    "test",
    "hello"
  ];

  if (invalidTokens.includes(lower)) {
    return false;
  }

  return raw.length >= 3;
}

/**
 * Validates file/photo/logo asset.
 */
export function isValidFileOrImage(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return false;
  const raw = str.replace(/^Provided:\s*/i, "").trim();
  const lower = raw.toLowerCase();

  const invalidTokens = [
    "",
    "upload_pending",
    "link_pending",
    "pending",
    "no",
    "none",
    "upload_pending: file",
    "upload_pending: link",
    "uploaded photos",
    "my drive",
    "photos",
    "test",
    "blank"
  ];

  if (invalidTokens.includes(lower)) {
    return false;
  }

  if (
    raw.startsWith("data:image") ||
    raw.startsWith("data:application") ||
    isValidUrl(raw) ||
    lower.includes("uploaded ") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".svg") ||
    lower.includes(".webp") ||
    lower.includes(".pdf")
  ) {
    return true;
  }

  return false;
}

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

    // Check if explicitly finished / approved deliverable exists
    if (
      project.logoApproved === true ||
      project.logoDelivered === true ||
      vLower.startsWith("delivered:") ||
      vLower.startsWith("completed:")
    ) {
      return "Complete";
    }

    // Customer Provided Something -> Check if valid file or valid URL
    if (v.startsWith("Provided:") || v.startsWith("data:image") || v.startsWith("http://") || v.startsWith("https://")) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();

      if (isValidUrl(payloadVal) || isValidFileOrImage(payloadVal)) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    // "help", "Confirmed: help", "link_pending", "upload_pending", or empty -> Waiting for Customer
    return "Waiting for Customer";
  }

  // STEP 3: Photos / Gallery
  if (stepKey === "3") {
    const rawGallery = project.galleryReady || "";
    if (typeof rawGallery !== "string") return "Waiting for Customer";
    const v = rawGallery.trim();
    const vLower = v.toLowerCase();

    // Check if explicitly finished / approved media exists
    if (
      project.galleryApproved === true ||
      project.galleryDelivered === true ||
      vLower.startsWith("delivered:") ||
      vLower.startsWith("completed:")
    ) {
      return "Complete";
    }

    // Customer Provided Something -> Check if valid URL or valid uploaded file(s)
    if (
      v.startsWith("Provided:") ||
      v.startsWith("data:image") ||
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      vLower.includes("uploaded")
    ) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();

      if (isValidUrl(payloadVal) || isValidFileOrImage(payloadVal)) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    // "help", "stock", "link_pending", "upload_pending", or empty -> Waiting for Customer
    return "Waiting for Customer";
  }

  // STEP 4: Services
  if (stepKey === "4") {
    const rawCopy = project.contentReady || "";
    if (typeof rawCopy !== "string") return "Waiting for Customer";
    const v = rawCopy.trim();
    const vLower = v.toLowerCase();

    // Check if explicitly finished / approved copy exists
    if (
      project.contentApproved === true ||
      project.contentDelivered === true ||
      vLower.startsWith("delivered:") ||
      vLower.startsWith("completed:")
    ) {
      return "Complete";
    }

    // Customer Provided Something -> Check if valid text or doc
    if (v.startsWith("Provided:") || (v.length > 0 && v !== "help" && v !== "Confirmed: help" && v !== "no_help" && v !== "text_pending")) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (isValidServicesContent(payloadVal) || isValidFileOrImage(payloadVal)) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    // "help", "Confirmed: help", "no_help", "text_pending", or empty -> Waiting for Customer
    return "Waiting for Customer";
  }

  // STEP 5: Domain
  if (stepKey === "5") {
    const rawDomain = project.hasDomain || "";
    if (typeof rawDomain !== "string") return "Waiting for Customer";
    const v = rawDomain.trim();
    const vLower = v.toLowerCase();

    // Check if Domain is actually Connected / Verified -> Complete
    const isDomainConnected = Boolean(
      project.domainConnected === true ||
      project.dnsVerified === true ||
      vLower.startsWith("verified:") ||
      vLower.startsWith("connected:") ||
      (project.websiteStatus === "live" && project.customDomain)
    );

    if (isDomainConnected) {
      return "Complete";
    }

    // Customer Provided Domain Name
    if (v.startsWith("Provided:") || (v.length > 0 && v !== "help" && v !== "Confirmed: help" && v !== "not_required" && v !== "no" && v !== "domain_pending")) {
      const payloadVal = v.replace(/^Provided:\s*/i, "").trim();
      if (isValidDomainName(payloadVal) || isValidUrl(payloadVal)) {
        return "Needs Review";
      }
      return "Waiting for Customer";
    }

    // "help", "subdomain", "not_required", "domain_pending", "no", or empty -> Waiting for Customer
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

  // REQUIREMENT 12: Overall progress counts Complete items only
  const completedCount = statuses.filter((s) => s.status === "Complete").length;

  return {
    completedCount,
    totalCount: 5,
    statuses,
    isAllComplete: completedCount === 5
  };
}
