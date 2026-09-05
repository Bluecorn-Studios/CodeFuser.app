import { getSupabase } from "./supabase.js";
import crypto from "crypto";

export interface ReviewRecord {
  id: string;
  projectId: string;
  customerId?: string | null;
  customerName: string;
  businessName: string;
  rating: number; // 1 to 5
  answer1: string; // What did you like most about CodeFuser?
  answer2: string; // What could we improve?
  answer3: string; // Would you recommend CodeFuser to another business? Why?
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Memory read cache (accelerator only - Supabase is the authoritative source of truth)
const memoryCache = new Map<string, ReviewRecord>();

// Preview/simulation review store (strictly isolated from production DB)
const previewReviews = new Map<string, ReviewRecord>();

function isPreviewProjectId(projectId: string): boolean {
  return (
    projectId.startsWith("sim_") ||
    projectId.startsWith("demo_") ||
    projectId.startsWith("preview_") ||
    projectId === "preview"
  );
}

/**
 * Fetch a customer review for a specific project from Supabase.
 */
export async function getReviewByProjectId(projectId: string): Promise<ReviewRecord | null> {
  if (!projectId) return null;

  // Isolated preview simulation
  if (isPreviewProjectId(projectId)) {
    for (const rev of previewReviews.values()) {
      if (rev.projectId === projectId) return rev;
    }
    return null;
  }

  try {
    const supabase = getSupabase();

    // 1. Try public.reviews table first
    try {
      const { data: revData, error: revErr } = await supabase
        .from("reviews")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (!revErr && revData) {
        const norm = normalizeReviewRecord(revData);
        memoryCache.set(norm.id, norm);
        return norm;
      }
    } catch (e) {
      // Table may not exist yet, fallback to project-embedded store
    }

    // 2. Query projects table in Supabase
    const { data: projData, error: projErr } = await supabase
      .from("projects")
      .select("id, onboarding, client_name, business_name")
      .eq("id", projectId)
      .maybeSingle();

    if (!projErr && projData?.onboarding?.review) {
      const norm = normalizeReviewRecord(projData.onboarding.review);
      memoryCache.set(norm.id, norm);
      return norm;
    }

    // Check memory cache only if DB confirmed no record
    return null;
  } catch (err) {
    console.error("[Reviews Store] Error retrieving review from Supabase for project:", projectId, err);
    throw new Error("Unable to retrieve review from database.");
  }
}

/**
 * Durably save a new customer review to Supabase.
 * Throws an explicit error if Supabase write fails.
 */
export async function saveReview(data: {
  projectId: string;
  customerId?: string | null;
  customerName: string;
  businessName: string;
  rating: number;
  answer1: string;
  answer2: string;
  answer3: string;
  published?: boolean;
}): Promise<ReviewRecord> {
  const { projectId } = data;

  if (!projectId) {
    throw new Error("Project ID is required to submit a review.");
  }

  // Handle preview simulation mode (isolated from production Supabase)
  if (isPreviewProjectId(projectId)) {
    for (const rev of previewReviews.values()) {
      if (rev.projectId === projectId) return rev;
    }
    const simReview: ReviewRecord = {
      id: "rev_sim_" + crypto.randomBytes(6).toString("hex"),
      projectId,
      customerId: data.customerId || null,
      customerName: data.customerName || "Preview Client",
      businessName: data.businessName || "Preview Business",
      rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
      answer1: data.answer1 || "",
      answer2: data.answer2 || "",
      answer3: data.answer3 || "",
      published: data.published ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    previewReviews.set(simReview.id, simReview);
    return simReview;
  }

  // Check duplicate review submission in Supabase
  const existing = await getReviewByProjectId(projectId);
  if (existing) {
    return existing; // Return existing persisted review (enforce one review per project)
  }

  const nowIso = new Date().toISOString();
  const review: ReviewRecord = {
    id: "rev_" + crypto.randomBytes(8).toString("hex"),
    projectId,
    customerId: data.customerId || null,
    customerName: data.customerName || "Valued Client",
    businessName: data.businessName || "Business",
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    answer1: data.answer1 || "",
    answer2: data.answer2 || "",
    answer3: data.answer3 || "",
    published: data.published ?? false,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  const supabase = getSupabase();
  let writeSucceeded = false;
  let lastDbError: any = null;

  // 1. Attempt write to dedicated public.reviews table in Supabase
  try {
    const { error: revInsertErr } = await supabase.from("reviews").insert([
      {
        id: review.id,
        project_id: review.projectId,
        customer_id: review.customerId,
        customer_name: review.customerName,
        business_name: review.businessName,
        rating: review.rating,
        answer1: review.answer1,
        answer2: review.answer2,
        answer3: review.answer3,
        published: review.published,
        created_at: review.createdAt,
        updated_at: review.updatedAt
      }
    ]);

    if (!revInsertErr) {
      writeSucceeded = true;
    } else {
      lastDbError = revInsertErr;
    }
  } catch (e) {
    lastDbError = e;
  }

  // 2. Also write to projects table in Supabase for durable persistence
  try {
    const { data: projectRow, error: fetchErr } = await supabase
      .from("projects")
      .select("id, onboarding")
      .eq("id", projectId)
      .maybeSingle();

    if (!fetchErr && projectRow) {
      const existingOnboarding = projectRow.onboarding || {};
      const { error: updateErr } = await supabase
        .from("projects")
        .update({
          onboarding: {
            ...existingOnboarding,
            review
          },
          updated_at: nowIso
        })
        .eq("id", projectId);

      if (!updateErr) {
        writeSucceeded = true;
      } else {
        lastDbError = updateErr;
      }
    } else if (fetchErr) {
      lastDbError = fetchErr;
    }
  } catch (e) {
    lastDbError = e;
  }

  // CRITICAL: If Supabase durable write failed completely, do NOT pretend it was saved
  if (!writeSucceeded) {
    console.error("[Reviews Store] Critical: Failed to durably persist review to Supabase:", lastDbError);
    throw new Error("Unable to save review to database. Please try again.");
  }

  // Update memory cache only after verified DB persistence
  memoryCache.set(review.id, review);
  return review;
}

/**
 * Update publication status of a review in Supabase.
 */
export async function updateReviewPublishStatus(reviewId: string, published: boolean): Promise<ReviewRecord | null> {
  if (!reviewId) return null;

  // Handle preview simulation
  if (reviewId.startsWith("rev_sim_")) {
    const sim = previewReviews.get(reviewId);
    if (sim) {
      sim.published = published;
      sim.updatedAt = new Date().toISOString();
      return sim;
    }
    return null;
  }

  const supabase = getSupabase();
  const nowIso = new Date().toISOString();
  let updatedRecord: ReviewRecord | null = null;
  let writeSucceeded = false;

  // 1. Try updating public.reviews table
  try {
    const { data: updatedRev, error: revErr } = await supabase
      .from("reviews")
      .update({ published, updated_at: nowIso })
      .eq("id", reviewId)
      .select("*")
      .maybeSingle();

    if (!revErr && updatedRev) {
      updatedRecord = normalizeReviewRecord(updatedRev);
      writeSucceeded = true;
    }
  } catch (e) {
    // Ignore if table not present
  }

  // 2. Locate and update in projects table
  try {
    const { data: projects, error: projErr } = await supabase
      .from("projects")
      .select("id, onboarding");

    if (!projErr && Array.isArray(projects)) {
      for (const proj of projects) {
        if (proj.onboarding?.review?.id === reviewId) {
          const updatedRev: ReviewRecord = {
            ...proj.onboarding.review,
            published,
            updatedAt: nowIso
          };

          const { error: updateErr } = await supabase
            .from("projects")
            .update({
              onboarding: {
                ...proj.onboarding,
                review: updatedRev
              },
              updated_at: nowIso
            })
            .eq("id", proj.id);

          if (!updateErr) {
            updatedRecord = updatedRev;
            writeSucceeded = true;
          }
          break;
        }
      }
    }
  } catch (e) {
    console.error("[Reviews Store] Error syncing publish status to projects table:", e);
  }

  if (!writeSucceeded && !updatedRecord) {
    throw new Error(`Review with ID "${reviewId}" not found or failed to update in Supabase.`);
  }

  if (updatedRecord) {
    memoryCache.set(updatedRecord.id, updatedRecord);
  }

  return updatedRecord;
}

/**
 * Retrieve all reviews from Supabase for Admin Mission Control.
 */
export async function getAllReviewsForAdmin(): Promise<ReviewRecord[]> {
  const reviewsMap = new Map<string, ReviewRecord>();

  try {
    const supabase = getSupabase();

    // 1. Read from public.reviews table
    try {
      const { data: revList, error: revErr } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!revErr && Array.isArray(revList)) {
        for (const item of revList) {
          const norm = normalizeReviewRecord(item);
          reviewsMap.set(norm.id, norm);
        }
      }
    } catch (e) {
      // Ignore if table not present
    }

    // 2. Read from projects table
    const { data: projList, error: projErr } = await supabase
      .from("projects")
      .select("id, client_name, business_name, onboarding, created_at")
      .neq("id", "c0090000-0000-0000-0000-000000000001");

    if (!projErr && Array.isArray(projList)) {
      for (const proj of projList) {
        if (proj.onboarding?.review) {
          const rev = proj.onboarding.review;
          const norm = normalizeReviewRecord({
            ...rev,
            customerName: rev.customerName || proj.client_name,
            businessName: rev.businessName || proj.business_name
          });
          reviewsMap.set(norm.id, norm);
        }
      }
    }

    // Update cache
    for (const rev of reviewsMap.values()) {
      memoryCache.set(rev.id, rev);
    }
  } catch (err) {
    console.error("[Reviews Store] Failed to load reviews from Supabase:", err);
    throw new Error("Unable to load reviews from database.");
  }

  return Array.from(reviewsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Retrieve publicly visible (published = true) reviews with sanitized fields.
 */
export async function getPublicPublishedReviews(): Promise<
  Array<{
    id: string;
    businessName: string;
    customerName: string;
    rating: number;
    answer1: string;
    answer2: string;
    answer3: string;
    published: boolean;
    createdAt: string;
  }>
> {
  const all = await getAllReviewsForAdmin();
  return all
    .filter((r) => r.published === true)
    .map((r) => ({
      id: r.id,
      businessName: r.businessName,
      customerName: r.customerName,
      rating: r.rating,
      answer1: r.answer1,
      answer2: r.answer2,
      answer3: r.answer3,
      published: true,
      createdAt: r.createdAt
    }));
}

function normalizeReviewRecord(raw: any): ReviewRecord {
  return {
    id: raw.id || "rev_unknown",
    projectId: raw.projectId || raw.project_id || "",
    customerId: raw.customerId || raw.customer_id || null,
    customerName: raw.customerName || raw.customer_name || "Valued Client",
    businessName: raw.businessName || raw.business_name || "Business Owner",
    rating: typeof raw.rating === "number" ? raw.rating : Math.max(1, Math.min(5, Number(raw.rating) || 5)),
    answer1: raw.answer1 || "",
    answer2: raw.answer2 || "",
    answer3: raw.answer3 || "",
    published: raw.published === true,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || raw.createdAt || raw.created_at || new Date().toISOString()
  };
}

